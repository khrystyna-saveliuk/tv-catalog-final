import { describe, expect, it } from 'vitest';
import type { SavedShow } from '../src/types/library';
import type { ShowCardData } from '../src/types/tvmaze';
import {
    listBy,
    listFavorites,
    loadLibrary,
    saveLibrary,
    toggleFavorite,
    toggleList,
} from '../src/utils/library';

function makeCard(id: number): ShowCardData {
    return {
        id,
        name: `Show ${id}`,
        genres: ['Drama'],
        premiered: '2010-01-01',
        rating: { average: 8 },
        image: null,
    };
}

function fakeStorage(initial: string | null = null) {
    let value = initial;
    return {
        getItem: () => value,
        setItem: (_key: string, next: string) => {
            value = next;
        },
    };
}

describe('toggleList', () => {
    it('додає серіал до списку', () => {
        const result = toggleList([], makeCard(1), 'want', 100);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: 1,
            want: true,
            watched: false,
            favorite: false,
        });
    });

    it('дозволяє мати серіал в обох списках одночасно', () => {
        let library = toggleList([], makeCard(1), 'watched', 100);
        library = toggleList(library, makeCard(1), 'want', 200);
        expect(library).toHaveLength(1);
        expect(library[0]).toMatchObject({ want: true, watched: true });
    });

    it('прибирає серіал зі списку, лишаючи інший', () => {
        let library = toggleList([], makeCard(1), 'watched', 100);
        library = toggleList(library, makeCard(1), 'want', 200);
        library = toggleList(library, makeCard(1), 'want', 300);
        expect(library[0]).toMatchObject({ want: false, watched: true });
    });

    it('видаляє запис, коли не лишається жодного списку', () => {
        const library = toggleList([], makeCard(1), 'want', 100);
        expect(toggleList(library, makeCard(1), 'want', 200)).toEqual([]);
    });

    it('скидає улюблене, коли серіал прибрано з переглянутого', () => {
        let library = toggleList([], makeCard(1), 'watched', 100);
        library = toggleList(library, makeCard(1), 'want', 150);
        library = toggleFavorite(library, 1);
        expect(library[0]?.favorite).toBe(true);
        library = toggleList(library, makeCard(1), 'watched', 200);
        expect(library[0]).toMatchObject({ watched: false, favorite: false });
    });
});

describe('toggleFavorite', () => {
    it('перемикає улюблене для переглянутого серіалу', () => {
        let library = toggleList([], makeCard(1), 'watched', 100);
        library = toggleFavorite(library, 1);
        expect(library[0]?.favorite).toBe(true);
        library = toggleFavorite(library, 1);
        expect(library[0]?.favorite).toBe(false);
    });

    it('не змінює серіал, який не переглянуто', () => {
        const library = toggleList([], makeCard(1), 'want', 100);
        expect(toggleFavorite(library, 1)[0]?.favorite).toBe(false);
    });
});

describe('listBy і listFavorites', () => {
    let library: SavedShow[] = [];
    library = toggleList(library, makeCard(1), 'watched', 100);
    library = toggleList(library, makeCard(2), 'want', 200);
    library = toggleList(library, makeCard(3), 'watched', 300);
    library = toggleList(library, makeCard(1), 'want', 400);
    library = toggleFavorite(library, 1);

    it('повертає серіали зі списку, нещодавно змінені першими', () => {
        expect(listBy(library, 'watched').map((s) => s.id)).toEqual([1, 3]);
        expect(listBy(library, 'want').map((s) => s.id)).toEqual([1, 2]);
    });

    it('повертає лише улюблені', () => {
        expect(listFavorites(library).map((s) => s.id)).toEqual([1]);
    });
});

describe('loadLibrary і saveLibrary', () => {
    it('зберігає й читає ті самі дані', () => {
        const storage = fakeStorage();
        const library = toggleList([], makeCard(1), 'want', 100);
        expect(saveLibrary(library, storage)).toBe(true);
        expect(loadLibrary(storage)).toEqual(library);
    });

    it('повертає порожній масив для порожнього сховища', () => {
        expect(loadLibrary(fakeStorage())).toEqual([]);
    });

    it('повертає порожній масив для пошкодженого JSON', () => {
        expect(loadLibrary(fakeStorage('{not json'))).toEqual([]);
    });

    it('відкидає некоректні записи', () => {
        const good = toggleList([], makeCard(1), 'want', 100)[0];
        const raw = JSON.stringify([good, { id: 'x' }, null, 42]);
        expect(loadLibrary(fakeStorage(raw))).toEqual([good]);
    });

    it('відкидає записи старого формату', () => {
        const old = {
            ...makeCard(1),
            status: 'want',
            favorite: false,
            addedAt: 1,
        };
        expect(loadLibrary(fakeStorage(JSON.stringify([old])))).toEqual([]);
    });

    it('не падає, якщо сховище недоступне', () => {
        expect(loadLibrary(null)).toEqual([]);
        expect(saveLibrary([], null)).toBe(false);
    });

    it('повертає false, якщо запис викликає помилку', () => {
        const broken = {
            getItem: () => null,
            setItem: () => {
                throw new Error('quota exceeded');
            },
        };
        expect(saveLibrary([], broken)).toBe(false);
    });
});
