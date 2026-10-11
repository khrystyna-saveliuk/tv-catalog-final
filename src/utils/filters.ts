import type { Show } from '../types/tvmaze';

export type SortKey = 'rating' | 'newest' | 'oldest';

export function isSortKey(value: string): value is SortKey {
    return value === 'rating' || value === 'newest' || value === 'oldest';
}

export function getGenres(shows: Show[]): string[] {
    const unique = new Set(shows.flatMap((show) => show.genres));
    return [...unique].sort((a, b) => a.localeCompare(b));
}

export function filterByGenres(shows: Show[], genres: string[]): Show[] {
    if (genres.length === 0) return shows;
    return shows.filter((show) =>
        genres.every((genre) => show.genres.includes(genre)),
    );
}

export function getDecade(show: Show): number | null {
    if (!show.premiered) return null;
    const year = Number(show.premiered.slice(0, 4));
    if (Number.isNaN(year)) return null;
    return Math.floor(year / 10) * 10;
}

export function getDecades(shows: Show[]): number[] {
    const unique = new Set<number>();
    for (const show of shows) {
        const decade = getDecade(show);
        if (decade !== null) unique.add(decade);
    }
    return [...unique].sort((a, b) => b - a);
}

export function filterByDecades(shows: Show[], decades: number[]): Show[] {
    if (decades.length === 0) return shows;
    return shows.filter((show) => {
        const decade = getDecade(show);
        return decade !== null && decades.includes(decade);
    });
}

function byPremiered(direction: 1 | -1) {
    return (a: Show, b: Show): number => {
        if (a.premiered === b.premiered) return 0;
        if (a.premiered === null) return 1;
        if (b.premiered === null) return -1;
        return direction * a.premiered.localeCompare(b.premiered);
    };
}

export function sortShows(shows: Show[], key: SortKey): Show[] {
    const copy = [...shows];

    switch (key) {
        case 'rating':
            return copy.sort(
                (a, b) => (b.rating.average ?? -1) - (a.rating.average ?? -1),
            );
        case 'newest':
            return copy.sort(byPremiered(-1));
        case 'oldest':
            return copy.sort(byPremiered(1));
    }
}