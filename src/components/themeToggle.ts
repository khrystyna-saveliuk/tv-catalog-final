import { getElement } from '../utils/dom';
import {
    isTheme,
    loadStoredTheme,
    resolveTheme,
    saveTheme,
    toggleTheme,
    type Theme,
} from '../utils/theme';

const LABELS: Record<Theme, string> = {
    light: 'Темна тема',
    dark: 'Світла тема',
};

function currentTheme(): Theme {
    const applied = document.documentElement.dataset.theme;
    if (isTheme(applied)) return applied;
    return resolveTheme(
        loadStoredTheme(),
        window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
}

function applyTheme(theme: Theme, button: HTMLButtonElement): void {
    document.documentElement.dataset.theme = theme;
    button.textContent = LABELS[theme];
}

export function initThemeToggle(): void {
    const button = getElement<HTMLButtonElement>('theme-toggle');
    let theme = currentTheme();
    applyTheme(theme, button);

    button.addEventListener('click', () => {
        theme = toggleTheme(theme);
        applyTheme(theme, button);
        saveTheme(theme);
    });
}
