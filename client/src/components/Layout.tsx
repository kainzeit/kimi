import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Link } from "wouter";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Header */}
      <header className="border-b border-border p-6">
        <nav className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-2xl font-bold hover:opacity-70 transition">
              kimi.
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded transition"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => logout()}
                  className="text-sm hover:opacity-70 transition"
                >
                  logout
                </button>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => startLogin()}
                  className="text-sm hover:opacity-70 transition"
                >
                  login
                </button>
              )}
            </div>
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            <li><Link href="/about" className="hover:opacity-70 transition">about</Link></li>
            <li><Link href="/a-whim" className="hover:opacity-70 transition">a whim</Link></li>
            <li><Link href="/imagination" className="hover:opacity-70 transition">imagination</Link></li>
            <li><Link href="/contact" className="hover:opacity-70 transition">contact</Link></li>
            {isAuthenticated && (
              <li><Link href="/manage" className="hover:opacity-70 transition font-bold text-primary">manage</Link></li>
            )}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border p-6 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto">
          <p>Copyright © 2026 kimi</p>
          <p>All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
