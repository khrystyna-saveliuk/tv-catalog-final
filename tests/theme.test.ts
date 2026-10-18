import { describe, expect, it } from 'vitest';
import {
    isTheme,
    loadStoredTheme,
    resolveTheme,
    saveTheme,
    toggleTheme,
} from '../src/utils/theme';

function fakeStorage(initial: string | null = null) {
    let value = initial;
    return {
        getItem: () => value,
        setItem: (_key: string, next: string) => {
            value = next;
        },
    };
}

describe('isTheme', () => {
    it('приймає light і dark', () => {
        expect(isTheme('light')).toBe(true);
        expect(isTheme('dark')).toBe(true);
    });

    it('відхиляє інші значення', () => {
        expect(isTheme('blue')).toBe(false);
        expect(isTheme('')).toBe(false);
        expect(isTheme(null)).toBe(false);
    });
});

describe('resolveTheme', () => {
    it('віддає перевагу збереженому вибору', () => {
        expect(resolveTheme('light', true)).toBe('light');
        expect(resolveTheme('dark', false)).toBe('dark');
    });

    it('без збереженого вибору бере системну тему', () => {
        expect(resolveTheme(null, true)).toBe('dark');
        expect(resolveTheme(null, false)).toBe('light');
    });

    it('ігнорує некоректне збережене значення', () => {
        expect(resolveTheme('blue', true)).toBe('dark');
        expect(resolveTheme('blue', false)).toBe('light');
    });
});

describe('toggleTheme', () => {
    it('перемикає між темами', () => {
        expect(toggleTheme('light')).toBe('dark');
        expect(toggleTheme('dark')).toBe('light');
    });
});

describe('loadStoredTheme і saveTheme', () => {
    it('зберігає й читає тему', () => {
        const storage = fakeStorage();
        expect(saveTheme('dark', storage)).toBe(true);
        expect(loadStoredTheme(storage)).toBe('dark');
    });

    it('повертає null для порожнього сховища', () => {
        expect(loadStoredTheme(fakeStorage())).toBeNull();
    });

    it('не падає, якщо сховище недоступне', () => {
        expect(loadStoredTheme(null)).toBeNull();
        expect(saveTheme('dark', null)).toBe(false);
    });

    it('повертає false, якщо запис викликає помилку', () => {
        const broken = {
            getItem: () => null,
            setItem: () => {
                throw new Error('quota exceeded');
            },
        };
        expect(saveTheme('dark', broken)).toBe(false);
    });
});
