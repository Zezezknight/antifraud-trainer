type Loader<T> = () => Promise<T>;

type CachedLoaderOptions<T> =
  | {
      getSnapshot: () => T | null;
      setSnapshot: (value: T) => void;
      fetcher: () => Promise<T>;
      onError?: (error: unknown) => void;
      needToThrowError: true;
    }
  | {
      getSnapshot: () => T | null;
      setSnapshot: (value: T) => void;
      fetcher: () => Promise<T>;
      onError?: (error: unknown) => void;
      needToThrowError?: false;
      fallback: T; // обязателен, если не кидаем ошибку
    };

export function createCachedLoader<T>(
  options: CachedLoaderOptions<T>,
): Loader<T> {
  const { getSnapshot, setSnapshot, fetcher, onError } = options;

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
      if (options.needToThrowError) throw error;
      return options.fallback;
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
