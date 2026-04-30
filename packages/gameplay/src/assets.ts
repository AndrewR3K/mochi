export type AssetStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AssetLoader<T> {
  load(): T | Promise<T>;
}

export interface AssetRecord<T> {
  readonly id: string;
  readonly status: AssetStatus;
  readonly value: T | null;
  readonly error: unknown;
  load(): Promise<T>;
  reset(): void;
}

export interface AssetRegistry {
  register<T>(id: string, loader: AssetLoader<T> | (() => T | Promise<T>)): AssetRecord<T>;
  get<T>(id: string): AssetRecord<T> | undefined;
  load<T>(id: string): Promise<T>;
  preload(ids?: Iterable<string>): Promise<void>;
  clear(): void;
}

class AssetRecordImpl<T> implements AssetRecord<T> {
  status: AssetStatus = 'idle';
  value: T | null = null;
  error: unknown = null;
  private pending: Promise<T> | null = null;

  constructor(
    readonly id: string,
    private readonly loader: () => T | Promise<T>,
  ) {}

  async load(): Promise<T> {
    if (this.status === 'ready') return this.value as T;
    if (this.pending) return this.pending;

    this.status = 'loading';
    this.error = null;
    this.pending = Promise.resolve()
      .then(this.loader)
      .then((value) => {
        this.value = value;
        this.status = 'ready';
        this.pending = null;
        return value;
      })
      .catch((error: unknown) => {
        this.error = error;
        this.status = 'error';
        this.pending = null;
        throw error;
      });

    return this.pending;
  }

  reset(): void {
    this.status = 'idle';
    this.value = null;
    this.error = null;
    this.pending = null;
  }
}

export function createAssetRegistry(): AssetRegistry {
  const records = new Map<string, AssetRecordImpl<unknown>>();

  return {
    register(id, loader) {
      if (records.has(id)) {
        throw new Error(`Asset "${id}" is already registered.`);
      }

      const load = typeof loader === 'function'
        ? loader
        : () => loader.load();
      const record = new AssetRecordImpl(id, load);
      records.set(id, record as AssetRecordImpl<unknown>);
      return record;
    },
    get<T>(id: string) {
      return records.get(id) as AssetRecord<T> | undefined;
    },
    load<T>(id: string) {
      const record = records.get(id);
      if (!record) {
        return Promise.reject(new Error(`Asset "${id}" is not registered.`));
      }
      return record.load() as Promise<T>;
    },
    async preload(ids) {
      const selected = ids
        ? [...ids].map((id) => {
          const record = records.get(id);
          if (!record) throw new Error(`Asset "${id}" is not registered.`);
          return record;
        })
        : [...records.values()];

      await Promise.all(selected.map((record) => record.load()));
    },
    clear() {
      records.clear();
    },
  };
}
