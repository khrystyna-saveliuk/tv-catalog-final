import type { CastMember, Episode, SearchResult, Show } from '../types/tvmaze';

const BASE_URL = 'https://api.tvmaze.com';

export class ApiError extends Error {
    readonly status: number | null;

    constructor(message: string, status: number | null = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${path}`, { signal });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        throw new ApiError('Не вдалося з’єднатися з сервером. Перевірте інтернет.');
    }

    if (!response.ok) {
        if (response.status === 404) throw new ApiError('Нічого не знайдено.', 404);
        if (response.status === 429) {
            throw new ApiError('Забагато запитів. Спробуйте за кілька секунд.', 429);
        }
        throw new ApiError('Сервер повернув помилку.', response.status);
    }

    return (await response.json()) as T;
}

export async function searchShows(query: string, signal?: AbortSignal): Promise<Show[]> {
    const results = await request<SearchResult[]>(
        `/search/shows?q=${encodeURIComponent(query)}`,
        signal,
    );
    return results.map((item) => item.show);
}

export function getShow(id: number, signal?: AbortSignal): Promise<Show> {
    return request<Show>(`/shows/${id}`, signal);
}

export function getCast(id: number, signal?: AbortSignal): Promise<CastMember[]> {
    return request<CastMember[]>(`/shows/${id}/cast`, signal);
}

export function getEpisodes(id: number, signal?: AbortSignal): Promise<Episode[]> {
    return request<Episode[]>(`/shows/${id}/episodes`, signal);
}

export async function getFeaturedShows(signal?: AbortSignal): Promise<Show[]> {
    const shows = await request<Show[]>('/shows?page=0', signal);
    return shows
        .filter((show) => show.rating.average !== null)
        .sort((a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0))
        .slice(0, 12);
}