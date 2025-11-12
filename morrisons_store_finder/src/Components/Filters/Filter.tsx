import React, { useState, useCallback } from 'react';
import './Filter.css';

export interface FilterState {
  // Store types
  morrisons: boolean;
  morrisonsDaily: boolean;
  
  // Popular filters
  morrisonsNow: boolean;
  cafe: boolean;
  pharmacy: boolean;
  petrolStation: boolean;
  timpson: boolean;
  nutmeg: boolean;
  
  // Services
  clickAndCollect: boolean;
  amazonLocker: boolean;
  carpetCleaning: boolean;
  carWash: boolean;
  fishmonger: boolean;
  freeFrom: boolean;
  halalCounter: boolean;
  opticians: boolean;
  partyShop: boolean;
  photoProcessing: boolean;
  podbackRecycling: boolean;
  rugDoctor: boolean;
  butcher: boolean;
  disabledAccess: boolean;
  dryCleaning: boolean;
  pizzaCounter: boolean;
  bakery: boolean;
  nutmegClothing: boolean;
}

export type FilterKey = keyof FilterState;

export interface FilterProps {
  defaultValue?: Partial<FilterState>;
  onChange?: (next: FilterState) => void;
  onOpenModal?: () => void;
}

const Filter: React.FC<FilterProps> = ({ defaultValue, onChange, onOpenModal }) => {
  const [filters, setFilters] = useState<FilterState>({
    morrisons: defaultValue?.morrisons ?? false,
    morrisonsDaily: defaultValue?.morrisonsDaily ?? false,
    morrisonsNow: defaultValue?.morrisonsNow ?? false,
    cafe: defaultValue?.cafe ?? false,
    pharmacy: defaultValue?.pharmacy ?? false,
    petrolStation: defaultValue?.petrolStation ?? false,
    timpson: defaultValue?.timpson ?? false,
    nutmeg: defaultValue?.nutmeg ?? false,
    clickAndCollect: defaultValue?.clickAndCollect ?? false,
    amazonLocker: defaultValue?.amazonLocker ?? false,
    carpetCleaning: defaultValue?.carpetCleaning ?? false,
    carWash: defaultValue?.carWash ?? false,
    fishmonger: defaultValue?.fishmonger ?? false,
    freeFrom: defaultValue?.freeFrom ?? false,
    halalCounter: defaultValue?.halalCounter ?? false,
    opticians: defaultValue?.opticians ?? false,
    partyShop: defaultValue?.partyShop ?? false,
    photoProcessing: defaultValue?.photoProcessing ?? false,
    podbackRecycling: defaultValue?.podbackRecycling ?? false,
    rugDoctor: defaultValue?.rugDoctor ?? false,
    butcher: defaultValue?.butcher ?? false,
    disabledAccess: defaultValue?.disabledAccess ?? false,
    dryCleaning: defaultValue?.dryCleaning ?? false,
    pizzaCounter: defaultValue?.pizzaCounter ?? false,
    bakery: defaultValue?.bakery ?? false,
    nutmegClothing: defaultValue?.nutmegClothing ?? false,
  });

  const toggle = useCallback((key: FilterKey) => {
    setFilters((prev) => {
      const next: FilterState = { ...prev, [key]: !prev[key] };
      onChange?.(next);
      return next;
    });
  }, [onChange]);
  console.log("Rendering Filter with filters:", filters);

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <span className="filter-title">Search Stores</span>
        <button className="filter-icon-btn" onClick={onOpenModal} aria-label="Filter search">
          <span className="filter-label">Filter search</span>
          <svg className="filter-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 5h18M7 12h10M11 19h2" stroke="#008033" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="filter-options">
        <label className={`filter-checkbox ${filters.morrisons ? 'checked' : ''}`}>
          <input
            type="checkbox"
            name="morrisons"
            checked={filters.morrisons}
            onChange={() => toggle('morrisons')}
            style={{ display: 'none' }}
          />
          <span className="checkbox-custom">
            {filters.morrisons && (
              <svg width="20" height="20" viewBox="0 0 20 20"><polyline points="4,10 8,15 16,6" stroke="#fff" strokeWidth="2" fill="none"/></svg>
            )}
          </span>
          <span className="filter-label-text">Morrisons Stores</span>
        </label>
        <label className={`filter-checkbox ${filters.morrisonsDaily ? 'checked' : ''}`}>
          <input
            type="checkbox"
            name="morrisonsDaily"
            checked={filters.morrisonsDaily}
            onChange={() => toggle('morrisonsDaily')}
            style={{ display: 'none' }}
          />
          <span className="checkbox-custom">
            {filters.morrisonsDaily && (
              <svg width="20" height="20" viewBox="0 0 20 20"><polyline points="4,10 8,15 16,6" stroke="#fff" strokeWidth="2" fill="none"/></svg>
            )}
          </span>
          <span className="filter-label-text">Morrisons Daily</span>
        </label>
      </div>
    </div>
  );
};

export default Filter;