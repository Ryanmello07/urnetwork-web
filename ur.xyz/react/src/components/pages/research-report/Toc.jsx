import React from 'react';
import { TOC, tocPlace } from './model';
import { useActiveEntry } from './active';

/**
 * The sections of the research report as a nested list of links, the one
 * being read marked (aria-current). Plain anchors, so it works before and
 * without hydration; the page scrolls smoothly unless the visitor asked for
 * reduced motion (App.css).
 */
export function TocList({ section, onPick }) {
    const { group } = tocPlace(section);
    return (
        <ol className="rr-toc-list">
            {TOC.map((g) => (
                <li key={g.id} className={g.id === group.id ? 'is-current' : undefined}>
                    <a href={`#${g.id}`} aria-current={section === g.id ? 'location' : undefined} onClick={onPick}>{g.label}</a>
                    {g.items.length > 0 && (
                        <ol>
                            {g.items.map((it) => (
                                <li key={it.id}>
                                    <a href={`#${it.id}`} aria-current={section === it.id ? 'location' : undefined} onClick={onPick}>{it.label}</a>
                                </li>
                            ))}
                        </ol>
                    )}
                </li>
            ))}
        </ol>
    );
}

/** The sidebar of sections, sticky in the left margin on wide screens. */
export default function ReportToc() {
    const { section } = useActiveEntry();
    return (
        <nav className="rr-toc-inner" aria-label="On this page">
            <p className="rr-toc-title">On this page</p>
            <TocList section={section} />
        </nav>
    );
}
