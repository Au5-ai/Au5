export interface Assistant {
  id: string;
  name: string;
  icon?: string;
  prompt?: string;
  isDefault?: boolean;
  isActive?: boolean;
  description?: string;
}
