import {
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import FarmerLayout from "../layouts/FarmerLayout";
import MaoLayout from "../layouts/MaoLayout";
import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";
import { useApp } from "../hooks/useApp";
import { Empty, PageSkeleton } from "../components/common/UI";
import Legal from "../pages/public/Legal";
import Home from "../pages/farmer/Home";
import Landing from "../pages/public/Landing";
const Prices = lazy(() => import("../pages/farmer/Prices"));
const CropDetail = lazy(() =>
  import("../pages/farmer/Prices").then((m) => ({ default: m.CropDetail })),
);
const Forecast = lazy(() => import("../pages/farmer/Forecast"));
const Markets = lazy(() => import("../pages/farmer/Markets"));
const Profit = lazy(() => import("../pages/farmer/Profit"));
const Reports = lazy(() => import("../pages/farmer/Reports"));
const Auth = lazy(() => import("../pages/public/Auth"));
import {
  More,
  Profile,
  Settings,
  Help,
  Notifications,
} from "../pages/farmer/Account";
const MaoDashboard = lazy(() => import("../pages/mao/Dashboard"));
const Management = lazy(() => import("../pages/mao/Management"));
const Validation = lazy(() => import("../pages/mao/Validation"));
const MaoSettings = lazy(() => import("../pages/mao/Settings"));
const MaoForecast = lazy(() => import("../pages/mao/Forecast"));
const MaoReports = lazy(() => import("../pages/mao/Reports"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const Accounts = lazy(() => import("../pages/admin/Accounts"));
import {
  Access,
  Audit,
  Monitoring,
  Security,
  Configuration,
  Backups,
  TechnicalReports,
  Contacts,
} from "../pages/admin/System";
function Guard({ role }) {
  const { session, authLoading, data, loading, error, reload } = useApp();
  if (error)
    return (
      <div className="notice" role="alert">
        {error}
        <button className="button" onClick={reload}>
          Try Again
        </button>
      </div>
    );
  if (
    authLoading ||
    (session && (loading || !data.settings.preferences.userId))
  )
    return <PageSkeleton chrome />;
  return session?.role === role && session.status === "ACTIVE" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton chrome />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          {["privacy-policy", "terms", "cookie-policy"].map((kind) => (
            <Route
              key={kind}
              path={`/${kind}`}
              element={<Legal kind={kind} />}
            />
          ))}
          <Route path="/login" element={<Auth key="login" />} />
          <Route
            path="/register"
            element={<Auth key="register" mode="register" />}
          />
          <Route
            path="/forgot-password"
            element={<Auth key="forgot" mode="forgot" />}
          />
        </Route>
        <Route element={<Guard role="FARMER" />}>
          <Route path="/farmer" element={<FarmerLayout />}>
            <Route index element={<Home />} />
            <Route path="prices" element={<Prices />} />
            <Route path="historical" element={<Prices />} />
            <Route path="prices/:cropId" element={<CropDetail />} />
            <Route path="forecast" element={<Forecast />} />
            <Route path="markets" element={<Markets />} />
            <Route path="profit" element={<Profit />} />
            <Route path="reports" element={<Reports />} />
            <Route path="more" element={<More />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Route>
        <Route element={<Guard role="MAO" />}>
          <Route path="/mao" element={<MaoLayout />}>
            <Route index element={<MaoDashboard />} />
            {["crops", "markets", "prices", "history"].map((kind) => (
              <Route
                key={kind}
                path={kind}
                element={<Management key={kind} kind={kind} />}
              />
            ))}
            <Route path="validation" element={<Validation />} />
            <Route path="forecast" element={<MaoForecast />} />
            <Route path="reports" element={<MaoReports />} />
            <Route path="settings" element={<MaoSettings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profit" element={<Profit />} />
            <Route path="recommendations" element={<Markets />} />
          </Route>
        </Route>
        <Route element={<Guard role="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Accounts key="users" />} />
            <Route path="mao-accounts" element={<Accounts key="mao" mao />} />
            <Route path="activity" element={<Audit />} />
            <Route path="access" element={<Access />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="security" element={<Security />} />
            <Route path="backups" element={<Backups />} />
            <Route path="settings" element={<Configuration />} />
            <Route path="reports" element={<TechnicalReports />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <div className="loading">
              <h1>Page not found</h1>
              <Link className="text-link" to="/">
                Return to AgriPrice
              </Link>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}
