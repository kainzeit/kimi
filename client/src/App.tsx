import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import AWhim from "./pages/AWhim";
import Imagination from "./pages/Imagination";
import Contact from "./pages/Contact";
import Post from "./pages/Post";
import Manage from "./pages/Manage";
import { useState } from "react";
import { Moon, Sun, Settings } from "lucide-react";

function Router({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (page: string) => void }) {
  return (
    <Switch>
      <Route path={"/manage"} component={Manage} />
      <Route path={"/a-whim/:slug"}>
        {() => {
          setCurrentPage("post");
          return <Post />;
        }}
      </Route>
      <Route path={"/"}>
        {() => {
          setCurrentPage("home");
          return <Home />;
        }}
      </Route>
      <Route path={"/about"}>
        {() => {
          setCurrentPage("about");
          return <About />;
        }}
      </Route>
      <Route path={"/a-whim"}>
        {() => {
          setCurrentPage("a-whim");
          return <AWhim />;
        }}
      </Route>
      <Route path={"/imagination"}>
        {() => {
          setCurrentPage("imagination");
          return <Imagination />;
        }}
      </Route>
      <Route path={"/contact"}>
        {() => {
          setCurrentPage("contact");
          return <Contact />;
        }}
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Show manage page without sidebar
  if (currentPage === "manage") {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme={theme}>
          <TooltipProvider>
            <Toaster />
            <Router currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </TooltipProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme={theme}>
        <TooltipProvider>
          <Toaster />
          <div className="flex h-screen bg-background text-foreground">
            {/* Left Sidebar Navigation */}
            <div className="w-48 border-r border-border p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <h1 className="text-2xl font-bold mb-12">kimi.</h1>
                <nav className="space-y-4">
                  <a
                    href="/"
                    onClick={() => setCurrentPage("home")}
                    className={`block nav-link ${currentPage === "home" ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                  >
                    home
                  </a>
                  <a
                    href="/about"
                    onClick={() => setCurrentPage("about")}
                    className={`block nav-link ${currentPage === "about" ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                  >
                    about
                  </a>
                  <a
                    href="/a-whim"
                    onClick={() => setCurrentPage("a-whim")}
                    className={`block nav-link ${currentPage === "a-whim" ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                  >
                    a whim
                  </a>
                  <a
                    href="/imagination"
                    onClick={() => setCurrentPage("imagination")}
                    className={`block nav-link ${currentPage === "imagination" ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                  >
                    imagination
                  </a>
                  <a
                    href="/contact"
                    onClick={() => setCurrentPage("contact")}
                    className={`block nav-link ${currentPage === "contact" ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                  >
                    contact
                  </a>
                </nav>
              </div>

              {/* Bottom Controls */}
              <div className="space-y-4">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center p-2 rounded hover:bg-muted transition"
                  title="Toggle theme"
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <a
                  href="/manage"
                  onClick={() => setCurrentPage("manage")}
                  className="w-full flex items-center justify-center p-2 rounded hover:bg-muted transition"
                  title="Manage"
                >
                  <Settings className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 overflow-y-auto">
              <Router currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
