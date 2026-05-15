/**
 * Compact location filter that appears beside the Location sort mode. It lets
 * Ryan narrow the dashboard to one saved place, including items without a
 * location, while preserving the lightweight toolbar layout used on mobile.
 */
import { ChevronDown, MapPin } from "lucide-react";

interface InventoryLocationSelectProps {
  value: string;
  locations: string[];
  onChange: (location: string) => void;
}

export const ALL_LOCATIONS = "All";
export const NO_LOCATION = "__NO_LOCATION__";
const NO_LOCATION_LABEL = "No location";

export const InventoryLocationSelect = ({
  value,
  locations,
  onChange,
}: InventoryLocationSelectProps) => (
  <label className="relative inline-flex h-9 max-w-[8.5rem] items-center rounded-full bg-white pl-3 pr-8 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
    <span className="sr-only">Filter by location</span>
    <MapPin className="mr-1.5 h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" aria-hidden="true" />
    <select
      value={value}
      aria-label="Filter by location"
      onChange={(event) => onChange(event.target.value)}
      className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full bg-transparent opacity-0"
    >
      <option value={ALL_LOCATIONS}>All locations</option>
      {locations.includes(NO_LOCATION) ? <option value={NO_LOCATION}>{NO_LOCATION_LABEL}</option> : null}
      {locations.map((location) => (
        location === NO_LOCATION ? null : (
          <option key={location} value={location}>
            {location}
          </option>
        )
      ))}
    </select>
    <span className="truncate" aria-hidden="true">
      {value === ALL_LOCATIONS ? "All" : value === NO_LOCATION ? NO_LOCATION_LABEL : value}
    </span>
    <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
  </label>
);
