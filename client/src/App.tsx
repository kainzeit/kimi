import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import AWhim from "./pages/AWhim";
import Post from "./pages/Post";
import Imagination from "./pages/Imagination";
import Contact from "./pages/Contact";
import Manage from "./pages/Manage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/a-whim"} component={AWhim} />
      <Route path={"/a-whim/:slug"} component={Post} />
      <Route path={"/imagination"} component={Imagination} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/manage"} component={Manage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
