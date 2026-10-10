import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ConductorPanel from "./pages/ConductorPanel";

function Protegido({ children, roles }: { children: React.ReactNode; roles?: ("ADMIN" | "CONDUCTOR" | "CLIENTE")[] }) {
  const { sesion } = useAuth();
  const location = useLocation();

  if (!sesion) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(sesion.rol)) {
    if (sesion.rol === "ADMIN") return <Navigate to="/admin" replace />;
    if (sesion.rol === "CONDUCTOR") return <Navigate to="/conductor" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RouterApp() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  if (sesion && sesion.rol === "CLIENTE") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 text-slate-600">
        <p>Panel {sesion.rol} en construcción.</p>
        <button
          onClick={() => {
            logout();
            navigate("/", { replace: true });
          }}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          sesion && sesion.rol === "ADMIN" ? (
            <Navigate to="/admin" replace />
          ) : sesion && sesion.rol === "CONDUCTOR" ? (
            <Navigate to="/conductor" replace />
          ) : (
            <Inicio />
          )
        }
      />
      <Route path="/login" element={sesion ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/admin"
        element={
          <Protegido roles={["ADMIN"]}>
            <AdminDashboard />
          </Protegido>
        }
      />
      <Route
        path="/conductor"
        element={
          <Protegido roles={["CONDUCTOR"]}>
            <ConductorPanel />
          </Protegido>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={sesion ? (sesion.rol === "ADMIN" ? "/admin" : sesion.rol === "CONDUCTOR" ? "/conductor" : "/") : "/"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterApp />
      </AuthProvider>
    </BrowserRouter>
  );
}