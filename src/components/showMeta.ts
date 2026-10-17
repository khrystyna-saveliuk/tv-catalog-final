import type { Show } from '../types/tvmaze';

const STATUS_LABELS: Record<string, string> = {
    Running: 'Виходить',
    Ended: 'Завершено',
    'To Be Determined': 'Ще не визначено',
    'In Development': 'У розробці',
};

function createItem(term: string, value: string): HTMLDivElement {
    const item = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    item.append(dt, dd);
    return item;
}

export function createMetaItems(show: Show): HTMLDivElement[] {
    const items: HTMLDivElement[] = [];

    items.push(
        createItem(
            'Рейтинг',
            show.rating.average !== null
                ? String(show.rating.average)
                : 'Без рейтингу',
        ),
    );
    items.push(createItem('Статус', STATUS_LABELS[show.status] ?? show.status));

    if (show.premiered) {
        items.push(createItem('Прем’єра', show.premiered.slice(0, 4)));
    }
    if (show.genres.length > 0) {
        items.push(createItem('Жанри', show.genres.join(', ')));
    }
    if (show.language) {
        items.push(createItem('Мова', show.language));
    }

    return items;
}
