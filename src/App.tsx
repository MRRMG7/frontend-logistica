import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ConductorPanel from "./pages/ConductorPanel";
import ClientePanel from "./pages/ClientePanel";
import Registro from "./pages/Registro";

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
  const { sesion } = useAuth();

  if (sesion && sesion.rol === "CLIENTE") {
    return <ClientePanel />;
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
      <Route path="/registro" element={sesion ? <Navigate to="/" replace /> : <Registro />} />
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
