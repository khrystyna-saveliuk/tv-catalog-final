import type { Show } from '../types/tvmaze';

export function createShowCard(show: Show): HTMLLIElement {
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
    }

    const title = document.createElement('h3');
    title.textContent = show.name;
    link.append(title);

    const meta = document.createElement('p');
    meta.className = 'show-card__meta';

    const rating = document.createElement('span');
    rating.className = 'show-card__rating';
    if (show.rating.average !== null) {
        const label = document.createElement('span');
        label.className = 'visually-hidden';
        label.textContent = 'Рейтинг: ';
        rating.append(label, String(show.rating.average));
    } else {
        rating.textContent = 'Без рейтингу';
    }
    meta.append(rating);

    const genres = show.genres.slice(0, 2).join(', ');
    if (genres) {
        const genresElement = document.createElement('span');
        genresElement.textContent = genres;
        meta.append(genresElement);
    }

    item.append(link, meta);
    return item;
}