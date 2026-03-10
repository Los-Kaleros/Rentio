import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openLogin = () => { setAuthMode("login"); setAuthOpen(true); };
  const openRegister = () => { setAuthMode("register"); setAuthOpen(true); };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <span className="text-2xl">🏠</span>
            Rentio
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user.name}
                  <span className="ml-1 text-xs text-gray-400">({user.role})</span>
                </span>
                <Link
                  to="/dashboard"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Odhlásiť
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  Prihlásenie
                </button>
                <button
                  onClick={openRegister}
                  className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Registrácia
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitch={(m) => setAuthMode(m)}
        />
      )}
    </>
  );
}
