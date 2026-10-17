export function parseShowId(search: string): number | null {
    const raw = new URLSearchParams(search).get('id');
    if (raw === null || !/^\d+$/.test(raw)) return null;
    const id = Number(raw);
    return id > 0 ? id : null;
}
