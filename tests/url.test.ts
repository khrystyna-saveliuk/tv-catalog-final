import { describe, expect, it } from 'vitest';
import { parseShowId } from '../src/utils/url';

describe('parseShowId', () => {
    it('повертає число для коректного id', () => {
        expect(parseShowId('?id=82')).toBe(82);
    });

    it('ігнорує інші параметри', () => {
        expect(parseShowId('?foo=1&id=82')).toBe(82);
    });

    it('повертає null, якщо id немає', () => {
        expect(parseShowId('')).toBeNull();
        expect(parseShowId('?q=office')).toBeNull();
    });

    it('повертає null для нечислових значень', () => {
        expect(parseShowId('?id=abc')).toBeNull();
        expect(parseShowId('?id=12.5')).toBeNull();
        expect(parseShowId('?id=')).toBeNull();
    });

    it('повертає null для від’ємних чисел і нуля', () => {
        expect(parseShowId('?id=-5')).toBeNull();
        expect(parseShowId('?id=0')).toBeNull();
    });
});