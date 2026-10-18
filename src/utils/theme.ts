export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'tv-catalog:theme';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark';
}

export function resolveTheme(
    stored: string | null,
    prefersDark: boolean,
): Theme {
    if (isTheme(stored)) return stored;
    return prefersDark ? 'dark' : 'light';
}

export function toggleTheme(theme: Theme): Theme {
    return theme === 'dark' ? 'light' : 'dark';
}

function getStorage(): StorageLike | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

export function loadStoredTheme(
    storage: StorageLike | null = getStorage(),
): string | null {
    if (!storage) return null;
    try {
        return storage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function saveTheme(
    theme: Theme,
    storage: StorageLike | null = getStorage(),
): boolean {
    if (!storage) return false;
    try {
        storage.setItem(STORAGE_KEY, theme);
        return true;
    } catch {
        return false;
    }
}
