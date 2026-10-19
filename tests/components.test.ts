// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createShowCard } from '../src/components/showCard';
import { showError, showLoading } from '../src/components/status';
import type { ShowCardData } from '../src/types/tvmaze';

function makeCard(overrides: Partial<ShowCardData> = {}): ShowCardData {
    return {
        id: 82,
        name: 'Game of Thrones',
        genres: ['Drama', 'Adventure', 'Fantasy'],
        premiered: '2011-04-17',
        rating: { average: 9 },
        image: { medium: 'https://example.com/m.jpg', original: '' },
        ...overrides,
    };
}

describe('createShowCard', () => {
    it('веде на сторінку серіалу за його id', () => {
        const card = createShowCard(makeCard());
        expect(card.querySelector('a')?.getAttribute('href')).toBe(
            '/show.html?id=82',
        );
    });

    it('показує назву, рік і не більше двох жанрів', () => {
        const card = createShowCard(makeCard());
        expect(card.querySelector('h3')?.textContent).toBe('Game of Thrones');
        expect(card.textContent).toContain('2011');
        expect(card.textContent).toContain('Drama, Adventure');
        expect(card.textContent).not.toContain('Fantasy');
    });

    it('форматує рейтинг з одним знаком після коми', () => {
        const card = createShowCard(makeCard({ rating: { average: 9 } }));
        expect(card.querySelector('.show-card__rating')?.textContent).toContain(
            '9.0',
        );
    });

    it('пише «Без рейтингу», якщо рейтингу немає', () => {
        const card = createShowCard(makeCard({ rating: { average: null } }));
        expect(card.textContent).toContain('Без рейтингу');
    });

    it('показує постер із порожнім alt, коли зображення є', () => {
        const card = createShowCard(makeCard());
        const img = card.querySelector('img');
        expect(img?.getAttribute('alt')).toBe('');
        expect(card.querySelector('.poster-placeholder')).toBeNull();
    });

    it('постер за замовчуванням завантажується ліниво', () => {
        const card = createShowCard(makeCard());
        expect(card.querySelector('img')?.loading).toBe('lazy');
    });

    it('постер завантажується одразу, якщо передано eager', () => {
        const card = createShowCard(makeCard(), true);
        expect(card.querySelector('img')?.loading).toBe('eager');
    });

    it('показує заглушку, коли постера немає', () => {
        const card = createShowCard(makeCard({ image: null }));
        expect(card.querySelector('img')).toBeNull();
        expect(card.querySelector('.poster-placeholder')).not.toBeNull();
    });

    it('не вставляє дані API як розмітку (захист від XSS)', () => {
        const card = createShowCard(
            makeCard({ name: '<img src=x onerror=1>' }),
        );
        expect(card.querySelector('h3 img')).toBeNull();
        expect(card.querySelector('h3')?.textContent).toBe(
            '<img src=x onerror=1>',
        );
    });
});

describe('стани loading та error', () => {
    it('showLoading показує текст і спінер, прихований від скрінрідера', () => {
        const container = document.createElement('div');
        showLoading(container);
        expect(container.textContent).toContain('Завантаження');
        expect(
            container.querySelector('.spinner')?.getAttribute('aria-hidden'),
        ).toBe('true');
    });

    it('showError показує повідомлення без кнопки, якщо повтор не передано', () => {
        const container = document.createElement('div');
        showError(container, 'Щось пішло не так');
        expect(container.textContent).toContain('Щось пішло не так');
        expect(container.querySelector('button')).toBeNull();
    });

    it('showError додає кнопку, яка викликає повтор', () => {
        const container = document.createElement('div');
        const retry = vi.fn();
        showError(container, 'Помилка', retry);

        container.querySelector('button')?.click();

        expect(retry).toHaveBeenCalledTimes(1);
    });
});
