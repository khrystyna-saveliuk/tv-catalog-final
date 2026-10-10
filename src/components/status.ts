export function showLoading(container: HTMLElement, message = 'Завантаження…'): void {
    container.replaceChildren(message);
}

export function showError(
    container: HTMLElement,
    message: string,
    onRetry?: () => void,
): void {
    const text = document.createElement('p');
    text.textContent = message;
    container.replaceChildren(text);

    if (onRetry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Спробувати ще раз';
        button.addEventListener('click', onRetry);
        container.append(button);
    }
}

export function clearStatus(container: HTMLElement): void {
    container.replaceChildren();
}