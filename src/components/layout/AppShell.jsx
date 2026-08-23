import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, LogOut, Map, Menu, Settings, Shield, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../state/AuthContext.jsx";
import ToastViewport from "../ui/ToastViewport.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report" },
  { to: "/complaints", label: "Complaints" },
  { to: "/map", label: "Map" },
];

function NavigationLink({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm font-semibold transition ${
          isActive ? "bg-civic text-white" : "text-slate-700 hover:bg-slate-100 hover:text-ink"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-sm font-black text-white">CS</span>
            <span>
              <span className="block text-base font-black tracking-tight">CrowdSense AI</span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">Scalable civic reporting for India</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavigationLink key={item.to} {...item} />
            ))}
            {user && <NavigationLink to="/my-complaints" label="Mine" />}
            {isAdmin && <NavigationLink to="/admin" label="Admin" />}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <NavLink to="/settings" className="btn-ghost" title="Settings">
                  <Settings size={17} />
                  <span className="hidden lg:inline">{user.name}</span>
                </NavLink>
                <button type="button" className="btn-secondary" onClick={logout}>
                  <LogOut size={17} />
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/signin" state={{ from: location }} className="btn-primary">
                <User size={17} />
                Sign in
              </NavLink>
            )}
          </div>

          <button type="button" className="btn-ghost md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] bg-ink/40 md:hidden">
          <div className="ml-auto flex h-full w-[min(86vw,360px)] flex-col bg-white p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <strong>CrowdSense AI</strong>
              <button type="button" className="btn-ghost" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavigationLink key={item.to} {...item} onClick={() => setOpen(false)} />
              ))}
              {user && <NavigationLink to="/my-complaints" label="My complaints" onClick={() => setOpen(false)} />}
              {user && <NavigationLink to="/supported" label="Supported issues" onClick={() => setOpen(false)} />}
              {isAdmin && <NavigationLink to="/admin" label="Admin dashboard" onClick={() => setOpen(false)} />}
              {user ? (
                <button type="button" className="btn-secondary mt-2" onClick={logout}>
                  <LogOut size={17} />
                  Sign out
                </button>
              ) : (
                <NavigationLink to="/signin" label="Sign in" onClick={() => setOpen(false)} />
              )}
            </nav>
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="section flex flex-col gap-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>CrowdSense AI uses SATI Vidisha as pilot data and supports future regions by configuration.</span>
          <span className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><Map size={15} /> Leaflet + OSM</span>
            <span className="inline-flex items-center gap-1"><Shield size={15} /> Role protected</span>
            <span className="inline-flex items-center gap-1"><BarChart3 size={15} /> Analytics ready</span>
          </span>
        </div>
      </footer>
      <ToastViewport />
    </div>
  );
}
