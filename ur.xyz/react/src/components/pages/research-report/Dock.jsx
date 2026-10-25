import React, { useEffect, useRef, useState } from 'react';
import data from '../../../data/research-report-2026-q3.json';
import { computeStates, fmt, tocPlace } from './model';
import { onPulse, useActiveEntry } from './active';
import { Progress } from './Meters';
import { TocList } from './Toc';

const ENTRIES = data.entries;
const STATES = computeStates(ENTRIES);

/**
 * The bar under the nav on tablets and phones (under 1320px, where the
 * sidebars do not fit beside the column). It docks once the page's title has
 * scrolled away and stays: in the timeline it carries the meters, anywhere
 * else the section being read. Its menu button opens every section of the
 * page, the sidebar's list. The bar snaps in and out (one 420ms ease-in-out,
 * never scrubbed by the scroll) and overlays the page, so nothing in the
 * column moves. The meters repeat the block above the timeline, so they are
 * hidden from assistive technology; the menu is not.
 */
export default function ReportDock() {
    const { index, docked, section, inTimeline } = useActiveEntry();
    const [open, setOpen] = useState(false);
    const [flash, setFlash] = useState(null);
    const root = useRef(null);
    const button = useRef(null);
    const st = STATES[index + 1];
    const L = st.load.latest, c = st.bulk.controlled;
    const cells = {
        load: L ? <>{fmt(L.v, 1)}<small> ms</small></> : '—',
        bulk: c ? <>{c.to}<small> Mbps</small></> : '—',
        path: st.path.length || '—',
        memory: st.memory.length || '—',
        fixed: st.fixed.length || '—',
    };
    const { group, item } = tocPlace(section);

    // the menu closes when the bar leaves, on Escape (focus back on its button) and on a click outside
    useEffect(() => { if (!docked) setOpen(false); }, [docked]);
    useEffect(() => {
        if (!open) return undefined;
        const key = (e) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
        const away = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
        document.addEventListener('keydown', key);
        document.addEventListener('pointerdown', away);
        return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', away); };
    }, [open]);
    // an entry's chip flashes its meter here too
    useEffect(() => onPulse((key) => {
        setFlash(key);
        setTimeout(() => setFlash((k) => (k === key ? null : k)), 1400);
    }), []);

    return (
        <div ref={root} className={`rr-dock${docked ? ' is-docked' : ''}${inTimeline ? ' is-timeline' : ''}${open ? ' is-open' : ''}`}>
            <div className="rr-dock-inner">
                <button ref={button} type="button" className="rr-dock-menu" aria-expanded={open} aria-controls="rr-dock-sections" onClick={() => setOpen((o) => !o)}>
                    <svg viewBox="0 0 16 12" width="16" height="12" aria-hidden="true">
                        <path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className="rr-dock-where">{item ? `${group.label} · ${item.label}` : group.label}</span>
                    <span className="sr-only"> — sections of this page</span>
                </button>
                <div className="rr-dock-cells" aria-hidden="true">
                    <div className="rr-dock-cell is-date"><span>As of</span><b>{index >= 0 ? ENTRIES[index].date : 'Start'}</b></div>
                    {data.meters.map((m) => (
                        <div key={m.key} className={`rr-dock-cell${flash === m.key ? ' is-flash' : ''}`} data-meter={m.key}><span>{m.short}</span><b>{cells[m.key]}</b></div>
                    ))}
                </div>
            </div>
            <div className="rr-dock-progress" aria-hidden="true"><Progress index={index} /></div>
            <nav id="rr-dock-sections" className="rr-dock-panel" aria-label="Sections of this page" hidden={!open}>
                <TocList section={section} onPick={() => setOpen(false)} />
            </nav>
        </div>
    );
}
