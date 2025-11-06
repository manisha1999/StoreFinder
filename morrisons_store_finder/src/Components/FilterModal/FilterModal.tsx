import React from "react";
import "./FilterModal.css";

const popularFilters = [
  "morrisons now", "cafe", "pharmacy", "petrol station", "timpson", "nutmeg"
];
const departments = ["pharmacy", "cafe"];
const services = [
  "click & collect", "amazon locker", "carpet cleaning", "car wash", "fishmonger", "free from",
  "halal counter", "opticians", "party shop", "photo processing", "petrol station",
  "podback recycling", "rug doctor", "timpson", "butcher", "disabled access", "dry cleaning",
  "pizza counter", "bakery", "nutmeg clothing", "morrisons now"
];

type FilterModalProps = {
  appliedFilters: string[];
  onChange: (arr: string[]) => void;
  onClose: () => void;
};

type SectionProps = {
  title: string;
  options: string[];
  appliedFilters: string[];
  toggle: (name: string) => void;
};

function Section({ title, options, appliedFilters, toggle }: SectionProps) {
  return (
    <div className="modal-section">
      <h3>{title}</h3>
      <div className="modal-checkbox-row">
        {options.map((option: string) => (
          <label className={`filter-checkbox ${appliedFilters.includes(option) ? "checked" : ""}`} key={option}>
            <input
              type="checkbox"
              style={{ display: "none" }}
              checked={appliedFilters.includes(option)}
              onChange={() => toggle(option)}
            />
            <span className="checkbox-custom">
              {appliedFilters.includes(option) && (
                <svg width="20" height="20" viewBox="0 0 20 20"><polyline points="4,10 8,15 16,6" stroke="#fff" strokeWidth="2" fill="none"/></svg>
              )}
            </span>
            <span className="filter-label-text">{option.replace(/\b\w/g, l => l.toUpperCase())}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const FilterModal: React.FC<FilterModalProps> = ({ appliedFilters, onChange, onClose }) => {
  const toggle = (filter: string) => {
    const next = appliedFilters.includes(filter)
      ? appliedFilters.filter((f) => f !== filter)
      : [...appliedFilters, filter];
    onChange(next);
  };
  console.log("Rendering FilterModal with appliedFilters:", appliedFilters);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          Close Filters ✕
        </button>
        <Section title="Popular Filters" options={popularFilters} appliedFilters={appliedFilters} toggle={toggle} />
        <Section title="Departments" options={departments} appliedFilters={appliedFilters} toggle={toggle} />
        <Section title="Services" options={services} appliedFilters={appliedFilters} toggle={toggle} />
      </div>
    </div>
  );
};

export default FilterModal;
