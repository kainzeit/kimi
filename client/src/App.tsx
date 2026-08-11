import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Foyer from "./pages/Foyer";
import AWhim from "./pages/AWhim";
import Imagination from "./pages/Imagination";
import Elsewhere from "./pages/Elsewhere";
import Knock from "./pages/Knock";
import Post from "./pages/Post";
import Manage from "./pages/Manage";
import Greeting from "./pages/Greeting";
import { useState, useEffect } from "react";
import { Menu, Moon, Sun, Settings, X } from "lucide-react";
import { Link } from "wouter";

function useIsPreviewMode() {
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    const inIframe = window.self !== window.top;
    const hasAdminParam = new URLSearchParams(window.location.search).has("admin");
    setIsPreview(inIframe || hasAdminParam);
  }, []);
  return isPreview;
}

function Sidebar({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const [location] = useLocation();
  const isPreview = useIsPreviewMode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { href: "/foyer", label: "foyer" },
    { href: "/a-whim", label: "a whim" },
    { href: "/imagination", label: "imagination" },
    { href: "/elsewhere", label: "elsewhere" },
    { href: "/knock", label: "knock" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

  return (
    <div className={`site-sidebar ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
      <div className="site-sidebar-navigation">
        <div className="site-sidebar-header">
          <Link href="/" onClick={() => setMobileNavOpen(false)}>
            <h1 className="font-bold mb-10 cursor-pointer hover:opacity-70 transition" style={{ fontSize: "28px" }}>kimi.</h1>
          </Link>
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileNavOpen}
            aria-controls="primary-navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <nav id="primary-navigation" className="site-nav flex flex-col gap-3" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={`nav-link tracking-wide transition-colors ${
                isActive(item.href)
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "16px" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="site-sidebar-tools flex flex-col gap-3 pb-2">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        {isPreview && (
          <Link
            href="/manage"
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition"
            title="Manage"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function MainLayout({ children, theme, toggleTheme }: {
  children: React.ReactNode;
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  return (
    <div className="site-layout flex min-h-screen bg-background text-foreground">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <main className="site-main flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function AppRoutes({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const [location] = useLocation();
  const [greeted, setGreeted] = useState<boolean>(() => {
    // Check sessionStorage so the gate doesn't re-appear on page refresh
    return sessionStorage.getItem("kimi-greeted") === "yes";
  });

  const isManage = location === "/manage";

  // /manage bypasses the greeting gate (admin access)
  if (isManage) {
    return <Manage />;
  }

  // Show greeting gate until visitor says hi
  if (!greeted) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <Greeting onEnter={() => setGreeted(true)} />
      </div>
    );
  }

  return (
    <MainLayout theme={theme} toggleTheme={toggleTheme}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/foyer" component={Foyer} />
        <Route path="/a-whim" component={AWhim} />
        <Route path="/a-whim/:slug" component={Post} />
        <Route path="/imagination/:slug" component={Post} />
        <Route path="/imagination" component={Imagination} />
        <Route path="/elsewhere/:slug" component={Post} />
        <Route path="/elsewhere" component={Elsewhere} />
        <Route path="/knock" component={Knock} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme={theme}>
        <TooltipProvider>
          <Toaster />
          <AppRoutes theme={theme} toggleTheme={toggleTheme} />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
