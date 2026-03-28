import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { utilisateur, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const agentRoles = ["Agent", "AdminAgence", "AdminSiege"];
  const isAgent = isAuthenticated && utilisateur && agentRoles.includes(utilisateur.role);

  const navLinks = [
    { to: "/biens", label: "Biens" },
    { to: "/agences", label: "Agences" },
    ...(isAuthenticated && utilisateur?.role === "Client" ? [{ to: "/mon-espace", label: "Mon espace" }] : []),
    ...(isAgent ? [{ to: "/agent", label: "Gestion" }] : []),
    ...(isAuthenticated && (utilisateur?.role === "AdminSiege" || utilisateur?.role === "AdminAgence")
      ? [{ to: "/dashboard", label: "Analytique" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D9D4CC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link
            to="/"
            className="font-display text-xl lg:text-2xl tracking-[0.12em] uppercase text-[#0D0D0D] font-light"
          >
            Ymmo
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="link-underline font-body text-xs font-400 tracking-[0.12em] uppercase text-[#0D0D0D]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <span className="font-body text-xs tracking-widest uppercase text-[#6B6560]">
                  {utilisateur?.prenom} {utilisateur?.nom}
                </span>
                <button
                  onClick={handleLogout}
                  className="link-underline font-body text-xs tracking-[0.12em] uppercase text-[#0D0D0D]"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-xs"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="lg:hidden p-2 text-[#0D0D0D]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-[#D9D4CC] px-6 py-8 flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="font-body text-sm tracking-[0.12em] uppercase text-[#0D0D0D] border-b border-[#D9D4CC] pb-4"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="font-body text-sm tracking-[0.12em] uppercase text-left text-[#0D0D0D]"
            >
              Déconnexion ({utilisateur?.prenom})
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="btn-primary text-xs self-start"
            >
              Connexion
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
