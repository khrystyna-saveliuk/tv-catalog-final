export interface ShowImage {
    medium: string;
    original: string;
}

export interface Show {
    id: number;
    name: string;
    genres: string[];
    status: string;
    premiered: string | null;
    language: string | null;
    rating: { average: number | null };
    image: ShowImage | null;
    summary: string | null; // приходить як HTML-рядок
}

export interface SearchResult {
    score: number;
    show: Show;
}

export interface Person {
    id: number;
    name: string;
    image: ShowImage | null;
}

export interface CastMember {
    person: Person;
    character: { id: number; name: string };
}

export interface Episode {
    id: number;
    name: string;
    season: number;
    number: number | null;
    airdate: string | null;
    runtime: number | null;
    summary: string | null;
}