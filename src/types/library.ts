import type { ShowCardData } from './tvmaze';

export type ListKey = 'want' | 'watched';

export interface SavedShow extends ShowCardData {
    want: boolean;
    watched: boolean;
    favorite: boolean;
    addedAt: number;
}
