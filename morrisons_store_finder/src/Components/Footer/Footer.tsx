import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Footer.css";
import logo from "../../logo.svg";

interface LinkItem {
  name: string;
  link: string;
}

interface FooterSectionData {
  title: string;
  links: LinkItem[];
}

/* Keep original footer data unchanged */
const FOOTER_SECTIONS: FooterSectionData[] = [
  {
    title: "Our Main Sites",
    links: [
      { name: "Morrisons.com", link: "https://www.morrisons.com" },
      { name: "Groceries", link: "https://www.morrisons.com/online-groceries/" },
      { name: "Food to Order", link: "https://www.morrisons.com/food-to-order/" },
      { name: "Morrisons More", link: "https://www.morrisons.com/more/" },
      { name: "Inspiration", link: "https://www.morrisons.com/inspiration/" },
      { name: "Morrisons Gift Cards", link: "https://www.morrisons.com/gift-cards/" },
      { name: "Morrisons Daily", link: "https://www.morrisons.com/daily/" },
    ],
  },
  {
    title: "Help & Information",
    links: [
      { name: "Contact Us", link: "https://www.morrisons.com/help/contact-us/" },
      { name: "Store Finder", link: "/" },
      { name: "FAQs", link: "https://www.morrisons.com/help/faqs/" },
    ],
  },
  {
    title: "Corporate Information",
    links: [
      { name: "About Us", link: "https://www.morrisons-corporate.com/about-us/" },
      { name: "Careers", link: "https://www.morrisons-corporate.com/careers/" },
      { name: "Sustainability", link: "https://www.morrisons-corporate.com/sustainability/" },
      { name: "Modern Slavery Statement", link: "https://www.morrisons-corporate.com/media/modern-slavery-statement/" },
    ],
  },
  {
    title: "Terms & Policies",
    links: [
      { name: "Terms of Use", link: "https://www.morrisons.com/help/terms-of-use/" },
      { name: "Terms & Conditions", link: "https://www.morrisons.com/help/terms-and-conditions/" },
      { name: "Morrisons Now Terms & Conditions", link: "https://www.morrisons.com/help/morrisons-now-terms-and-conditions/" },
      { name: "Privacy Policy", link: "https://www.morrisons.com/help/privacy-policy/" },
      { name: "Cookie Policy", link: "https://www.morrisons.com/help/cookie-policy/" },
      { name: "WEEE Regulations and Battery Recycling", link: "https://www.morrisons.com/help/weee-regulations/" },
      { name: "Accessibility", link: "https://www.morrisons.com/help/accessibility/" },
    ],
  },
];

const SOCIAL_MEDIA_LINKS = [
  { name: "Facebook", iconClass: "facebook", url: "https://www.facebook.com/Morrisons" },
  { name: "Twitter", iconClass: "twitter", url: "https://twitter.com/Morrisons" },
  { name: "Instagram", iconClass: "instagram", url: "https://www.instagram.com/morrisons/" },
  { name: "YouTube", iconClass: "youtube", url: "https://www.youtube.com/user/morrisonssupermarket" },
];

const SocialMediaLinks: React.FC = () => (
  <div className="social-media-links" aria-label="Follow Morrisons">
    {SOCIAL_MEDIA_LINKS.map((s) => (
      <a
        key={s.name}
        className={`social-icon ${s.iconClass}`}
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Follow us on ${s.name}`}
      >
        <span className="visually-hidden">{s.name}</span>
      </a>
    ))}
  </div>
);

const Footer: React.FC = () => {
  // treat widths <= 1100px as "collapsed by default"
  const isMediumOrSmaller = typeof window !== "undefined" ? window.innerWidth <= 1100 : true;

  const initialExpanded = useMemo(() => {
    if (isMediumOrSmaller) return {}; // collapsed on medium+small
    return FOOTER_SECTIONS.reduce<Record<number, boolean>>((acc, _, i) => {
      acc[i] = true;
      return acc;
    }, {}); // expanded on large desktop
  }, [isMediumOrSmaller]);

  const [expandedSet, setExpandedSet] = useState<Record<number, boolean>>(initialExpanded);

  // keep refs for toggles and panels to manage focus
  const toggleRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRefs = useRef<Array<HTMLUListElement | null>>([]);

  // update collapsed/expanded behavior when window resizes across threshold
  useEffect(() => {
    const onResize = () => {
      const small = window.innerWidth <= 1100;
      setExpandedSet((prev) => {
        // if crossing to small, collapse all not explicitly open
        if (small) return {};
        // on large, ensure all expanded
        return FOOTER_SECTIONS.reduce<Record<number, boolean>>((acc, _, i) => {
          acc[i] = true;
          return acc;
        }, {});
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSection = (i: number) => {
    setExpandedSet((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      // focus management: setTimeout to wait for DOM update
      setTimeout(() => {
        const expanded = !!next[i];
        if (expanded) {
          // focus first link inside the panel if present
          const panel = panelRefs.current[i];
          const firstLink = panel?.querySelector<HTMLAnchorElement>("a");
          firstLink?.focus();
        } else {
          // return focus to toggle button
          toggleRefs.current[i]?.focus();
        }
      }, 0);
      return next;
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-upper">
          <div className="footer-logo-section">
            <img className="footer-logo" src={logo} alt="Morrisons Logo" />
          </div>
          <SocialMediaLinks />
        </div>

        <nav className="footer-links-grid" aria-label="Footer links">
          {FOOTER_SECTIONS.map((section, index) => {
            const panelId = `footer-panel-${index}`;
            const expanded = !!expandedSet[index];
            return (
              <section
                key={section.title}
                className="footer-section"
                aria-labelledby={`footer-heading-${index}`}
              >
                <div className="footer-section-header">
                  <h4 id={`footer-heading-${index}`}>{section.title}</h4>

                  <button
                    ref={(el) => {
                      toggleRefs.current[index] = el;
                    }}
                    className="footer-toggle-btn"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => toggleSection(index)}
                    type="button"
                  >
                    <span className="visually-hidden">
                      {expanded ? "Collapse" : "Expand"} {section.title}
                    </span>
                    <span aria-hidden="true" className="toggle-icon">
                      {expanded ? "−" : "+"}
                    </span>
                  </button>
                </div>

                <ul
                  id={panelId}
                  ref={(el) => {
                    panelRefs.current[index] = el;
                  }}
                  className={`footer-panel ${expanded ? "expanded" : "collapsed"}`}
                  role="list"
                  aria-hidden={!expanded}
                >
                  {section.links.map((link, idx) => (
                    <li key={`${link.name}-${idx}`}>
                      <a href={link.link} aria-label={link.name}>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>

        <div className="footer-bottom">
          <p>© {currentYear} Morrisons Store Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;