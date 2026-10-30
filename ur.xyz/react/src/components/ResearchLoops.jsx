import React from 'react';
import './ResearchLoops.css';

/**
 * ResearchLoops — UR's three research loops as nested rings, drawn as in the
 * research-loops abstract: the field outermost, the open competition around
 * the lab, the lab innermost. Each loop's arc and dot circle at its own pace
 * (lab 10 s, competition 30 s, field 90 s) in CSS alone, so the drawing needs
 * no script and the static page and the app render it the same. Under
 * prefers-reduced-motion it stands still, which is how the parity and wiring
 * audits capture it.
 *
 * Shared by the methodology's card on /research (ResearchExtras.jsx) and the
 * methodology page (pages/ResearchMethodology.jsx).
 *
 *   label  the drawing's accessible name; without one it is decorative
 *   only   'lab' | 'competition' | 'field': a small mark with that loop lit
 */
export const LOOPS = Object.freeze([
    { key: 'field', r: 108 },
    { key: 'competition', r: 74 },
    { key: 'lab', r: 40 },
]);

export default function ResearchLoops({ label = null, only = null, className = '' }) {
    const a11y = label && !only ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true', focusable: 'false' };
    const classes = ['research-loops', only ? 'is-mark' : '', className].filter(Boolean).join(' ');
    return (
        <svg className={classes} viewBox="0 0 240 240" {...a11y}>
            {LOOPS.map(({ key, r }) => <circle key={`ring-${key}`} className="rl-ring" cx="120" cy="120" r={r} />)}
            {LOOPS.filter(({ key }) => !only || only === key).map(({ key, r }) => (
                <g key={key} className={`rl-orbit rl-${key}`}>
                    <circle className="rl-trail" cx="120" cy="120" r={r} pathLength="360" strokeDasharray="64 296" />
                    <circle className="rl-dot" cx={120 + r} cy="120" r={only ? 11 : 5} />
                </g>
            ))}
            <circle className="rl-core" cx="120" cy="120" r={only ? 10 : 3.5} />
        </svg>
    );
}

/** The key beside the rings: each loop's dot, name and detail (its instrument and cadence). */
export function ResearchLoopsKey({ loops, hidden = false }) {
    return (
        <ul className="research-loops-key" aria-hidden={hidden ? 'true' : undefined}>
            {loops.map((l) => (
                <li key={l.key} className={`rl-${l.key}`}><b>{l.name}</b><span>{l.detail}</span></li>
            ))}
        </ul>
    );
}
