export function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Елемент #${id} не знайдено на сторінці`);
    }
    return element as T;
}
