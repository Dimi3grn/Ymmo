import { NavLink, Outlet } from "react-router-dom";
import { Home, CalendarDays, ArrowLeftRight, Users, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const baseLinks = [
  { to: "/agent/biens", label: "Biens", icon: Home },
  { to: "/agent/rdv", label: "Visites", icon: CalendarDays },
  { to: "/agent/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/agent/clients", label: "Clients", icon: Users },
];

const adminLinks = [
  { to: "/agent/utilisateurs", label: "Utilisateurs", icon: Shield },
];

export default function AgentLayout() {
  const { utilisateur } = useAuth();
  const isAdmin = utilisateur?.role === "AdminSiege" || utilisateur?.role === "AdminAgence";
  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#0D0D0D] p-6 shrink-0">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#D4AF6A] mb-8">Espace agent</p>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 font-body text-xs tracking-widest uppercase transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Nav mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D9D4CC] flex">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 font-body text-[9px] tracking-widest uppercase transition-colors ${
                isActive ? "text-[#0D0D0D]" : "text-[#6B6560]"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Contenu */}
      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-10 pb-24 lg:pb-10">
        <Outlet />
      </main>
    </div>
  );
}
