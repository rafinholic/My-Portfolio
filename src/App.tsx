import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import PortfolioView from "./components/PortfolioView";
import AdminDashboard from "./components/AdminDashboard";
import { Project, PortfolioSettings } from "./types";
import { Lock, X, AlertCircle } from "lucide-react";

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") return true;
      if (savedTheme === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true; // Default to dark mode for a creative aesthetic
  });

  // Client path states
  const [currentView, setCurrentView] = useState<"portfolio" | "admin">("portfolio");
  
  // Administrator auth states
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);

  // Portfolio master state
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Apply dark mode theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Fetch portfolio configs on mount
  const fetchPortfolioData = async () => {
    try {
      setLoadError(null);
      const res = await fetch("/api/portfolio");
      if (!res.ok) {
        throw new Error(`Failed to load config files (HTTP status: ${res.status})`);
      }
      const data = await res.json();
      setSettings(data.settings);
      setProjects(data.projects);
    } catch (err: any) {
      console.error(err);
      setLoadError("Could not retrieve portfolio files. Please check connection to your server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleAdminPanelToggle = () => {
    if (adminToken) {
      // If already logged in, navigate directly to dashboard
      setCurrentView(currentView === "admin" ? "portfolio" : "admin");
    } else {
      // Prompt password prompt
      setIsLoginModalOpen(true);
    }
  };

  // Perform backend administrative check
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setLoginError("");
    setIsCheckingLogin(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passcode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("adminToken", data.token);
        setAdminToken(data.token);
        setIsLoginModalOpen(false);
        setPasscode("");
        setCurrentView("admin"); // Redirect instantly
      } else {
        setLoginError(data.error || "The passcode entered was incorrect. Try again.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Failed to connect to credential service.");
    } finally {
      setIsCheckingLogin(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setCurrentView("portfolio");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0A0A0A] flex flex-col justify-center items-center font-sans">
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 rounded-none animate-spin mx-auto"></div>
          <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            Initialising Creative Portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !settings) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0A0A0A] flex flex-col justify-center items-center font-sans p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#121212] rounded-none border border-zinc-200/60 dark:border-zinc-800/80 p-6 sm:p-8 text-center space-y-5">
          <AlertCircle size={40} className="text-zinc-900 dark:text-zinc-100 mx-auto" />
          <div className="space-y-2">
            <h3 className="font-serif font-medium text-xl text-zinc-900 dark:text-white">
              Data Loading Failure
            </h3>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
              {loadError || "Could not construct settings variables due to network anomaly."}
            </p>
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchPortfolioData();
            }}
            className="w-full py-2.5 bg-zinc-900 text-[#FAF9F6] hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-none text-xs font-semibold cursor-pointer transition-colors"
          >
            Retry Connection Sequence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-[#F5F5F5] transition-colors duration-300 font-sans flex flex-col relative selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
      
      {/* Universal Sticky Navigation */}
      <Navbar
        settings={settings}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        isAdmin={!!adminToken}
        onAdminClick={handleAdminPanelToggle}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Body Routing (State-based view switch) */}
      <main className="flex-1 w-full flex flex-col">
        {currentView === "portfolio" ? (
          <PortfolioView
            settings={settings}
            projects={projects}
            onMessageSent={(success, text) => {
              console.log("Contact action telemetry:", success, text);
            }}
          />
        ) : (
          <AdminDashboard
            initialToken={adminToken || ""}
            onLogout={handleAdminLogout}
            onRefreshPortfolio={fetchPortfolioData}
            portfolioProjects={projects}
            portfolioSettings={settings}
          />
        )}
      </main>

      {/* Modern High-contrast Minimal Page Footer */}
      <footer className="w-full bg-[#FAF9F6] dark:bg-[#0A0A0A] border-t border-zinc-200/80 dark:border-zinc-800/80 py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1.5 text-center sm:text-left select-none">
            <span className="font-serif font-semibold text-lg tracking-tight text-[#0A0A0A] dark:text-white">
              {settings.name}
            </span>
            <span className="block text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
              DESIGN PORTFOLIO &bull; ALL RIGHTS RESERVED &bull; 2026
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xs font-medium tracking-wide uppercase text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              Back to top &uarr;
            </button>
            <span className="text-zinc-200 dark:text-zinc-800">|</span>
            <button
              onClick={handleAdminPanelToggle}
              className="text-xs font-medium tracking-wide uppercase text-zinc-500 hover:text-zinc-900 dark:text-zinc-105 dark:hover:text-white transition-colors cursor-pointer"
            >
              {adminToken ? "Dashboard Workspace" : "Credential Console"}
            </button>
          </div>
        </div>
      </footer>

      {/* Administrative Authenticate Modal Dialog */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fade-in" id="admin-login-modal">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#121212] border border-zinc-250 dark:border-zinc-800 rounded-none shadow-none p-6 sm:p-8 space-y-6">
            
            {/* Modal exit X */}
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setPasscode("");
                setLoginError("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-700 dark:hover:text-white cursor-pointer transition-colors"
              aria-label="Close modal"
              id="admin-login-modal-close"
            >
              <X size={16} />
            </button>

            {/* Title */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-10 h-10 rounded-none border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-700 dark:text-zinc-200">
                <Lock size={16} />
              </div>
              <h3 className="font-serif font-medium text-xl text-zinc-900 dark:text-white">
                Admin Authentication
              </h3>
              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400">
                Type the dashboard passcode to unlock management features.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="passcode-input" className="block text-[10px] font-mono tracking-widest text-zinc-450 uppercase">
                  Passcode
                </label>
                <input
                  type="password"
                  id="passcode-input"
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-center text-lg font-mono focus:outline-none focus:border-zinc-905 dark:focus:border-white focus:ring-0 tracking-widest"
                  placeholder="••••••••"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 rounded-none text-xs leading-relaxed text-center border border-red-155/35">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isCheckingLogin}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-[#FAF9F6] dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 rounded-none text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
              >
                {isCheckingLogin ? "Verifying Credentials..." : "Access Console"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
