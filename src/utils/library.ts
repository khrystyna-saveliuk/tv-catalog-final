import type { ListKey, SavedShow } from '../types/library';
import type { ShowCardData } from '../types/tvmaze';

const STORAGE_KEY = 'tv-catalog:library';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function getStorage(): StorageLike | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function isSavedShow(value: unknown): value is SavedShow {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;

    const hasBasics =
        typeof v.id === 'number' &&
        typeof v.name === 'string' &&
        Array.isArray(v.genres);

    const hasShowData =
        (v.premiered === null || typeof v.premiered === 'string') &&
        typeof v.rating === 'object' &&
        v.rating !== null &&
        (v.image === null || typeof v.image === 'object');

    const hasLibraryData =
        typeof v.want === 'boolean' &&
        typeof v.watched === 'boolean' &&
        (v.want === true || v.watched === true) &&
        typeof v.favorite === 'boolean' &&
        typeof v.addedAt === 'number';

    return hasBasics && hasShowData && hasLibraryData;
}

export function loadLibrary(
    storage: StorageLike | null = getStorage(),
): SavedShow[] {
    if (!storage) return [];
    try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const data: unknown = JSON.parse(raw);
        return Array.isArray(data) ? data.filter(isSavedShow) : [];
    } catch {
        return [];
    }
}

export function saveLibrary(
    library: SavedShow[],
    storage: StorageLike | null = getStorage(),
): boolean {
    if (!storage) return false;
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(library));
        return true;
    } catch {
        return false;
    }
}

export function findShow(
    library: SavedShow[],
    id: number,
): SavedShow | undefined {
    return library.find((item) => item.id === id);
}

export function toggleList(
    library: SavedShow[],
    show: ShowCardData,
    list: ListKey,
    now: number = Date.now(),
): SavedShow[] {
    const previous = findShow(library, show.id);
    const rest = library.filter((item) => item.id !== show.id);
    const wasIn = previous?.[list] === true;

    const want = list === 'want' ? !wasIn : previous?.want === true;
    const watched = list === 'watched' ? !wasIn : previous?.watched === true;

    if (!want && !watched) return rest;

    const entry: SavedShow = {
        id: show.id,
        name: show.name,
        genres: show.genres,
        premiered: show.premiered,
        rating: { average: show.rating.average },
        image: show.image,
        want,
        watched,
        favorite: watched && previous?.favorite === true,
        addedAt: wasIn ? (previous?.addedAt ?? now) : now,
    };
    return [...rest, entry];
}

export function toggleFavorite(library: SavedShow[], id: number): SavedShow[] {
    return library.map((item) =>
        item.id === id && item.watched
            ? { ...item, favorite: !item.favorite }
            : item,
    );
}

function newestFirst(items: SavedShow[]): SavedShow[] {
    return [...items].sort((a, b) => b.addedAt - a.addedAt);
}

export function listBy(library: SavedShow[], list: ListKey): SavedShow[] {
    return newestFirst(library.filter((item) => item[list]));
}

export function listFavorites(library: SavedShow[]): SavedShow[] {
    return newestFirst(library.filter((item) => item.watched && item.favorite));
}
