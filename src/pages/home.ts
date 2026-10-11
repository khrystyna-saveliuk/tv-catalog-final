import '../styles/base.css';
import { ApiError, getShowsPage, searchShows } from '../api/tvmaze';
import { clearCheckedValues, getCheckedValues, renderCheckboxGroup } from '../components/checkboxGroup';
import { createShowCard } from '../components/showCard';
import { showError, showLoading, showMessage } from '../components/status';
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

const PAGE_SIZE = 24;

const form = getElement<HTMLFormElement>('search-form');
const input = getElement<HTMLInputElement>('search-input');
const genreOptions = getElement<HTMLElement>('genre-options');
const decadeOptions = getElement<HTMLElement>('decade-options');
const sortSelect = getElement<HTMLSelectElement>('sort-select');
const statusElement = getElement<HTMLElement>('status');
const listElement = getElement<HTMLUListElement>('results-list');
const moreButton = getElement<HTMLButtonElement>('show-more');
const resetButton = getElement<HTMLButtonElement>('reset-filters');

let allShows: Show[] = [];
let visibleCount = PAGE_SIZE;
let controller: AbortController | null = null;

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
}

function resetAndRender(): void {
    visibleCount = PAGE_SIZE;
    renderList();
}

async function load(query: string): Promise<void> {
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
        visibleCount = PAGE_SIZE;
        renderFilters();
        renderList();
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        const message =
            error instanceof ApiError ? error.message : 'Сталася невідома помилка.';
        showError(statusElement, message, () => void load(query));
    }
}

function search(query: string): void {
    window.history.pushState(null, '', query ? `/?q=${encodeURIComponent(query)}` : '/');
    void load(query);
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
    visibleCount += PAGE_SIZE;
    renderList();
    listElement.querySelectorAll('a')[previousCount]?.focus();
});

window.addEventListener('popstate', () => {
    const query = getQueryFromUrl();
    input.value = query;
    void load(query);
});

const initialQuery = getQueryFromUrl();
input.value = initialQuery;
void load(initialQuery);