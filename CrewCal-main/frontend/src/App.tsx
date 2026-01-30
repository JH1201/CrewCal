import { Routes, Route, Navigate } from "react-router-dom";
import CalendarHome from "./pages/CalendarHome";
import LoginPage from "./pages/LoginPage";
import InvitePage from "./pages/InvitePage";
import OAuthCallback from "./pages/OAuthCallback";
import { getToken } from "./lib/auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth2/callback" element={<OAuthCallback />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="/" element={<RequireAuth><CalendarHome /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
