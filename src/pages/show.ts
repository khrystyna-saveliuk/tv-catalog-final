import { ApiError, getCast, getEpisodes, getShow } from '../api/tvmaze';
import { createCastItem } from '../components/castItem';
import { createEpisodeItem } from '../components/episodeItem';
import { createIcon, type IconName } from '../components/icons';
import { createMetaItems } from '../components/showMeta';
import {
    clearStatus,
    showError,
    showLoading,
    showMessage,
} from '../components/status';
import type { ListKey, SavedShow } from '../types/library';
import type { CastMember, Episode, Show } from '../types/tvmaze';
import { getElement } from '../utils/dom';
import { groupBySeason } from '../utils/episodes';
import {
    findShow,
    loadLibrary,
    saveLibrary,
    toggleFavorite,
    toggleList,
} from '../utils/library';
import { htmlToParagraphs } from '../utils/text';
import { parseShowId } from '../utils/url';
import { initThemeToggle } from '../components/themeToggle';

initThemeToggle();

const CAST_PREVIEW = 6;

const statusElement = getElement<HTMLElement>('status');
const details = getElement<HTMLElement>('show-details');
const titleElement = getElement<HTMLHeadingElement>('show-title');
const poster = getElement<HTMLImageElement>('show-poster');
const metaList = getElement<HTMLElement>('show-meta');
const summaryElement = getElement<HTMLElement>('show-summary');

const wantButton = getElement<HTMLButtonElement>('want-toggle');
const watchedButton = getElement<HTMLButtonElement>('watched-toggle');
const favoriteButton = getElement<HTMLButtonElement>('favorite-toggle');
const favoriteHint = getElement<HTMLElement>('favorite-hint');
const libraryMessage = getElement<HTMLElement>('library-message');

const castStatus = getElement<HTMLElement>('cast-status');
const castList = getElement<HTMLUListElement>('cast-list');
const castMore = getElement<HTMLButtonElement>('cast-more');

const episodesStatus = getElement<HTMLElement>('episodes-status');
const seasonControls = getElement<HTMLElement>('season-controls');
const seasonSelect = getElement<HTMLSelectElement>('season-select');
const episodesList = getElement<HTMLOListElement>('episodes-list');

let currentShow: Show | null = null;
let library: SavedShow[] = loadLibrary();
let cast: CastMember[] = [];
let castExpanded = false;
let seasons = new Map<number, Episode[]>();

function errorMessage(error: unknown): string {
    return error instanceof ApiError
        ? error.message
        : 'Сталася невідома помилка.';
}

const LIST_NAMES: Record<ListKey, string> = {
    want: 'Хочу подивитись',
    watched: 'Переглянуто',
};

function setActionButton(
    button: HTMLButtonElement,
    icon: IconName,
    label: string,
    active: boolean,
): void {
    button.replaceChildren(createIcon(icon), label);
    button.dataset.active = String(active);
}

function renderLibraryControls(show: Show): void {
    const saved = findShow(library, show.id);
    const isWant = saved?.want === true;
    const isWatched = saved?.watched === true;
    const isFavorite = saved?.favorite === true;

    setActionButton(
        wantButton,
        isWant ? 'check' : 'plus',
        isWant
            ? `Прибрати з «${LIST_NAMES.want}»`
            : `Додати до «${LIST_NAMES.want}»`,
        isWant,
    );
    setActionButton(
        watchedButton,
        isWatched ? 'check' : 'plus',
        isWatched
            ? `Прибрати з «${LIST_NAMES.watched}»`
            : `Додати до «${LIST_NAMES.watched}»`,
        isWatched,
    );

    const favoriteLabel = isFavorite
        ? 'Прибрати з улюбленого'
        : 'Додати до улюбленого';
    favoriteButton.replaceChildren(createIcon('heart', isFavorite));
    favoriteButton.setAttribute('aria-label', favoriteLabel);
    favoriteButton.title = favoriteLabel;
    favoriteButton.dataset.active = String(isFavorite);

    favoriteButton.disabled = !isWatched;
    favoriteHint.hidden = isWatched;
}

function applyLibrary(next: SavedShow[], message: string): void {
    library = next;
    libraryMessage.textContent = saveLibrary(library)
        ? message
        : 'Не вдалося зберегти зміни: сховище браузера недоступне. Вони діють лише поки відкрита ця сторінка.';
    if (currentShow) renderLibraryControls(currentShow);
}

function changeList(list: ListKey): void {
    if (!currentShow) return;
    const saved = findShow(library, currentShow.id);
    const wasIn = saved?.[list] === true;
    const losesFavorite =
        list === 'watched' && wasIn && saved?.favorite === true;

    let message = `${wasIn ? 'Прибрано з' : 'Додано до'} «${LIST_NAMES[list]}».`;
    if (losesFavorite) message += ' Серіал також прибрано з улюбленого.';

    applyLibrary(toggleList(library, currentShow, list), message);
}

function renderShow(show: Show): void {
    currentShow = show;
    document.title = `${show.name} — Серіали`;
    titleElement.textContent = show.name;

    if (show.image) {
        poster.src = show.image.original;
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

    renderLibraryControls(show);
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
        showError(castStatus, errorMessage(error), () => void loadCast(id));
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
            errorMessage(error),
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
            errorMessage(error),
            retryable ? () => void load() : undefined,
        );
        return;
    }

    void loadCast(id);
    void loadEpisodes(id);
}

wantButton.addEventListener('click', () => changeList('want'));
watchedButton.addEventListener('click', () => changeList('watched'));

favoriteButton.addEventListener('click', () => {
    if (!currentShow) return;
    const wasFavorite = findShow(library, currentShow.id)?.favorite === true;
    applyLibrary(
        toggleFavorite(library, currentShow.id),
        wasFavorite ? 'Прибрано з улюбленого.' : 'Додано до улюбленого.',
    );
});

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
