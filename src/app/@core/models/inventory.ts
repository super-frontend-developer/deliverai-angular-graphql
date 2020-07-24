import { InventoryItem } from './inventory-item';

export class InventoryModel {
  id: number;
  userAvatar: string;
  owner: string;
  price: number;
  currency: string;
  availability: boolean;
  expanded: boolean;
  children: InventoryItem[]
}
