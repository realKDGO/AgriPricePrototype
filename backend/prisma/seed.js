import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import bcrypt from "bcrypt";
import { db } from "../src/config/db.js";
import {
  storage,
  uploadImage,
  removeImage,
} from "../src/services/storageService.js";
import { env } from "../src/config/env.js";
import { crops, markets, prices, history } from "./starterData.js";
const stableId = (key) => {
  const h = createHash("sha256").update(`agriprice-seed:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
async function account(role) {
  const email = process.env[`SEED_${role}_EMAIL`],
    password = process.env[`SEED_${role}_PASSWORD`];
  if (!email || !password) return;
  if (password.length < 12 || Buffer.byteLength(password) > 72)
    throw new Error("Seed passwords must be 12–72 bytes.");
  await db.user.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: {
      firstName: role === "ADMIN" ? "System" : "MAO",
      lastName: "Administrator",
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role,
      preference: { create: {} },
    },
  });
}
try {
  if (env.NODE_ENV === "production")
    throw new Error(
      "The development seed is disabled in production. Provision the initial Admin using the separate bootstrap-admin command.",
    );
  await account("ADMIN");
  await account("MAO");
  if (process.env.SEED_SAMPLE_DATA !== "true") {
    console.log("Development accounts initialized. Sample-data seed disabled.");
  } else {
    const client = storage();
    const exists = await client.getBucket(env.SUPABASE_CROP_BUCKET);
    if (exists.error) {
      const result = await client.createBucket(env.SUPABASE_CROP_BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      if (result.error) throw result.error;
    }
    for (const c of crops) {
      const id = stableId(c.id);
      if (await db.crop.findUnique({ where: { id } })) continue;
      const path = fileURLToPath(
        new URL("../../frontend/public" + c.image, import.meta.url),
      );
      const buffer = await readFile(path);
      const uploaded = await uploadImage({
        buffer,
        size: buffer.length,
        mimetype: "image/jpeg",
        originalname: c.image.split("/").pop(),
      });
      try {
        await db.crop.create({
          data: {
            id,
            name: c.name,
            category: c.category,
            unit: c.unit,
            ...uploaded,
          },
        });
      } catch (error) {
        await removeImage(uploaded.imagePath);
        throw error;
      }
    }
    for (const m of markets)
      await db.market.upsert({
        where: { id: stableId(m.id) },
        update: {},
        create: {
          id: stableId(m.id),
          name: m.name,
          location: m.location,
          distanceKm: m.distanceKm,
          transportBaseCost: m.transport,
        },
      });
    for (const p of [...history, ...prices])
      await db.price.upsert({
        where: { id: stableId(p.id) },
        update: {},
        create: {
          id: stableId(p.id),
          cropId: stableId(p.cropId),
          marketId: stableId(p.marketId),
          price: p.price,
          previousPrice: p.previous,
          date: new Date(p.date),
          status: p.status.toUpperCase(),
          source: "Development starter dataset supplied with AgriPrice",
          reviewedAt: p.status === "Verified" ? new Date(p.date) : null,
        },
      });
    console.log(
      "Starter crops, original crop photos, seven markets, and price history seeded. No fabricated forecasts or testimonials inserted.",
    );
  }
} finally {
  await db.$disconnect();
}
