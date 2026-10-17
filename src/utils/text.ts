export function htmlToParagraphs(html: string | null): string[] {
    if (!html) return [];

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const paragraphs = Array.from(doc.querySelectorAll('p'), (p) =>
        (p.textContent ?? '').trim(),
    ).filter(Boolean);

    if (paragraphs.length > 0) return paragraphs;

    const text = (doc.body.textContent ?? '').trim();
    return text ? [text] : [];
}
