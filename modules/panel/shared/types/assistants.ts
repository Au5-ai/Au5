export interface Assistant {
  id: string;
  name: string;
  llmModel: string;
  icon?: string;
  instructions?: string;
  isDefault?: boolean;
  isActive?: boolean;
  description?: string;
}
