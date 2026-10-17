import type { Episode } from '../types/tvmaze';

function formatDate(airdate: string): string {
    return new Date(`${airdate}T00:00:00Z`).toLocaleDateString('uk-UA', {
        dateStyle: 'long',
        timeZone: 'UTC',
    });
}

export function createEpisodeItem(episode: Episode): HTMLLIElement {
    const item = document.createElement('li');
    item.className = 'episode';

    const title = document.createElement('p');
    title.className = 'episode__title';
    title.textContent =
        episode.number !== null
            ? `${episode.number}. ${episode.name}`
            : episode.name;
    item.append(title);

    const meta = document.createElement('p');
    meta.className = 'episode__meta';

    if (episode.airdate) {
        const time = document.createElement('time');
        time.dateTime = episode.airdate;
        time.textContent = formatDate(episode.airdate);
        meta.append(time);
    }
    if (episode.runtime) {
        const runtime = document.createElement('span');
        runtime.textContent = `${episode.runtime} хв`;
        meta.append(runtime);
    }
    if (meta.childElementCount > 0) item.append(meta);

    return item;
}
