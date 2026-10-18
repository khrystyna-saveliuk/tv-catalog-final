import type { ListKey, SavedShow } from '../types/library';
import type { ShowCardData } from '../types/tvmaze';
import { getElement } from '../utils/dom';
import {
    findShow,
    loadLibrary,
    saveLibrary,
    toggleFavorite,
    toggleList,
} from '../utils/library';
import { createIcon, type IconName } from './icons';

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

export function initLibraryActions(): (show: ShowCardData) => void {
    const wantButton = getElement<HTMLButtonElement>('want-toggle');
    const watchedButton = getElement<HTMLButtonElement>('watched-toggle');
    const favoriteButton = getElement<HTMLButtonElement>('favorite-toggle');
    const favoriteHint = getElement<HTMLElement>('favorite-hint');
    const message = getElement<HTMLElement>('library-message');

    let library: SavedShow[] = loadLibrary();
    let current: ShowCardData | null = null;

    function render(): void {
        if (!current) return;
        const saved = findShow(library, current.id);
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

    function apply(next: SavedShow[], text: string): void {
        library = next;
        message.textContent = saveLibrary(library)
            ? text
            : 'Не вдалося зберегти зміни: сховище браузера недоступне. Вони діють лише поки відкрита ця сторінка.';
        render();
    }

    function changeList(list: ListKey): void {
        if (!current) return;
        const saved = findShow(library, current.id);
        const wasIn = saved?.[list] === true;
        const losesFavorite =
            list === 'watched' && wasIn && saved?.favorite === true;

        let text = `${wasIn ? 'Прибрано з' : 'Додано до'} «${LIST_NAMES[list]}».`;
        if (losesFavorite) text += ' Серіал також прибрано з улюбленого.';

        apply(toggleList(library, current, list), text);
    }

    wantButton.addEventListener('click', () => changeList('want'));
    watchedButton.addEventListener('click', () => changeList('watched'));

    favoriteButton.addEventListener('click', () => {
        if (!current) return;
        const wasFavorite = findShow(library, current.id)?.favorite === true;
        apply(
            toggleFavorite(library, current.id),
            wasFavorite ? 'Прибрано з улюбленого.' : 'Додано до улюбленого.',
        );
    });

    return (show) => {
        current = show;
        render();
    };
}
