import { createShowCard } from '../components/showCard';
import { initThemeToggle } from '../components/themeToggle';
import { LIBRARY_EAGER_IMAGES, LIBRARY_PAGE_SIZE } from '../config';
import type { SavedShow } from '../types/library';
import { getElement } from '../utils/dom';
import { listBy, listFavorites, loadLibrary } from '../utils/library';

initThemeToggle();

function setupSection(
    id: string,
    items: SavedShow[],
    emptyText: string,
    eagerCount: number,
): void {
    const list = getElement<HTMLUListElement>(`${id}-list`);
    const empty = getElement<HTMLElement>(`${id}-empty`);
    const more = getElement<HTMLButtonElement>(`${id}-more`);
    let visibleCount = LIBRARY_PAGE_SIZE;

    function render(): void {
        list.replaceChildren(
            ...items
                .slice(0, visibleCount)
                .map((item, index) => createShowCard(item, index < eagerCount)),
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

const sections = [
    {
        id: 'favorites',
        items: listFavorites(library),
        emptyText:
            'Улюблених поки немає. Додайте до улюбленого серіал, який ви вже переглянули.',
    },
    {
        id: 'want',
        items: listBy(library, 'want'),
        emptyText:
            'Поки порожньо. Знайдіть серіал на головній і додайте його сюди.',
    },
    {
        id: 'watched',
        items: listBy(library, 'watched'),
        emptyText: 'Поки порожньо. Позначте серіали, які ви вже подивились.',
    },
];

const firstFilled = sections.findIndex((section) => section.items.length > 0);

sections.forEach((section, index) => {
    setupSection(
        section.id,
        section.items,
        section.emptyText,
        index === firstFilled ? LIBRARY_EAGER_IMAGES : 0,
    );
});

getElement<HTMLElement>('main').dataset.ready = 'true';
