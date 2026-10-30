import React from 'react';
import Section from '../Section';
import ResearchLoops from '../ResearchLoops';
import { METHODOLOGY as M } from '../../data/research-methodology';
import './ResearchMethodology.css';

export const METHODOLOGY_PATH = M.path;

/**
 * ResearchMethodologyPage — /research/methodology: how UR's research works.
 * Three nested loops (the lab, the open competition, the volunteer field
 * nodes) share one discipline, and each improves the network and the way the
 * next change is measured. Linked from the methodology's card on /research,
 * whose hero is the same rings (ResearchLoops.jsx).
 *
 * Renders only what goes inside <main class="section-page">: the SPA's
 * SectionPage (App.jsx) and astro/src/pages/research/methodology.astro both
 * wrap it in the shared Disclaimer / Nav / Footer shell. Static: the rings
 * turn in CSS, so the page needs no island. English-only, like the reports.
 * The content is data (data/research-methodology.js).
 */
export default function ResearchMethodologyPage() {
    return (
        <div className="rm-page">
            <Intro />
            <Discipline />
            <Outputs />
            <Agents />
            <Loops />
            <Publication />
        </div>
    );
}

/** The title beside the rings (Section's own header, with the drawing next to it), the lede, and the three loops as an index. */
function Intro() {
    return (
        <section id="methodology" className="section rm-intro" aria-labelledby="rm-title">
            <div className="section-inner">
                <div className="rm-head">
                    <header className="section-header">
                        <span className="section-eyebrow">{M.eyebrow}</span>
                        <h1 className="section-title" id="rm-title">{M.title}</h1>
                        <div className="section-rule" aria-hidden="true" />
                    </header>
                    <figure className="rm-hero">
                        <ResearchLoops label={M.figure} />
                    </figure>
                </div>
                <div className="section-body">
                    <p className="rm-lede">{M.lede}</p>
                    <p className="rm-meta"><time dateTime={M.published}>{M.publishedLabel}</time> · {M.metaNote}</p>
                    <ul className="rm-index" aria-label="The three loops">
                        {M.loops.map((l) => (
                            <li key={l.key} className={`rl-${l.key}`}>
                                <a href={`#${l.id}`}><b>{l.name}</b><span>{l.instrument} · {l.cadence}</span></a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

function Discipline() {
    const d = M.discipline;
    return (
        <Section id="discipline" eyebrow={d.eyebrow} title={d.title}>
            <ol className="rm-rules">
                {d.rules.map((r, i) => (
                    <li key={r.title}>
                        <span className="rm-rule-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                        <h3>{r.title}</h3>
                        <p>{r.body}</p>
                    </li>
                ))}
            </ol>
        </Section>
    );
}

/**
 * The five stages and their two rails: on wide screens one drawing, the
 * outcome rail solid from Record back to Baseline and the process rail dashed
 * from Record back to Measure; on phones the same as a list and a key.
 */
function Outputs() {
    const o = M.outputs;
    const x = (i) => 40 + i * 150;
    return (
        <Section id="outputs" eyebrow={o.eyebrow} title={o.title}>
            <p>{o.body}</p>
            <figure className="rm-stages">
                <svg className="rm-stages-wide" viewBox="0 0 800 240" role="img" aria-label={o.figure}>
                    <defs>
                        <marker id="rm-flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="rgba(214, 230, 244, 0.45)" />
                        </marker>
                        <marker id="rm-rail-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#F8F8F8" />
                        </marker>
                    </defs>
                    <text className="rm-rail-key" x="350" y="30">PROCESS</text>
                    <text className="rm-rail-label" x="420" y="30">{o.process}</text>
                    <path className="rm-rail is-process" d={`M${x(4)},111 V44 H${x(2)} V108`} markerEnd="url(#rm-rail-arrow)" />
                    {o.stages.slice(0, -1).map((s, i) => (
                        <line key={`flow-${s.name}`} className="rm-flow" x1={x(i) + 9} y1="120" x2={x(i + 1) - 10} y2="120" markerEnd="url(#rm-flow-arrow)" />
                    ))}
                    {o.stages.map((s, i) => (
                        <g key={s.name}>
                            <circle className="rm-node" cx={x(i)} cy="120" r="7" />
                            <text className="rm-stage-n" x={x(i) + 14} y="100">{i + 1}</text>
                            <text className="rm-stage-name" x={x(i) + 28} y="100">{s.name.toUpperCase()}</text>
                            {s.lines.map((line, j) => <text key={line} className="rm-stage-desc" x={x(i) + 14} y={146 + j * 17}>{line}</text>)}
                        </g>
                    ))}
                    <path className="rm-rail" d={`M${x(4)},129 V200 H${x(0)} V132`} markerEnd="url(#rm-rail-arrow)" />
                    <text className="rm-rail-key" x="200" y="226">OUTCOME</text>
                    <text className="rm-rail-label" x="270" y="226">{o.outcome}</text>
                </svg>
                <ol className="rm-stages-list" aria-hidden="true">
                    {o.stages.map((s) => <li key={s.name}><b>{s.name}</b><span>{s.lines.join(' ')}</span></li>)}
                </ol>
                <ul className="rm-rails-list" aria-hidden="true">
                    <li><i /><span><b>Outcome</b> · {o.outcome}</span></li>
                    <li className="is-process"><i /><span><b>Process</b> · {o.process}</span></li>
                </ul>
            </figure>
            <aside className="rm-example">
                <span className="rm-example-tag">{o.example.tag}</span>
                <p>{o.example.body}</p>
                <span className="rm-example-source">{o.example.source}</span>
            </aside>
        </Section>
    );
}

function Agents() {
    const a = M.agents;
    return (
        <Section id="agents" eyebrow={a.eyebrow} title={a.title}>
            <p>{a.body}</p>
            <dl className="rm-roles">
                {a.roles.map((r) => (
                    <div key={r.name}><dt>{r.name}</dt><dd>{r.body}</dd></div>
                ))}
            </dl>
        </Section>
    );
}

function Loops() {
    const s = M.sections;
    return (
        <Section id="loops" eyebrow={s.eyebrow} title={s.title}>
            {s.loops.map((l) => (
                <article key={l.key} id={l.key} className={`rm-loop rl-${l.key}`} aria-labelledby={`${l.key}-title`}>
                    <div className="rm-loop-head">
                        <ResearchLoops only={l.key} />
                        <span className="rm-loop-tag">{l.tag}</span>
                    </div>
                    <h3 id={`${l.key}-title`}>{l.title}</h3>
                    <p>{l.body}</p>
                    <div className="rm-facts" style={{ '--rm-n': l.facts.length }}>
                        {l.facts.map((f) => <div key={f.v}><b>{f.v}</b><span>{f.l}</span></div>)}
                    </div>
                    <ul className="rm-links">
                        {l.links.map((k) => (
                            <li key={k.label}>
                                {k.external
                                    ? <a href={k.href} target="_blank" rel="noopener noreferrer">{k.label} <span aria-hidden="true">↗</span></a>
                                    : <a href={k.href}>{k.label} <span aria-hidden="true">→</span></a>}
                            </li>
                        ))}
                    </ul>
                </article>
            ))}
        </Section>
    );
}

function Publication() {
    const p = M.publication;
    return (
        <Section id="publication" eyebrow={p.eyebrow} title={p.title}>
            <p>{p.body}</p>
            <p><a className="rm-cta" href={M.reportHref}>{p.cta} <span aria-hidden="true">→</span></a></p>
        </Section>
    );
}
