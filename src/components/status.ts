import { createIcon } from './icons';

export function showLoading(
    container: HTMLElement,
    message = 'Завантаження…',
): void {
    const line = document.createElement('p');
    line.className = 'status-loading';

    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');

    line.append(spinner, message);
    container.replaceChildren(line);
}

export function showError(
    container: HTMLElement,
    message: string,
    onRetry?: () => void,
): void {
    const box = document.createElement('div');
    box.className = 'status-error';

    const body = document.createElement('div');
    const text = document.createElement('p');
    text.textContent = message;
    body.append(text);

    if (onRetry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Спробувати ще раз';
        button.addEventListener('click', onRetry);
        body.append(button);
    }

    box.append(createIcon('alert'), body);
    container.replaceChildren(box);
}

export function showMessage(container: HTMLElement, message: string): void {
    container.replaceChildren(message);
}

export function clearStatus(container: HTMLElement): void {
    container.replaceChildren();
}
