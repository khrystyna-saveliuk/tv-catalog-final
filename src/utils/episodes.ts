import type { Episode } from '../types/tvmaze';

export function groupBySeason(episodes: Episode[]): Map<number, Episode[]> {
    const groups = new Map<number, Episode[]>();

    for (const episode of episodes) {
        const list = groups.get(episode.season);
        if (list) {
            list.push(episode);
        } else {
            groups.set(episode.season, [episode]);
        }
    }

    return new Map([...groups].sort((a, b) => a[0] - b[0]));
}
