import type { ShowCardData } from '../types/tvmaze';
import { createIcon } from './icons';

export function createShowCard(show: ShowCardData): HTMLLIElement {
    const item = document.createElement('li');
    item.className = 'show-card';

    const link = document.createElement('a');
    link.href = `/show.html?id=${show.id}`;

    if (show.image) {
        const poster = document.createElement('img');
        poster.src = show.image.medium;
        poster.alt = '';
        poster.width = 210;
        poster.height = 295;
        poster.loading = 'lazy';
        link.append(poster);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'poster-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        link.append(placeholder);
    }

    const title = document.createElement('h3');
    title.textContent = show.name;
    link.append(title);

    const stats = document.createElement('p');
    stats.className = 'show-card__stats';

    const rating = document.createElement('span');
    rating.className = 'show-card__rating';
    if (show.rating.average !== null) {
        const label = document.createElement('span');
        label.className = 'visually-hidden';
        label.textContent = 'Рейтинг: ';
        rating.append(
            createIcon('star'),
            label,
            show.rating.average.toFixed(1),
        );
    } else {
        rating.textContent = 'Без рейтингу';
    }
    stats.append(rating);

    const year = show.premiered?.slice(0, 4);
    if (year) {
        const yearElement = document.createElement('span');
        yearElement.textContent = year;
        stats.append(yearElement);
    }

    const meta = document.createElement('div');
    meta.className = 'show-card__meta';
    meta.append(stats);

    const genres = show.genres.slice(0, 2).join(', ');
    if (genres) {
        const genresElement = document.createElement('p');
        genresElement.className = 'show-card__genres';
        genresElement.textContent = genres;
        meta.append(genresElement);
    }

    item.append(link, meta);
    return item;
}
