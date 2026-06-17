import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Blocks,
  BookOpen,
  ChevronLeft,
  ChevronUp,
  Clock3,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Moon,
  Settings,
  UserCircle2,
  Users,
  Sun,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import clsx from "clsx";
import projectLogo from "@/assets/Logo maker project.png";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightActions?: ReactNode;
  contentClassName?: string;
};

const NAV_ITEMS = [
  {
    section: "Main",
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    section: "Main",
    label: "AI Guide",
    to: "/chat",
    icon: MessageSquare,
    
  },
  { section: "Main", label: "Route Map", to: "/map", icon: MapPin },
  { section: "Main", label: "Community", to: "/feed", icon: Users },
  { section: "Main", label: "Stories", to: "/stories", icon: FileText },
  {
    section: "System",
    label: "Agents",
    to: "/dashboard",
    icon: Users,
    badge: "7",
  },
  // { section: "System", label: "RAG Pipeline", to: "/chat", icon: Blocks },
  // { section: "System", label: "Logs", to: "/feed", icon: Clock3 },
  { section: "System", label: "Settings", to: "/profile", icon: Settings },
];

export default function AppShell({
  title,
  subtitle,
  children,
  rightActions,
  contentClassName,
}: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const firstName = user?.full_name?.split(" ")[0] ?? "Guest";
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem("app-shell-sidebar-collapsed");
    if (savedState) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "app-shell-sidebar-collapsed",
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const mainItems = NAV_ITEMS.filter((i) => i.section === "Main");
  const systemItems = NAV_ITEMS.filter((i) => i.section === "System");

  return (
    <div className={clsx("min-h-screen bg-mountain-950 text-stone-100")}>
      <aside
        className={clsx(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-mountain-700 bg-mountain-900/90 backdrop-blur-sm transition-[width] duration-300",
          sidebarCollapsed ? "w-[84px]" : "w-[264px]",
        )}
      >
        <div
          className={clsx(
            "h-20 border-b border-mountain-700 flex items-center gap-3",
            sidebarCollapsed ? "px-3 justify-center" : "px-5",
          )}
        >
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/95 ring-1 ring-mountain-500/70 shrink-0">
            <img
              src={projectLogo}
              alt="Yatra Saathi logo"
              className="h-full w-full object-contain object-center scale-[2.8]"
            />
          </div>
          {!sidebarCollapsed && (
            <p className="text-[1.05rem] font-semibold tracking-tight">
              Yaatra <span className="text-saffron-500">Saathi</span>
            </p>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className={clsx(
              "h-9 w-9 items-center justify-center rounded-lg border border-mountain-700 text-stone-400 hover:text-stone-200 hover:bg-mountain-800/70 transition",
              sidebarCollapsed ? "inline-flex" : "ml-auto inline-flex",
            )}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={clsx(
                "w-4 h-4 transition-transform",
                sidebarCollapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        <div
          className={clsx("py-6 space-y-7", sidebarCollapsed ? "px-2" : "px-3")}
        >
          <div>
            {!sidebarCollapsed && (
              <p className="px-2 mb-1.5 text-xs uppercase tracking-[0.14em] text-stone-600">
                Main
              </p>
            )}
            <div className="space-y-0.5">
              {mainItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center rounded-xl py-2.5 text-[0.98rem] transition",
                        sidebarCollapsed
                          ? "justify-center px-2"
                          : "justify-between px-3",
                        isActive
                          ? "bg-mountain-700/80 text-stone-100"
                          : "text-stone-400 hover:bg-mountain-800/70 hover:text-stone-200",
                      )
                    }
                  >
                    <span
                      className={clsx(
                        "inline-flex items-center",
                        sidebarCollapsed ? "gap-0" : "gap-2.5",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {!sidebarCollapsed && item.label}
                    </span>
                    {!sidebarCollapsed && item.badge && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="px-2 mb-1.5 text-xs uppercase tracking-[0.14em] text-stone-600">
                System
              </p>
            )}
            <div className="space-y-0.5">
              {systemItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center rounded-xl py-2.5 text-[0.98rem] transition",
                        sidebarCollapsed
                          ? "justify-center px-2"
                          : "justify-between px-3",
                        isActive
                          ? "bg-mountain-700/80 text-stone-100"
                          : "text-stone-400 hover:bg-mountain-800/70 hover:text-stone-200",
                      )
                    }
                  >
                    <span
                      className={clsx(
                        "inline-flex items-center",
                        sidebarCollapsed ? "gap-0" : "gap-2.5",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {!sidebarCollapsed && item.label}
                    </span>
                    {!sidebarCollapsed && item.badge && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        <div
          ref={menuRef}
          className={clsx(
            "relative mt-auto border-t border-mountain-700 py-4",
            sidebarCollapsed ? "px-2" : "px-4",
          )}
        >
          {menuOpen && (
            <div
              className={clsx(
                "absolute bottom-[4.6rem] rounded-2xl border border-mountain-600 bg-mountain-900 shadow-2xl overflow-hidden",
                sidebarCollapsed ? "left-2 right-2" : "left-4 right-4",
              )}
            >
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-200 hover:bg-mountain-800"
              >
                <UserCircle2 className="w-4 h-4" />
                Edit profile
              </Link>

              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-stone-200 hover:bg-mountain-800"
              >
                <span className="inline-flex items-center gap-2.5">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  Toggle theme
                </span>
                <span className="text-xs rounded-md bg-mountain-700 px-1.5 py-0.5 text-stone-400">
                  {theme === "dark" ? "D" : "L"}
                </span>
              </button>

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-200 hover:bg-mountain-800 border-t border-mountain-700"
              >
                <Home className="w-4 h-4" />
                Homepage
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 border-t border-mountain-700"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            className={clsx(
              "w-full rounded-xl py-1.5 flex items-center hover:bg-mountain-800/80 transition",
              sidebarCollapsed ? "px-1.5 justify-center" : "px-2 gap-3",
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-mountain-700 text-stone-300 flex items-center justify-center text-sm">
              {firstName[0]}
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="text-left">
                  <p className="text-sm font-medium text-stone-200 leading-tight">
                    {firstName}
                  </p>
                  <p className="text-xs text-stone-500">Free plan</p>
                </div>
                <ChevronUp
                  className={clsx(
                    "w-4 h-4 ml-auto text-stone-500 transition-transform",
                    menuOpen && "rotate-180",
                  )}
                />
              </>
            )}
          </button>
        </div>
      </aside>

      <section
        className={clsx(
          "min-w-0 transition-[margin-left] duration-300",
          sidebarCollapsed ? "lg:ml-[84px]" : "lg:ml-[264px]",
        )}
      >
        <header className="h-20 border-b border-mountain-700 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.9rem] leading-tight font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-stone-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2.5">
            {rightActions ?? (
              <>
                <Link to="/stories" className="btn-secondary h-10 px-4">
                  <BookOpen className="w-4 h-4" />
                  View Stories
                </Link>
                <Link to="/chat" className="btn-primary h-10 px-4">
                  New query
                </Link>
              </>
            )}
          </div>
        </header>

        <div
          className={contentClassName ?? "px-4 sm:px-6 lg:px-8 py-6 lg:py-8"}
        >
          {children}
        </div>
      </section>
    </div>
  );
}
