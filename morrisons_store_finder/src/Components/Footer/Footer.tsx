import React from 'react';
import './Footer.css';
import logo from '../../logo.svg';

// Types
interface LinkItem {
  name: string;
  link: string;
}

interface FooterSectionData {
  title: string;
  links: LinkItem[];
}

// Constants - extracted for better maintainability
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
      { name: "Store Finder", link: "https://www.morrisons.com/store-finder/" },
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
  { name: "Facebook", icon: "facebook", url: "https://www.facebook.com/Morrisons" },
  { name: "Twitter", icon: "twitter", url: "https://twitter.com/Morrisons" },
  { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/morrisons/" },
  { name: "YouTube", icon: "youtube", url: "https://www.youtube.com/user/morrisonssupermarket" },
   { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/morrisons/" },
  { name: "YouTube", icon: "youtube", url: "https://www.youtube.com/user/morrisonssupermarket" },
];

// Reusable Components
const FooterSection: React.FC<{ section: FooterSectionData }> = ({ section }) => (
  <div className="footer-section">
    <h4>{section.title}</h4>
    <ul>
      {section.links.map((link, index) => (
        <li key={`${link.name}-${index}`}>
          <a 
            href={link.link} 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label={`Visit ${link.name}`}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const SocialMediaLinks: React.FC = () => (
  <div className="social-media-links">
    {SOCIAL_MEDIA_LINKS.map((social) => (
      <a
        key={social.name}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Follow us on ${social.name}`}
        className={`social-icon ${social.icon}`}
      >
        <span className="sr-only">{social.name}</span>
      </a>
    ))}
  </div>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Upper Section */}
        <div className="footer-upper">
          <div className="footer-logo-section">
            <img 
              className="footer-logo" 
              src={logo} 
              alt="Morrisons Logo" 
              width="120"
              height="40"
            />
          </div>
          <SocialMediaLinks />
        </div>

        {/* Footer Links Grid */}
        <div className="footer-links-grid">
          {FOOTER_SECTIONS.map((section, index) => (
            <FooterSection key={`section-${index}`} section={section} />
          ))}
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© {currentYear} Morrisons Store Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;