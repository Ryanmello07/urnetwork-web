import { useEffect } from 'react';
import data from '../../../data/research-report-2026-q3.json';
import { termId } from './model';
import { hide, isShownFor, show } from './tooltip';

const DEFINITIONS = new Map(data.glossary.map(([term, def]) => [termId(term), { term, def }]));

/**
 * The glossary terms in the report's text are links to their definitions at
 * the foot of the page, which work without script. This adds the definition
 * beside the term on hover and keyboard focus, and on a touch screen a first
 * tap shows it (with a link to the glossary) instead of jumping away.
 * It renders nothing itself.
 */
export default function TermTips() {
    useEffect(() => {
        const content = (a) => {
            const d = DEFINITIONS.get(a.dataset.term);
            return d ? [[d.term, d.def], { href: `#${a.dataset.term}`, label: 'In the glossary' }] : null;
        };
        const over = (e) => {
            const a = e.target.closest?.('a.rr-term');
            if (!a || e.pointerType === 'touch') return;
            const c = content(a);
            if (c) show(a, ...c);
        };
        const out = (e) => {
            const a = e.target.closest?.('a.rr-term');
            if (a && e.pointerType !== 'touch') hide(a);
        };
        const focus = (e) => {
            const a = e.target.closest?.('a.rr-term');
            const c = a && content(a);
            if (c) show(a, ...c);
        };
        const blur = (e) => { const a = e.target.closest?.('a.rr-term'); if (a) hide(a); };
        const click = (e) => {
            const a = e.target.closest?.('a.rr-term');
            if (!a || !window.matchMedia('(pointer: coarse)').matches || isShownFor(a)) return;
            const c = content(a);
            if (!c) return;
            e.preventDefault();
            show(a, ...c);
        };
        document.addEventListener('pointerover', over);
        document.addEventListener('pointerout', out);
        document.addEventListener('focusin', focus);
        document.addEventListener('focusout', blur);
        document.addEventListener('click', click);
        return () => {
            document.removeEventListener('pointerover', over);
            document.removeEventListener('pointerout', out);
            document.removeEventListener('focusin', focus);
            document.removeEventListener('focusout', blur);
            document.removeEventListener('click', click);
        };
    }, []);
    return null;
}
