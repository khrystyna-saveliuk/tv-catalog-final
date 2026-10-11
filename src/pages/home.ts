import { ApiError, getShowsPage, searchShows } from '../api/tvmaze';
import {
    clearCheckedValues,
    getCheckedValues,
    renderCheckboxGroup,
    setCheckedValues,
} from '../components/checkboxGroup';
import { createShowCard } from '../components/showCard';
import { showError, showLoading, showMessage } from '../components/status';
import { HOME_PAGE_SIZE } from '../config';
import type { Show } from '../types/tvmaze';
import { getElement } from '../utils/dom';
import {
    filterByDecades,
    filterByGenres,
    getDecades,
    getGenres,
    isSortKey,
    sortShows,
} from '../utils/filters';

interface PageState {
    visibleCount: number;
    genres: string[];
    decades: string[];
    sort: string;
}

const form = getElement<HTMLFormElement>('search-form');
const input = getElement<HTMLInputElement>('search-input');
const genreOptions = getElement<HTMLElement>('genre-options');
const decadeOptions = getElement<HTMLElement>('decade-options');
const sortSelect = getElement<HTMLSelectElement>('sort-select');
const resetButton = getElement<HTMLButtonElement>('reset-filters');
const genreCount = getElement<HTMLElement>('genre-count');
const decadeCount = getElement<HTMLElement>('decade-count');
const statusElement = getElement<HTMLElement>('status');
const listElement = getElement<HTMLUListElement>('results-list');
const moreButton = getElement<HTMLButtonElement>('show-more');

let allShows: Show[] = [];
let visibleCount = HOME_PAGE_SIZE;
let controller: AbortController | null = null;

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readState(): PageState | null {
    const state: unknown = window.history.state;
    if (typeof state !== 'object' || state === null) return null;
    const v = state as Record<string, unknown>;
    if (
        typeof v.visibleCount === 'number' &&
        isStringArray(v.genres) &&
        isStringArray(v.decades) &&
        typeof v.sort === 'string'
    ) {
        return {
            visibleCount: v.visibleCount,
            genres: v.genres,
            decades: v.decades,
            sort: v.sort,
        };
    }
    return null;
}

function saveState(): void {
    const state: PageState = {
        visibleCount,
        genres: getCheckedValues(genreOptions),
        decades: getCheckedValues(decadeOptions),
        sort: sortSelect.value,
    };
    window.history.replaceState(state, '');
}

function getQueryFromUrl(): string {
    return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
}

function renderFilters(): void {
    renderCheckboxGroup(
        genreOptions,
        'genre',
        getGenres(allShows).map((genre) => ({ value: genre, label: genre })),
    );
    renderCheckboxGroup(
        decadeOptions,
        'decade',
        getDecades(allShows).map((decade) => ({
            value: String(decade),
            label: `${decade}-ті`,
        })),
    );
}

function renderList(): void {
    const sortKey = isSortKey(sortSelect.value) ? sortSelect.value : 'rating';
    const genres = getCheckedValues(genreOptions);
    const decades = getCheckedValues(decadeOptions).map(Number);
    genreCount.textContent = genres.length > 0 ? `(${genres.length})` : '';
    decadeCount.textContent = decades.length > 0 ? `(${decades.length})` : '';

    const filtered = filterByDecades(filterByGenres(allShows, genres), decades);
    const sorted = sortShows(filtered, sortKey);
    const visible = sorted.slice(0, visibleCount);

    listElement.replaceChildren(...visible.map(createShowCard));
    moreButton.hidden = visible.length >= sorted.length;

    if (sorted.length === 0) {
        showMessage(
            statusElement,
            'Нічого не знайдено. Спробуйте інший запит або зніміть фільтри.',
        );
    } else {
        showMessage(statusElement, `Показано ${visible.length} з ${sorted.length}`);
    }

    saveState();
}

function resetAndRender(): void {
    visibleCount = HOME_PAGE_SIZE;
    renderList();
}

async function load(query: string, saved: PageState | null): Promise<void> {
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;

    listElement.replaceChildren();
    moreButton.hidden = true;
    showLoading(statusElement);

    try {
        allShows = query
            ? await searchShows(query, signal)
            : await getShowsPage(0, signal);

        renderFilters();
        visibleCount = HOME_PAGE_SIZE;

        if (saved) {
            setCheckedValues(genreOptions, saved.genres);
            setCheckedValues(decadeOptions, saved.decades);
            if (isSortKey(saved.sort)) sortSelect.value = saved.sort;
            visibleCount = Math.max(saved.visibleCount, HOME_PAGE_SIZE);
        }

        renderList();
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        const message =
            error instanceof ApiError ? error.message : 'Сталася невідома помилка.';
        showError(statusElement, message, () => void load(query, saved));
    }
}

function search(query: string): void {
    window.history.pushState(null, '', query ? `/?q=${encodeURIComponent(query)}` : '/');
    void load(query, null);
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    search(input.value.trim());
});

input.addEventListener('input', () => {
    if (input.value.trim() === '' && getQueryFromUrl() !== '') {
        search('');
    }
});

genreOptions.addEventListener('change', resetAndRender);
decadeOptions.addEventListener('change', resetAndRender);
sortSelect.addEventListener('change', resetAndRender);

resetButton.addEventListener('click', () => {
    clearCheckedValues(genreOptions);
    clearCheckedValues(decadeOptions);
    sortSelect.value = 'rating';
    resetAndRender();
});

moreButton.addEventListener('click', () => {
    const previousCount = visibleCount;
    visibleCount += HOME_PAGE_SIZE;
    renderList();
    listElement.querySelectorAll('a')[previousCount]?.focus();
});

window.addEventListener('popstate', () => {
    const query = getQueryFromUrl();
    input.value = query;
    void load(query, readState());
});

const initialQuery = getQueryFromUrl();
input.value = initialQuery;
void load(initialQuery, readState());