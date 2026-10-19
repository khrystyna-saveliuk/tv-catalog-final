import {
    ApiError,
    getCast,
    getEpisodes,
    getErrorMessage,
    getShow,
} from '../api/tvmaze';
import { createCastItem } from '../components/castItem';
import { createEpisodeItem } from '../components/episodeItem';
import { initLibraryActions } from '../components/libraryActions';
import { createMetaItems } from '../components/showMeta';
import {
    clearStatus,
    showError,
    showLoading,
    showMessage,
} from '../components/status';
import { initThemeToggle } from '../components/themeToggle';
import type { CastMember, Episode, Show } from '../types/tvmaze';
import { getElement } from '../utils/dom';
import { groupBySeason } from '../utils/episodes';
import { htmlToParagraphs } from '../utils/text';
import { parseShowId } from '../utils/url';

initThemeToggle();
const showLibraryActions = initLibraryActions();

const CAST_PREVIEW = 6;

const statusElement = getElement<HTMLElement>('status');
const details = getElement<HTMLElement>('show-details');
const titleElement = getElement<HTMLHeadingElement>('show-title');
const poster = getElement<HTMLImageElement>('show-poster');
const metaList = getElement<HTMLElement>('show-meta');
const summaryElement = getElement<HTMLElement>('show-summary');

const castStatus = getElement<HTMLElement>('cast-status');
const castList = getElement<HTMLUListElement>('cast-list');
const castMore = getElement<HTMLButtonElement>('cast-more');

const episodesStatus = getElement<HTMLElement>('episodes-status');
const seasonControls = getElement<HTMLElement>('season-controls');
const seasonSelect = getElement<HTMLSelectElement>('season-select');
const episodesList = getElement<HTMLOListElement>('episodes-list');

let cast: CastMember[] = [];
let castExpanded = false;
let seasons = new Map<number, Episode[]>();

function renderShow(show: Show): void {
    document.title = `${show.name} — Серіали`;
    titleElement.textContent = show.name;

    if (show.image) {
        poster.src = show.image.medium;
        poster.alt = `Постер серіалу ${show.name}`;
    } else {
        poster.hidden = true;
    }

    metaList.replaceChildren(...createMetaItems(show));

    const paragraphs = htmlToParagraphs(show.summary).map((text) => {
        const p = document.createElement('p');
        p.textContent = text;
        return p;
    });
    if (paragraphs.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Опис відсутній.';
        paragraphs.push(p);
    }
    summaryElement.replaceChildren(...paragraphs);

    showLibraryActions(show);
    details.hidden = false;
}

function renderCast(): void {
    const visible = castExpanded ? cast : cast.slice(0, CAST_PREVIEW);
    castList.replaceChildren(...visible.map(createCastItem));

    castMore.hidden = cast.length <= CAST_PREVIEW;
    castMore.textContent = castExpanded
        ? 'Сховати'
        : `Показати всіх (${cast.length})`;
}

function renderSeason(season: number): void {
    const episodes = seasons.get(season) ?? [];
    episodesList.replaceChildren(...episodes.map(createEpisodeItem));
    showMessage(
        episodesStatus,
        `Сезон ${season}, епізодів: ${episodes.length}`,
    );
}

async function loadCast(id: number): Promise<void> {
    castList.replaceChildren();
    castMore.hidden = true;
    castExpanded = false;
    showLoading(castStatus);

    try {
        cast = await getCast(id);
        if (cast.length === 0) {
            showMessage(
                castStatus,
                'Інформація про акторський склад відсутня.',
            );
            return;
        }
        clearStatus(castStatus);
        renderCast();
    } catch (error) {
        showError(castStatus, getErrorMessage(error), () => void loadCast(id));
    }
}

async function loadEpisodes(id: number): Promise<void> {
    episodesList.replaceChildren();
    seasonControls.hidden = true;
    showLoading(episodesStatus);

    try {
        const episodes = await getEpisodes(id);
        seasons = groupBySeason(episodes);

        if (seasons.size === 0) {
            showMessage(episodesStatus, 'Інформація про епізоди відсутня.');
            return;
        }

        seasonSelect.replaceChildren(
            ...[...seasons.keys()].map(
                (n) => new Option(`Сезон ${n}`, String(n)),
            ),
        );
        seasonControls.hidden = false;
        renderSeason(Number(seasonSelect.value));
    } catch (error) {
        showError(
            episodesStatus,
            getErrorMessage(error),
            () => void loadEpisodes(id),
        );
    }
}

async function load(): Promise<void> {
    const id = parseShowId(window.location.search);
    if (id === null) {
        showError(
            statusElement,
            'Некоректне посилання на серіал. Поверніться на головну й оберіть серіал зі списку.',
        );
        return;
    }

    details.hidden = true;
    showLoading(statusElement);

    try {
        const show = await getShow(id);
        renderShow(show);
        clearStatus(statusElement);
    } catch (error) {
        const retryable = !(error instanceof ApiError && error.status === 404);
        showError(
            statusElement,
            getErrorMessage(error),
            retryable ? () => void load() : undefined,
        );
        return;
    }

    void loadCast(id);
    void loadEpisodes(id);
}

castMore.addEventListener('click', () => {
    castExpanded = !castExpanded;
    renderCast();
    showMessage(
        castStatus,
        `Показано ${castExpanded ? cast.length : Math.min(CAST_PREVIEW, cast.length)} з ${cast.length}`,
    );
});

seasonSelect.addEventListener('change', () => {
    renderSeason(Number(seasonSelect.value));
});

void load();
