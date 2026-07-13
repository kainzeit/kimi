import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import AWhim from "./pages/AWhim";
import Imagination from "./pages/Imagination";
import Contact from "./pages/Contact";
import Post from "./pages/Post";
import Manage from "./pages/Manage";
import { useState, useEffect } from "react";
import { Moon, Sun, Settings } from "lucide-react";
import { Link } from "wouter";

function useIsPreviewMode() {
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    // Show manage icon only when inside Manus preview iframe or with ?admin param
    const inIframe = window.self !== window.top;
    const hasAdminParam = new URLSearchParams(window.location.search).has("admin");
    setIsPreview(inIframe || hasAdminParam);
  }, []);
  return isPreview;
}

function Sidebar({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const [location] = useLocation();
  const isPreview = useIsPreviewMode();

  const navItems = [
    { href: "/", label: "home" },
    { href: "/about", label: "about" },
    { href: "/a-whim", label: "a whim" },
    { href: "/imagination", label: "imagination" },
    { href: "/contact", label: "contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="w-44 shrink-0 p-8 pt-10 flex flex-col justify-between h-screen sticky top-0">
      <div>
        <Link href="/">
          <h1 className="text-2xl font-bold mb-10 cursor-pointer hover:opacity-70 transition">kimi.</h1>
        </Link>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link text-sm tracking-wide transition-colors ${
                isActive(item.href)
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pb-2">
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function AppRoutes({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const [location] = useLocation();
  const isManage = location === "/manage";

  if (isManage) {
    return <Manage />;
  }

  return (
    <MainLayout theme={theme} toggleTheme={toggleTheme}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/a-whim" component={AWhim} />
        <Route path="/a-whim/:slug" component={Post} />
        <Route path="/imagination/:slug" component={Post} />
        <Route path="/imagination" component={Imagination} />
        <Route path="/contact" component={Contact} />
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
