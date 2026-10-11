import type { CastMember } from '../types/tvmaze';

export function createCastItem(member: CastMember): HTMLLIElement {
    const item = document.createElement('li');
    item.className = 'cast-item';

    if (member.person.image) {
        const photo = document.createElement('img');
        photo.src = member.person.image.medium;
        photo.alt = '';
        photo.width = 210;
        photo.height = 295;
        photo.loading = 'lazy';
        item.append(photo);
    }

    const name = document.createElement('p');
    name.className = 'cast-item__name';
    name.textContent = member.person.name;

    const character = document.createElement('p');
    character.className = 'cast-item__character';
    character.textContent = member.character.name;

    item.append(name, character);
    return item;
}