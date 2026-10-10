import '../styles/base.css';
import { ApiError, getFeaturedShows } from '../api/tvmaze';
import { clearStatus, showError, showLoading } from '../components/status';
import { createShowCard } from '../components/showCard';
import { getElement } from '../utils/dom';

const statusElement = getElement<HTMLElement>('status');
const listElement = getElement<HTMLUListElement>('results-list');

async function loadFeatured(): Promise<void> {
    listElement.replaceChildren();
    showLoading(statusElement);

    try {
        const shows = await getFeaturedShows();
        listElement.replaceChildren(...shows.map(createShowCard));
        clearStatus(statusElement);
    } catch (error) {
        const message =
            error instanceof ApiError ? error.message : 'Сталася невідома помилка.';
        showError(statusElement, message, loadFeatured);
    }
}

void loadFeatured();