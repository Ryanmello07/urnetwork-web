/**
 * One tooltip for the whole research report page: chart marks and glossary
 * terms show it on hover and keyboard focus (a tap shows a term's definition
 * on touch screens). It enhances and never gates: every value it shows is also
 * in the entry text or the glossary. Content is set with textContent.
 */
let tip = null;
let owner = null;

function element() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'rr-tip';
    tip.setAttribute('role', 'tooltip');
    tip.id = 'rr-tip';
    document.body.appendChild(tip);
    window.addEventListener('scroll', () => hide(), { passive: true });
    document.addEventListener('pointerdown', (e) => {
        if (owner && !tip.contains(e.target) && !owner.contains(e.target)) hide();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
    return tip;
}

/**
 * Show `lines` (the first one emphasized) beside `target`; `link` adds a
 * link line ({ href, label }).
 */
export function show(target, lines, link) {
    const el = element();
    el.replaceChildren();
    lines.forEach((line, i) => {
        const span = document.createElement('span');
        span.className = i === 0 ? 'rr-tip-head' : 'rr-tip-line';
        span.textContent = line;
        el.appendChild(span);
    });
    if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        a.className = 'rr-tip-line';
        el.appendChild(a);
    }
    el.classList.add('is-on');
    owner = target;
    target.setAttribute('aria-describedby', 'rr-tip');
    const r = target.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;
    const x = Math.max(window.scrollX + 12, Math.min(r.left + r.width / 2 - w / 2 + window.scrollX, window.scrollX + window.innerWidth - w - 12));
    const above = r.top - h - 10 > 72;
    el.style.left = `${x}px`;
    el.style.top = `${(above ? r.top - h - 10 : r.bottom + 10) + window.scrollY}px`;
}

export function hide(target) {
    if (!tip || (target && owner !== target)) return;
    tip.classList.remove('is-on');
    if (owner) owner.removeAttribute('aria-describedby');
    owner = null;
}

export const isShownFor = (target) => owner === target;

/** Hover and focus handlers for a mark: spread them onto its element. */
export function tipHandlers(lines) {
    return {
        onPointerEnter: (e) => { if (e.pointerType !== 'touch') show(e.currentTarget, lines()); },
        onPointerLeave: (e) => { if (e.pointerType !== 'touch') hide(e.currentTarget); },
        onFocus: (e) => show(e.currentTarget, lines()),
        onBlur: (e) => hide(e.currentTarget),
    };
}
