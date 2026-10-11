export interface CheckboxOption {
    value: string;
    label: string;
}

export function renderCheckboxGroup(
    container: HTMLElement,
    name: string,
    options: CheckboxOption[],
): void {
    const items = options.map((option) => {
        const label = document.createElement('label');
        label.className = 'checkbox';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = name;
        input.value = option.value;

        const text = document.createElement('span');
        text.textContent = option.label;

        label.append(input, text);
        return label;
    });

    container.replaceChildren(...items);
}

export function getCheckedValues(container: HTMLElement): string[] {
    return Array.from(
        container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'),
        (input) => input.value,
    );
}

export function clearCheckedValues(container: HTMLElement): void {
    container
        .querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
        .forEach((input) => {
            input.checked = false;
        });
}