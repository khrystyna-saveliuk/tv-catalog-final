import { describe, expect, it } from 'vitest';
import { groupBySeason } from '../src/utils/episodes';
import type { Episode } from '../src/types/tvmaze';

function makeEpisode(season: number, number: number): Episode {
    return {
        id: season * 100 + number,
        name: `S${season}E${number}`,
        season,
        number,
        airdate: null,
        runtime: null,
        summary: null,
    };
}

describe('groupBySeason', () => {
    it('повертає порожню Map для порожнього списку', () => {
        expect(groupBySeason([]).size).toBe(0);
    });

    it('групує епізоди за номером сезону', () => {
        const groups = groupBySeason([
            makeEpisode(1, 1),
            makeEpisode(2, 1),
            makeEpisode(1, 2),
        ]);
        expect(groups.get(1)?.map((e) => e.number)).toEqual([1, 2]);
        expect(groups.get(2)?.map((e) => e.number)).toEqual([1]);
    });

    it('впорядковує сезони за зростанням', () => {
        const groups = groupBySeason([makeEpisode(3, 1), makeEpisode(1, 1)]);
        expect([...groups.keys()]).toEqual([1, 3]);
    });
});