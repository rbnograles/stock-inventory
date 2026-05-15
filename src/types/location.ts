/**
 * Defines saved inventory locations for the location picker. Locations are
 * user-owned labels stored separately from item rows, letting the app offer a
 * reusable dropdown without changing the inventory item storage contract.
 */
export interface InventoryLocation {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
