import { describe, expect, it } from 'vitest';
import {
    filterByDecades,
    filterByGenres,
    getDecade,
    getDecades,
    getGenres,
    isSortKey,
    sortShows,
} from '../src/utils/filters';
import type { Show } from '../src/types/tvmaze';

function makeShow(overrides: Partial<Show> = {}): Show {
    return {
        id: 1,
        name: 'Test show',
        genres: [],
        status: 'Ended',
        premiered: null,
        language: 'English',
        rating: { average: null },
        image: null,
        summary: null,
        ...overrides,
    };
}

describe('getGenres', () => {
    it('повертає унікальні жанри в алфавітному порядку', () => {
        const shows = [
            makeShow({ genres: ['Drama', 'Comedy'] }),
            makeShow({ genres: ['Drama', 'Action'] }),
        ];
        expect(getGenres(shows)).toEqual(['Action', 'Comedy', 'Drama']);
    });

    it('повертає порожній масив для порожнього списку', () => {
        expect(getGenres([])).toEqual([]);
    });
});

describe('filterByGenres', () => {
    const drama = makeShow({ id: 1, genres: ['Drama'] });
    const dramaComedy = makeShow({ id: 2, genres: ['Drama', 'Comedy'] });
    const comedy = makeShow({ id: 3, genres: ['Comedy'] });
    const shows = [drama, dramaComedy, comedy];

    it('без обраних жанрів повертає всі серіали', () => {
        expect(filterByGenres(shows, [])).toEqual(shows);
    });

    it('один жанр: повертає серіали з цим жанром', () => {
        expect(filterByGenres(shows, ['Drama'])).toEqual([drama, dramaComedy]);
    });

    it('кілька жанрів: повертає лише серіали з усіма обраними', () => {
        expect(filterByGenres(shows, ['Drama', 'Comedy'])).toEqual([
            dramaComedy,
        ]);
    });
});

describe('getDecade', () => {
    it('обчислює десятиліття за датою прем’єри', () => {
        expect(getDecade(makeShow({ premiered: '2013-06-24' }))).toBe(2010);
        expect(getDecade(makeShow({ premiered: '1999-12-31' }))).toBe(1990);
    });

    it('повертає null, якщо дати немає', () => {
        expect(getDecade(makeShow({ premiered: null }))).toBeNull();
    });
});

describe('getDecades', () => {
    it('повертає унікальні десятиліття від нових до старих', () => {
        const shows = [
            makeShow({ premiered: '2013-01-01' }),
            makeShow({ premiered: '2019-05-05' }),
            makeShow({ premiered: '1995-03-03' }),
            makeShow({ premiered: null }),
        ];
        expect(getDecades(shows)).toEqual([2010, 1990]);
    });
});

describe('filterByDecades', () => {
    const old = makeShow({ id: 1, premiered: '1995-01-01' });
    const middle = makeShow({ id: 2, premiered: '2005-01-01' });
    const recent = makeShow({ id: 3, premiered: '2015-01-01' });
    const noDate = makeShow({ id: 4, premiered: null });
    const shows = [old, middle, recent, noDate];

    it('без обраних десятиліть повертає всі серіали', () => {
        expect(filterByDecades(shows, [])).toEqual(shows);
    });

    it('повертає серіали з будь-якого обраного десятиліття', () => {
        expect(filterByDecades(shows, [1990, 2010])).toEqual([old, recent]);
    });

    it('виключає серіали без дати, коли фільтр активний', () => {
        expect(filterByDecades(shows, [2000])).toEqual([middle]);
    });
});

describe('sortShows', () => {
    const a = makeShow({
        id: 1,
        rating: { average: 7 },
        premiered: '2010-01-01',
    });
    const b = makeShow({
        id: 2,
        rating: { average: 9 },
        premiered: '2020-01-01',
    });
    const c = makeShow({ id: 3, rating: { average: null }, premiered: null });
    const shows = [a, c, b];

    it('rating: від найвищого, без рейтингу в кінці', () => {
        expect(sortShows(shows, 'rating')).toEqual([b, a, c]);
    });

    it('newest: від найновіших, без дати в кінці', () => {
        expect(sortShows(shows, 'newest')).toEqual([b, a, c]);
    });

    it('oldest: від найстаріших, без дати в кінці', () => {
        expect(sortShows(shows, 'oldest')).toEqual([a, b, c]);
    });

    it('не змінює початковий масив', () => {
        const copy = [...shows];
        sortShows(shows, 'rating');
        expect(shows).toEqual(copy);
    });
});

describe('isSortKey', () => {
    it('приймає відомі ключі', () => {
        expect(isSortKey('rating')).toBe(true);
        expect(isSortKey('newest')).toBe(true);
        expect(isSortKey('oldest')).toBe(true);
    });

    it('відхиляє невідомі значення', () => {
        expect(isSortKey('name')).toBe(false);
        expect(isSortKey('')).toBe(false);
    });
});
