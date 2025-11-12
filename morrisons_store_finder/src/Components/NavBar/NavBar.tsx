import React, { useEffect, useRef, useState } from "react";
import "./NavBar.css";

const NAV_LINKS = [
  { label: "Morrisons", href: "/" },
  { label: "Groceries", href: "/groceries" },
  { label: "Morrisons More", href: "/more" },
  { label: "Delivery Pass", href: "/delivery-pass" },
  { label: "Market Street", href: "/market-street" },
  { label: "Morrisons Clinic", href: "/clinic" },
  { label: "Travel Money", href: "/travel-money" },
  { label: "Morrisons Photo", href: "/photo" },
  { label: "Nutmeg", href: "/nutmeg" },
  { label: "Inspiration", href: "/inspiration" },
  { label: "Store Finder", href: "/storefinder" },
  { label: "Help Hub & FAQs", href: "/help-hub" },
];

export function NavBar() {
  const VISIBLE_COUNT = 5; // number of links shown on mobile before "More"
  const visibleLinks = NAV_LINKS.slice(0, VISIBLE_COUNT);
  const overflowLinks = NAV_LINKS.slice(VISIBLE_COUNT);

  const [open, setOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!moreRef.current) return;
      if (!moreRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // close dropdown when a link inside it is clicked
  const handleOverflowClick = () => setOpen(false);

  return (
    <nav className="morrisons-navbar" role="navigation" aria-label="Primary">
      <ul className="navbar-list">
        {/* Desktop: show all links */}
        {NAV_LINKS.map((link) => (
          <li key={link.label} className="desktop-only">
            <a href={link.href}>{link.label}</a>
          </li>
        ))}

        {/* Mobile: show a subset + "More" dropdown */}
        {visibleLinks.map((link) => (
          <li key={link.label} className="mobile-only">
            <a href={link.href}>{link.label}</a>
          </li>
        ))}

        <li
          className={`navbar-more mobile-only ${open ? "open" : ""}`}
          ref={moreRef as any}
          aria-hidden={overflowLinks.length === 0}
        >
          <button
            type="button"
            className="navbar-more-btn"
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls="nav-more-dropdown"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((s) => !s);
            }}
            title="More"
          >
        More
            <span className="visually-hidden">More navigation items</span>
          </button>

          {overflowLinks.length > 0 && (
            <ul
              id="nav-more-dropdown"
              className="navbar-dropdown"
              role="menu"
              aria-label="More navigation"
            >
              {overflowLinks.map((link) => (
                <li key={link.label} role="none">
                  <a
                    role="menuitem"
                    href={link.href}
                    onClick={handleOverflowClick}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;