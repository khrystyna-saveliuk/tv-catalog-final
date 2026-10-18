import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ApiError,
    getErrorMessage,
    getShow,
    getShowsPage,
    isAbortError,
    searchShows,
} from '../src/api/tvmaze';

const fetchMock = vi.fn();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), { status });
}

async function catchError(promise: Promise<unknown>): Promise<unknown> {
    try {
        await promise;
    } catch (error) {
        return error;
    }
    throw new Error('Очікувалась помилка, але запит завершився успішно');
}

describe('searchShows', () => {
    it('повертає серіали з результатів пошуку', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse([
                { score: 1, show: { id: 1, name: 'A' } },
                { score: 0.5, show: { id: 2, name: 'B' } },
            ]),
        );

        const shows = await searchShows('office');

        expect(shows.map((show) => show.id)).toEqual([1, 2]);
    });

    it('кодує запит в адресі', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));

        await searchShows('breaking bad & co');

        const url = String(fetchMock.mock.calls[0]?.[0]);
        expect(url).toBe(
            'https://api.tvmaze.com/search/shows?q=breaking%20bad%20%26%20co',
        );
    });

    it('передає сигнал скасування в fetch', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));
        const controller = new AbortController();

        await searchShows('x', controller.signal);

        const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
        expect(options.signal).toBe(controller.signal);
    });
});

describe('getShow і getShowsPage', () => {
    it('getShow повертає розібраний JSON', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 82, name: 'GoT' }));

        const show = await getShow(82);

        expect(show.name).toBe('GoT');
        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
            'https://api.tvmaze.com/shows/82',
        );
    });

    it('getShowsPage запитує потрібну сторінку', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));

        await getShowsPage(3);

        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
            'https://api.tvmaze.com/shows?page=3',
        );
    });
});

describe('помилки API', () => {
    it('404 дає ApiError зі статусом 404', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

        const error = await catchError(getShow(1));

        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe('Нічого не знайдено.');
    });

    it('429 повідомляє про забагато запитів', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 429 }));

        const error = await catchError(getShow(1));

        expect((error as ApiError).status).toBe(429);
        expect((error as ApiError).message).toContain('Забагато запитів');
    });

    it('500 дає загальну помилку сервера', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

        const error = await catchError(getShow(1));

        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Сервер повернув помилку.');
    });

    it('проблема з мережею дає ApiError без статусу', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        const error = await catchError(getShow(1));

        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBeNull();
        expect((error as ApiError).message).toContain('з’єднатися');
    });

    it('скасований запит не перетворюється на ApiError', async () => {
        fetchMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

        const error = await catchError(getShow(1));

        expect(error).not.toBeInstanceOf(ApiError);
        expect(isAbortError(error)).toBe(true);
    });
});

describe('isAbortError і getErrorMessage', () => {
    it('isAbortError розрізняє скасування та інші помилки', () => {
        expect(isAbortError(new DOMException('x', 'AbortError'))).toBe(true);
        expect(isAbortError(new Error('x'))).toBe(false);
        expect(isAbortError(null)).toBe(false);
    });

    it('getErrorMessage повертає текст ApiError', () => {
        expect(getErrorMessage(new ApiError('Текст', 500))).toBe('Текст');
    });

    it('getErrorMessage має запасний текст для невідомих помилок', () => {
        expect(getErrorMessage(new Error('внутрішня'))).toBe(
            'Сталася невідома помилка.',
        );
        expect(getErrorMessage('рядок')).toBe('Сталася невідома помилка.');
    });
});
