import { createShowCard } from '../components/showCard';
import { initThemeToggle } from '../components/themeToggle';
import { LIBRARY_PAGE_SIZE } from '../config';
import type { SavedShow } from '../types/library';
import { getElement } from '../utils/dom';
import { listBy, listFavorites, loadLibrary } from '../utils/library';

initThemeToggle();

function setupSection(id: string, items: SavedShow[], emptyText: string): void {
    const list = getElement<HTMLUListElement>(`${id}-list`);
    const empty = getElement<HTMLElement>(`${id}-empty`);
    const more = getElement<HTMLButtonElement>(`${id}-more`);
    let visibleCount = LIBRARY_PAGE_SIZE;

    function render(): void {
        list.replaceChildren(
            ...items.slice(0, visibleCount).map((item) => createShowCard(item)),
        );
        empty.textContent = items.length === 0 ? emptyText : '';
        empty.hidden = items.length > 0;
        more.hidden = visibleCount >= items.length;
    }

    more.addEventListener('click', () => {
        const previousCount = visibleCount;
        visibleCount += LIBRARY_PAGE_SIZE;
        render();
        list.querySelectorAll('a')[previousCount]?.focus();
    });

    render();
}

const library = loadLibrary();

setupSection(
    'favorites',
    listFavorites(library),
    'Улюблених поки немає. Додайте до улюбленого серіал, який ви вже переглянули.',
);
setupSection(
    'want',
    listBy(library, 'want'),
    'Поки порожньо. Знайдіть серіал на головній і додайте його сюди.',
);
setupSection(
    'watched',
    listBy(library, 'watched'),
    'Поки порожньо. Позначте серіали, які ви вже подивились.',
);
