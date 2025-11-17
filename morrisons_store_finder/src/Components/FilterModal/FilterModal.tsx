import React, { useEffect, useMemo, useRef, useCallback } from "react";
import "./FilterModal.css";

type FilterModalProps = {
  appliedFilters: string[];
  onChange: (arr: string[]) => void;
  onClose: () => void;
};

const popularFilters = [
  "morrisons now",
  "cafe",
  "pharmacy",
  "petrol station",
  "timpson",
  "nutmeg",
];
const departments = ["pharmacy", "cafe"];
const services = [
  "click & collect",
  "amazon locker",
  "carpet cleaning",
  "car wash",
  "fishmonger",
  "free from",
  "halal counter",
  "opticians",
  "party shop",
  "photo processing",
  "petrol station",
  "podback recycling",
  "rug doctor",
  "timpson",
  "butcher",
  "disabled access",
  "dry cleaning",
  "pizza counter",
  "bakery",
  "nutmeg clothing",
  "morrisons now",
];

type SectionDef = { id: string; title: string; options: string[] };

/* Focus trap hook (generic) */
function useFocusTrap<T extends HTMLElement>(rootRef: React.RefObject<T | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const focusableSelector =
      'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter((n) => {
        return !!(n.offsetWidth || n.offsetHeight || n.getClientRects().length);
      });

    const initial = getFocusable();
    if (initial.length) initial[0].focus();

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const list = getFocusable();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [rootRef]);
}

function normalizeFilter(s: string) {
  return String(s || "").trim();
}

function Section({
  title,
  options,
  appliedFilters,
  toggle,
}: {
  title: string;
  options: string[];
  appliedFilters: string[];
  toggle: (name: string) => void;
}) {
  return (
    <div className="modal-section" aria-labelledby={`filter-section-${title.replace(/\s+/g, "-")}`}>
      <h3 id={`filter-section-${title.replace(/\s+/g, "-")}`}>{title}</h3>
      <div className="modal-checkbox-row" role="group" aria-label={title}>
        {options.map((option) => {
          const id = `${title.replace(/\s+/g, "-")}__${option.replace(/\s+/g, "-")}`;
          const checked = appliedFilters.includes(option);
          return (
            <label
              className={`filter-checkbox ${checked ? "checked" : ""}`}
              key={id}
              htmlFor={id}
            >
              <input
                id={id}
                type="checkbox"
                className="visually-hidden"
                checked={checked}
                onChange={() => toggle(option)}
                aria-checked={checked}
              />
              <span className="checkbox-custom" aria-hidden>
                {checked ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                    <polyline
                      points="4,10 8,15 16,6"
                      stroke="#fff"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span className="filter-label-text">
                {option.replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const FilterModal: React.FC<FilterModalProps> = ({ appliedFilters, onChange, onClose }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(modalRef);

  const sections: SectionDef[] = useMemo(
    () => [
      { id: "popular", title: "Popular Filters", options: popularFilters },
      { id: "departments", title: "Departments", options: departments },
      { id: "services", title: "Services", options: services },
    ],
    []
  );

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  const toggle = useCallback(
    (filter: string) => {
      const next = appliedFilters.includes(filter)
        ? appliedFilters.filter((f) => f !== filter)
        : [...appliedFilters, filter];
      onChange(next);
    },
    [appliedFilters, onChange]
  );

  const clearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-desc filter-selection-status"
        ref={modalRef}
      >
        <button className="close-btn" onClick={onClose} aria-label="Close filters dialog">
          ✕
        </button>

        <header>
          <h2 id="filter-modal-title">Filter stores</h2>
          <p id="filter-modal-desc" className="visually-hidden">
            Filter nearby stores by department or service. Use the checkboxes to toggle filters.
            Changes are applied immediately.
          </p>
          <div id="filter-selection-status" aria-live="polite" className="visually-hidden">
            {appliedFilters.length === 0
              ? "No filters selected"
              : `${appliedFilters.length} filter${appliedFilters.length > 1 ? "s" : ""} selected`}
          </div>
        </header>

        <div className="modal-body" tabIndex={-1}>
          {sections.map((s) => (
            <Section
              key={s.id}
              title={s.title}
              options={s.options}
              appliedFilters={appliedFilters}
              toggle={toggle}
            />
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default FilterModal;
