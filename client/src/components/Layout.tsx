import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Link } from "wouter";

export default function Layout({ children }: { children: React.ReactNode }) {
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
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            <li><Link href="/about" className="nav-link">about</Link></li>
            <li><Link href="/a-whim" className="nav-link">a whim</Link></li>
            <li><Link href="/imagination" className="nav-link">imagination</Link></li>
            <li><Link href="/contact" className="nav-link">contact</Link></li>
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
