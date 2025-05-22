export interface IBrowserStorage {
  get(keys: string[] | string, area?: "local" | "sync"): Promise<any>;
  set(items: Record<string, any>, area?: "local" | "sync"): Promise<void>;
  remove(keys: string[] | string, area?: "local" | "sync"): Promise<void>;
}
