import { Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import Docs from "./pages/Docs";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Downloads from "./pages/Downloads";
import SearchPage from "./pages/Search";
import NotFound from "./pages/NotFound";
import {
  about,
  community,
  contributing,
  legal,
  news,
  packages,
  security,
  sitemap,
} from "./pages/ContentPages";
import "./index.css";

const nav = [
  ["Learn", "/learn"],
  ["Docs", "/docs"],
  ["Downloads", "/downloads"],
] as const;

const more = [
  ["Packages", "/packages"],
  ["Community", "/community"],
  ["News", "/news"],
  ["Contribute", "/contributing"],
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("nova-theme") === "dark";
    } catch {
      return false;
    }
  });
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("nova-theme", darkMode ? "dark" : "light");
    } catch {
      // Storage can be unavailable; the toggle still works for this visit.
    }
  }, [darkMode]);

  // A new route should start at the top, except when a page has its own anchor.
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    setOpen(false);
  }, [location]);

  const isActive = (href: string) => location === href || location.startsWith(`${href}/`);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="NOVA home">
            <img src="/assets/nova-logo.jpg" alt="" width={35} height={42} />
            <span>NOVA</span>
          </Link>

          <button
            type="button"
            className="menu-button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen(!open)}
          >
            <Menu size={20} />
          </button>

          <nav
            id="primary-nav"
            className={open ? "main-nav open" : "main-nav"}
            aria-label="Primary navigation"
          >
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
                {label}
              </Link>
            ))}
            {more.map(([label, href]) => (
              <Link key={href} href={href} className={isActive(href) ? "active more" : "more"}>
                {label}
              </Link>
            ))}
            <Link href="/search" className="search-link" aria-label="Search NOVA">
              <Search size={17} />
            </Link>
            <button
              type="button"
              className="theme-toggle"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              <span>{darkMode ? "Light" : "Dark"}</span>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/assets/nova-logo.jpg" alt="" width={46} height={54} />
          <p>Programming that feels like texting.</p>
          <span className="muted">Version 1.0.0 · source release</span>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/learn">Learn NOVA</Link>
          <Link href="/docs">Documentation</Link>
          <Link href="/downloads">Downloads</Link>
          <Link href="/packages">Packages</Link>
        </div>
        <div>
          <h3>Project</h3>
          <Link href="/community">Community</Link>
          <Link href="/news">News</Link>
          <Link href="/contributing">Contributing</Link>
          <Link href="/about">About NOVA</Link>
        </div>
        <div>
          <h3>Information</h3>
          <Link href="/security">Security</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/sitemap">Sitemap</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© NOVA project · Official details are still being established.</span>
        <span className="placeholder-chip">Repository: not published</span>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/learn" component={Learn} />
        <Route path="/docs" component={Docs} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/search" component={SearchPage} />
        <Route path="/packages" component={packages} />
        <Route path="/community" component={community} />
        <Route path="/news" component={news} />
        <Route path="/contributing" component={contributing} />
        <Route path="/about" component={about} />
        <Route path="/security" component={security} />
        <Route path="/terms" component={legal("Terms of Service")} />
        <Route path="/privacy" component={legal("Privacy Policy")} />
        <Route path="/contact" component={legal("Contact NOVA")} />
        <Route path="/sitemap" component={sitemap} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}
