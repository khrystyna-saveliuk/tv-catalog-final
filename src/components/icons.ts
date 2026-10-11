const SVG_NS = 'http://www.w3.org/2000/svg';

const PATHS = {
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
} as const;

export type IconName = keyof typeof PATHS;

export function createIcon(name: IconName): SVGSVGElement {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('icon');

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', PATHS[name]);
    svg.append(path);

    return svg;
}
