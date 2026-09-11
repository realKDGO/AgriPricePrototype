import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../config/db.js";
import { AppError, wrap } from "../utils/errors.js";
export const authenticate = wrap(async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  let claims;
  try {
    claims = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: "agriprice",
      audience: "agriprice-api",
    });
  } catch {
    throw new AppError(401, "Please sign in to continue.");
  }
  const session = await db.refreshSession.findUnique({
    where: { id: claims.sid },
    include: { user: true },
  });
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt < new Date() ||
    session.userId !== claims.sub ||
    session.user.status !== "ACTIVE"
  )
    throw new AppError(401, "Please sign in again.");
  const setting = await db.systemSetting.findUnique({
    where: { key: "sessionTimeout" },
  });
  if (
    Date.now() - session.lastUsedAt.getTime() >
    Number(setting?.value || 30) * 60000
  ) {
    await db.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    throw new AppError(401, "Your session timed out. Please sign in again.");
  }
  if (Date.now() - session.lastUsedAt.getTime() > 60000)
    await db.refreshSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });
  req.user = session.user;
  req.authSession = session;
  next();
});
export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role)
      ? next()
      : next(
          new AppError(
            403,
            "You do not have permission to perform this action.",
          ),
        );
export const trustedOrigin = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (
    (origin && origin !== new URL(env.FRONTEND_URL).origin) ||
    (!origin && req.cookies?.agriprice_refresh)
  )
    return next(new AppError(403, "This request origin is not allowed."));
  next();
};
