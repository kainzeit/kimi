import { Link } from "wouter";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Header */}
      <header className="border-b-2 border-dashed border-red-500 p-6">
        <nav className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-2xl font-bold hover:opacity-70 transition">
              kimi.
            </Link>
            <div className="w-4 h-4 bg-red-500"></div>
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            <li><Link href="/about" className="hover:opacity-70 transition">about</Link></li>
            <li><Link href="/a-whim" className="hover:opacity-70 transition">a whim</Link></li>
            <li><Link href="/imagination" className="hover:opacity-70 transition">imagination</Link></li>
            <li><Link href="/contact" className="hover:opacity-70 transition">contact</Link></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-dashed border-red-500 p-6 text-xs text-gray-600">
        <div className="max-w-6xl mx-auto">
          <p>Copyright © 2026 kimi</p>
          <p>All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
