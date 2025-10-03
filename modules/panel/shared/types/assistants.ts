export interface Assistant {
  id: string;
  name: string;
  icon?: string;
  instructions?: string;
  isDefault?: boolean;
  isActive?: boolean;
  description?: string;
}
