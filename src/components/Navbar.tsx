import { Sun, Moon, Lock, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { PortfolioSettings } from "../types";

interface NavbarProps {
  settings: PortfolioSettings;
  isDark: boolean;
  toggleTheme: () => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  currentView: "portfolio" | "admin";
  onViewChange: (view: "portfolio" | "admin") => void;
}

export default function Navbar({
  settings,
  isDark,
  toggleTheme,
  isAdmin,
  onAdminClick,
  currentView,
  onViewChange,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Projects", id: "gallery-section" },
    { label: "About", id: "about-section" },
    { label: "Contact", id: "contact-section" },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== "portfolio") {
      onViewChange("portfolio");
      // Wait for React to render visual portfolio view, then scroll
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#ffdb2a]/80 dark:bg-[#0A0A0A]/80 border-b border-zinc-200/40 dark:border-zinc-850/40 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Brand */}
          <button
            onClick={() => {
              onViewChange("portfolio");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-serif italic font-bold text-2xl tracking-tight text-[#0A0A0A] dark:text-white cursor-pointer select-none focus:outline-none"
            id="logo-button"
          >
            {settings.name.split(" ").map((n) => n[0]).join("")}.
            <span className="font-mono text-[9px] not-italic text-zinc-450 tracking-widest uppercase ml-3 hidden sm:inline">
              STUDIO
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {currentView === "portfolio" &&
                navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="font-mono text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:underline underline-offset-4 decoration-zinc-400 transition-colors cursor-pointer uppercase tracking-widest"
                    id={`nav-item-${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              {currentView === "admin" && (
                <button
                  onClick={() => onViewChange("portfolio")}
                  className="font-mono text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer uppercase tracking-widest"
                  id="nav-back-portfolio"
                >
                  &larr; Back to Portfolio
                </button>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex items-center space-x-4 border-l border-zinc-200/60 dark:border-zinc-800 pl-6">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-none border border-transparent hover:border-zinc-250 dark:hover:border-zinc-800 text-zinc-500 hover:text-[#0A0A0A] dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                title={isDark ? "Light Mode" : "Dark Mode"}
                id="theme-toggle-button"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Security Console */}
              <button
                onClick={onAdminClick}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-none text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all duration-200 ${
                  isAdmin
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border border-transparent"
                    : "bg-transparent text-zinc-500 hover:text-[#0A0A0A] dark:text-zinc-400 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500"
                }`}
                id="admin-portal-button"
              >
                {isAdmin ? <Settings size={12} className="animate-spin-slow" /> : <Lock size={12} />}
                <span>{isAdmin ? "Dashboard" : "Admin"}</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-none border border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              id="mobile-theme-toggle-button"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={onAdminClick}
              className="p-1.5 rounded-none border border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              id="mobile-admin-access-button"
            >
              <Lock size={16} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-none border border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              id="mobile-menu-hamburger"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200/85 dark:border-zinc-850/85 bg-[#ffdb2a] dark:bg-[#0A0A0A] px-6 pt-2 pb-6 space-y-3 animate-slide-down">
          {currentView === "portfolio" &&
            navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="block w-full text-left py-2 border-b border-zinc-100 dark:border-zinc-900/40 font-mono text-xs uppercase tracking-widest text-[#0A0A0A] dark:text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
                id={`mobile-nav-item-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          {currentView === "admin" && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onViewChange("portfolio");
              }}
              className="block w-full text-left py-2 border-b border-zinc-100 dark:border-zinc-900/45 font-mono text-xs uppercase tracking-widest text-[#0A0A0A] dark:text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
              id="mobile-nav-back-portfolio"
            >
              &larr; Back to Portfolio
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
