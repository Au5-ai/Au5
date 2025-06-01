export interface IBrowser extends IBrowserInjector, IBrowserStorage {
  name: string;
}

export interface IBrowserStorage {
  get(keys: string[] | string, area?: "local" | "sync"): Promise<any>;
  set(items: Record<string, any>, area?: "local" | "sync"): Promise<void>;
  remove(keys: string[] | string, area?: "local" | "sync"): Promise<void>;
}

export interface IBrowserInjector {
  inject(fileName: string, onLoad?: () => void): void;
}
