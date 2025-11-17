import React, { useEffect, useRef, useState } from "react";
import "./NavBar.css";

const NAVLINKS = [
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

export const NavBar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(NAVLINKS.length);
  const navRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const moreRef = useRef<HTMLLIElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const menuRef = useRef<HTMLUListElement | null>(null);

  // Calculate visibleCount based on available width (reserve for "More")
  useEffect(() => {
    const calculate = () => {
      if (!navRef.current) return;
      const navWidth = navRef.current.offsetWidth;
      let used = 0;
      let count = 0;
      const reserve = 72; // reserve space for More button
      for (let i = 0; i < NAVLINKS.length; i++) {
        const li = itemRefs.current[i];
        const w = li ? li.offsetWidth : 110;
        used += w + 12;
        if (used < navWidth - reserve) count++;
        else break;
      }
      setVisibleCount(Math.max(1, Math.min(NAVLINKS.length, count || 1)));
    };

    const rafId = requestAnimationFrame(calculate);
    window.addEventListener("resize", calculate);
    window.addEventListener("load", calculate);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", calculate);
      window.removeEventListener("load", calculate);
    };
  }, []);

  const visibleLinks = NAVLINKS.slice(0, visibleCount);
  const overflowLinks = NAVLINKS.slice(visibleCount);

  // Close dropdown on outside click or ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // When opening the dropdown, focus first menu item if present
  useEffect(() => {
    if (dropdownOpen) {
      const first = menuItemRefs.current && menuItemRefs.current.length > 0 ? menuItemRefs.current[0] : null;
      first?.focus();
    }
  }, [dropdownOpen]);

  // Button keyboard handler: open on Enter/Space/ArrowDown/ArrowUp
  const onMoreButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setDropdownOpen(true);
      // focus handled by effect
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDropdownOpen(true);
      // focus last item after open (guard empty)
      setTimeout(() => {
        const len = menuItemRefs.current ? menuItemRefs.current.length : 0;
        if (len > 0) menuItemRefs.current[len - 1]?.focus();
      }, 0);
    }
  };

  // Menu keyboard handler: Arrow navigation, Home/End, Escape, Tab
  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const items = menuItemRefs.current || [];
    const len = items.length;
    if (len === 0) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        moreButtonRef.current?.focus();
      }
      return;
    }

    const currentIndex = items.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIndex + 1) % len;
      items[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (currentIndex - 1 + len) % len;
      items[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[len - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDropdownOpen(false);
      moreButtonRef.current?.focus();
    } else if (e.key === "Tab") {
      // allow tabbing out; close menu
      setDropdownOpen(false);
    }
  };

  return (
    <nav className="morrisons-navbar" aria-label="Main navigation">
      <div className="navbar-scroll-wrapper">
        <div className="navbar-scroll">
          <ul className="navbar-list" ref={navRef}>
            {visibleLinks.map((link, idx) => (
              <li
                key={link.label}
                ref={(el) => {
                  // assign without returning a value to satisfy TS ref type
                  itemRefs.current[idx] = el;
                }}
              >
                <a href={link.href}>{link.label}</a>
              </li>
            ))}

            <li
              className={`navbar-more${overflowLinks.length > 0 ? " shown" : ""}${dropdownOpen ? " open" : ""}`}
              ref={moreRef}
              aria-hidden={overflowLinks.length === 0}
            >
              {overflowLinks.length > 0 && (
                <>
                  <button
                    id="nav-more-btn"
                    ref={moreButtonRef}
                    className="navbar-more-btn"
                    title="More navigation"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    aria-controls="nav-more-dropdown"
                    onClick={() => setDropdownOpen((o) => !o)}
                    onKeyDown={onMoreButtonKeyDown}
                  >
                    ⋯
                    <span className="visually-hidden">More navigation items</span>
                  </button>

                  <ul
                    id="nav-more-dropdown"
                    ref={menuRef}
                    className="navbar-dropdown"
                    role="menu"
                    aria-label="More navigation"
                    aria-hidden={!dropdownOpen}
                    onKeyDown={onMenuKeyDown}
                  >
                    {overflowLinks.map((link, i) => (
                      <li key={link.label} role="none">
                        <a
                          role="menuitem"
                          tabIndex={dropdownOpen ? 0 : -1}
                          href={link.href}
                          ref={(el) => {
                            // assign without returning a value
                            menuItemRefs.current[i] = el;
                          }}
                          onClick={() => setDropdownOpen(false)}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
