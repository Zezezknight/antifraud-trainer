type Loader<T> = () => Promise<T>;

interface CachedLoaderOptions<T> {
  getSnapshot: () => T | null;
  setSnapshot: (value: T) => void;
  fetcher: Loader<T>;
  onError?: (error: unknown) => void;
}

export function createCachedLoader<T>({
  getSnapshot,
  setSnapshot,
  fetcher,
  onError,
}: CachedLoaderOptions<T>): Loader<T> {
  return async () => {
    const cachedValue = getSnapshot();

    if (cachedValue !== null) {
      return cachedValue;
    }

    try {
      const value = await fetcher();
      setSnapshot(value);
      return value;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  };
}

export async function composeLoaders<
  T extends Record<string, unknown>,
>(loaders: {
  [K in keyof T]: Loader<T[K]>;
}): Promise<T> {
  const entries = await Promise.all(
    (Object.entries(loaders) as [keyof T, Loader<T[keyof T]>][]).map(
      async ([key, loader]) => [key, await loader()] as const,
    ),
  );

  return Object.fromEntries(entries) as T;
}
