// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { htmlToParagraphs } from '../src/utils/text';

describe('htmlToParagraphs', () => {
    it('повертає порожній масив для null і порожнього рядка', () => {
        expect(htmlToParagraphs(null)).toEqual([]);
        expect(htmlToParagraphs('')).toEqual([]);
    });

    it('прибирає теги форматування всередині абзацу', () => {
        expect(htmlToParagraphs('<p>Hello <b>big</b> world</p>')).toEqual([
            'Hello big world',
        ]);
    });

    it('зберігає окремі абзаци', () => {
        expect(htmlToParagraphs('<p>First</p><p>Second</p>')).toEqual([
            'First',
            'Second',
        ]);
    });

    it('обробляє текст без абзаців', () => {
        expect(htmlToParagraphs('Just text')).toEqual(['Just text']);
    });

    it('пропускає порожні абзаци', () => {
        expect(htmlToParagraphs('<p> </p><p>Text</p>')).toEqual(['Text']);
    });
});
