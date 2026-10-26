import React from 'react';
import Section from '../Section';
import data from '../../data/research-report-2026-q3.json';
import Glyph from './research-report/Glyph';
import ReportMeters from './research-report/Meters';
import ReportDock from './research-report/Dock';
import ReportGlance from './research-report/Glance';
import MethodFigure from './research-report/MethodFigure';
import TermTips from './research-report/TermTips';
import ReportToc from './research-report/Toc';
import { MONTHS, PLURAL, TOC, linkHtml, linkText, movedMeters, rangeEnd, termId, termMatchers } from './research-report/model';
import './ResearchReport.css';

/**
 * ResearchReportPage — /research/2026-q3-report, the August–October 2026
 * research report: why the research matters, its gigabit-class milestone, a
 * timeline of its entries with
 * meters that replay the evidence as the reader goes, how far each kind of gain
 * went, the seven methods (each with an animation), what changed in the
 * instruments, what is still open, and a glossary.
 *
 * The content is data (data/research-report-2026-q3.json): the figures quoted
 * from the research impact report verbatim, with a plain-language layer over
 * them. The meters are never combined; the page says so where it shows them.
 *
 * Renders only what goes inside <main class="section-page">, like the other
 * English-only pages. Everything but the live parts is static: the SPA renders
 * the parts that follow the reader here, and the Astro page
 * (astro/src/pages/research/2026-q3-report.astro) passes the same components
 * in as islands, through the props named below, so the page stays one source.
 */
export const REPORT = data;
export const REPORT_PATH = `/research/${data.slug}`;

const MATCHERS = termMatchers(data.glossary);
const KINDS = data.kinds;
const ENTRIES = data.entries;
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** Text with its glossary terms linked, the first use of each per `used` set. */
function Linked({ text, used }) {
    return linkText(text, MATCHERS, used).map((run, i) => (run.id
        ? <a key={i} className="rr-term" href={`#${run.id}`} data-term={run.id}>{run.text}</a>
        : <React.Fragment key={i}>{run.text}</React.Fragment>));
}

export default function ResearchReportPage({ updated = null, toc = null, glance = null, railMeters = null, finalMeters = null, dock = null, termTips = null, ...figures }) {
    return (
        <div className="rr-page">
            {/* the sections, in the left margin on wide screens */}
            {/* the sticky box is outside the island, so it sticks on the static page too */}
            <aside className="rr-toc"><div className="rr-toc-sticky">{toc || <ReportToc />}</div></aside>
            <Intro updated={updated} glance={glance || <ReportGlance />} />
            <Timeline rail={railMeters || <ReportMeters mode="rail" />} final={finalMeters || <ReportMeters mode="final" />} />
            <Methods figures={figures} />
            <div className="rr-group" id="milestones">
                <Milestone />
            </div>
            <div className="rr-group" id="details">
                <StartToEnd />
                <Instruments />
                <OpenQuestions />
                <Glossary updated={updated} />
            </div>
            {dock || <ReportDock />}
            {termTips || <TermTips />}
        </div>
    );
}

/**
 * The intro: what the research is for and what the report covers, then at a
 * glance (the headline figures and every entry by date), then why it matters: the
 * everyday experience each meter follows. Under 1320px, where the sidebar does
 * not fit, the sections are listed here too.
 */
function Intro({ updated, glance }) {
    const names = Object.fromEntries(data.meters.map((m) => [m.key, m.name]));
    return (
        <Section id="report" eyebrow="Research · Report" title={data.title} headingLevel="h1">
            <p className="rr-lede">{data.mission.lede}</p>
            <p className="rr-meta">
                <time dateTime={data.published}>October 24, 2026</time> · Dates are those of the research records, which can differ from the merge dates.
                {updated && <> Updated <time dateTime={updated}>{updated}</time>.</>}
            </p>
            <nav className="rr-onpage" aria-label="Sections of this page">
                {TOC.slice(1).map((g) => <a key={g.id} className="rr-chip" href={`#${g.id}`}>{g.label}</a>)}
            </nav>
            <div className="rr-glance" id="glance">
                <h2 className="rr-subhead">At a glance</h2>
                <div className="rr-kpis">
                    {data.kpis.map((k) => <div className="rr-kpi" key={k.v}><b>{k.v}</b><span>{k.l}</span></div>)}
                </div>
                <p className="rr-kpi-note">Each figure is its own workload. They cannot be added or multiplied into one app speedup, and the report claims none. <a href="#end">Why there is no single number</a></p>
                <h3 className="rr-glance-label">The {ENTRIES.length} entries, by date</h3>
                {glance}
                <Legend />
            </div>
            <div className="rr-why-block" id="why">
                <h2 className="rr-subhead">Why it matters</h2>
                <p className="rr-why-title">{data.mission.title}</p>
                {data.mission.body.map((p) => <p key={p}>{p}</p>)}
                <ul className="rr-why">
                    {data.mission.items.map((it) => (
                        <li key={it.meter}>
                            <span className="rr-why-meter">{names[it.meter]}</span>
                            <h3>{it.headline}</h3>
                            <p>{it.body}</p>
                        </li>
                    ))}
                </ul>
                <p className="rr-why-open">{data.mission.open} <a href="#open">What is not yet shown</a></p>
            </div>
        </Section>
    );
}

function Legend() {
    return (
        <ul className="rr-legend" aria-label="Markers">
            {Object.entries(KINDS).map(([kind, k]) => (
                <li key={kind}><Glyph kind={kind} /><b>{k.label}</b><span>{k.legend}</span></li>
            ))}
        </ul>
    );
}

/**
 * The report's milestone: gigabit-class throughput from adaptive windows. The
 * plain layer leads (what was achieved, on what path, and what it is not); the
 * report's own section follows: what changed, its evidence table and its
 * bounds. The chart is the host run second by second, with its startup second
 * kept, because the report says startup must not be read as the steady rate.
 */
function Milestone() {
    const ms = data.milestone, r = ms.report;
    const used = new Set();
    return (
        <Section id="milestone" eyebrow={ms.eyebrow} title={ms.headline}>
            <p className="rr-ms-lede">{ms.lede}</p>
            <p className="rr-ms-scope">{ms.scope}</p>
            <div className="rr-ms-grid">
                <figure className="rr-ms-run">
                    <RunChart run={ms.run} />
                    <figcaption>{ms.run.caption}</figcaption>
                </figure>
                <div className="rr-ms-stats">
                    {ms.stats.map((st) => <div className="rr-ms-stat" key={st.v}><b>{st.v}</b><span><Linked text={st.l} used={used} /></span></div>)}
                </div>
            </div>
            <h3 className="rr-subhead rr-ms-h">What changed</h3>
            <ol className="rr-ms-changes">
                {r.changes.map((c) => (
                    <li key={c.title}><h4>{c.title}</h4><p dangerouslySetInnerHTML={{ __html: linkHtml(c.text, MATCHERS, used) }} /></li>
                ))}
            </ol>
            <h3 className="rr-subhead rr-ms-h">Recorded impact and evidence strength</h3>
            <table className="rr-ms-table" role="table">
                <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Experiment</th><th role="columnheader" scope="col">Before → after</th><th role="columnheader" scope="col">What it establishes</th></tr></thead>
                <tbody role="rowgroup">
                    {r.table.map((row) => (
                        <tr role="row" key={row.experiment}>
                            <td role="cell" data-label="Experiment" dangerouslySetInnerHTML={{ __html: row.experiment }} />
                            <td role="cell" data-label="Before → after" dangerouslySetInnerHTML={{ __html: row.result }} />
                            <td role="cell" data-label="What it establishes" dangerouslySetInnerHTML={{ __html: linkHtml(row.establishes, MATCHERS, used) }} />
                        </tr>
                    ))}
                </tbody>
            </table>
            {r.guards.map((g) => <p className="rr-ms-guards" key={g} dangerouslySetInnerHTML={{ __html: g }} />)}
            <details className="rr-more">
                <summary>In the report</summary>
                <div className="rr-more-body">
                    {r.intro.map((para) => <p key={para} dangerouslySetInnerHTML={{ __html: para }} />)}
                    <p className="rr-evidence">
                        {r.evidence.map((src) => <a key={src.label} href={src.href} target="_blank" rel="noopener noreferrer">{src.label} <span aria-hidden="true">↗</span></a>)}
                    </p>
                </div>
            </details>
        </Section>
    );
}

/** The host TCP run, one bar a second: startup muted, the steady seconds as their 939–942 range, the mean and the service line. */
function RunChart({ run }) {
    const L = 44, R = 10, T = 22, B = 154, W = 360;
    const y = (v) => B - (v / run.service) * (B - T);
    const slot = (W - L - R) / run.seconds;
    const [lo, hi] = run.steady;
    const bar = (i, v) => {
        const x = L + i * slot + slot * 0.19, w = slot * 0.62, top = y(v), r = 3;
        return `M${x} ${B} V${top + r} A${r} ${r} 0 0 1 ${x + r} ${top} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${top + r} V${B} Z`;
    };
    return (
        <svg className="rr-ms-chart" viewBox={`0 0 ${W} 186`} role="img" aria-label={`Host TCP path, one bar per second: ${run.first} Mbps in the first second, then ${lo}–${hi} Mbps for the next nine; ten-second mean ${run.mean} Mbps, on 1-Gbps service`}>
            {[0, 500, 1000].map((v) => (
                <g key={v}>
                    <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={v === 1000 ? 'rgba(214,230,244,0.45)' : 'rgba(214,230,244,0.1)'} />
                    <text x={L - 6} y={y(v) + 3} fontSize="9" fill="rgba(214,230,244,0.56)" textAnchor="end">{v === 1000 ? '1,000' : v}</text>
                </g>
            ))}
            <text x={W - R} y={y(1000) - 5} fontSize="9" fill="rgba(214,230,244,0.7)" textAnchor="end">1-Gbps service</text>
            <path d={bar(0, run.first)} fill="#D6E6F4" fillOpacity="0.4" />
            <text x={L + slot / 2} y={y(run.first) - 6} fontSize="10" fill="#F8F8F8" textAnchor="middle">{run.first}</text>
            {Array.from({ length: run.seconds - 1 }, (_, k) => (
                <g key={k}>
                    <path d={bar(k + 1, lo)} fill="#ED8FFF" />
                    <rect x={L + (k + 1) * slot + slot * 0.19} y={y(hi)} width={slot * 0.62} height={y(lo) - y(hi)} fill="#ED8FFF" fillOpacity="0.45" />
                </g>
            ))}
            <text x={L + slot * 5.5} y={y(hi) - 18} fontSize="10" fill="#F8F8F8" textAnchor="middle">{lo}–{hi} each second</text>
            <line x1={L} x2={W - R} y1={y(run.mean)} y2={y(run.mean)} stroke="#F8F8F8" strokeOpacity="0.75" />
            {[1, 5, 10].map((sec) => <text key={sec} x={L + (sec - 0.5) * slot} y={B + 14} fontSize="9" fill="rgba(214,230,244,0.56)" textAnchor="middle">{sec} s</text>)}
            <text x={L} y={180} fontSize="9" fill="rgba(214,230,244,0.56)">Mbps, useful payload</text>
            <line x1={W - R - 104} x2={W - R - 92} y1={177} y2={177} stroke="#F8F8F8" strokeOpacity="0.75" />
            <text x={W - R} y={180} fontSize="9" fill="rgba(214,230,244,0.75)" textAnchor="end">ten-second mean {run.mean}</text>
        </svg>
    );
}

function monthSpan(list, label) {
    const days = list.flatMap((e) => [e.iso, rangeEnd(e) || e.iso].map((iso) => Number(iso.slice(8, 10))));
    return `${label} ${Math.min(...days)}–${Math.max(...days)}`;
}

/**
 * The entries by month, with the meters beside them in the rail on wide
 * screens. Under 1320px the bar under the nav carries the meters while the
 * reader is in the timeline, and the timeline ends with where they ended.
 */
function Timeline({ rail, final }) {
    return (
        <section id="timeline" className="section rr-timeline" aria-labelledby="timeline-title">
            <div className="rr-tl-layout">
                <div className="rr-tl-main">
                    <header className="section-header">
                        <span className="section-eyebrow">Timeline</span>
                        <h2 className="section-title" id="timeline-title">{ENTRIES.length} changes and experiments</h2>
                        <div className="section-rule" aria-hidden="true" />
                    </header>
                    <div className="section-body rr-tl-intro">
                        <p>Each entry leads with its result in plain words and one figure. Open it for the exact measurements, what they mean for the test suites, and the evidence. Entries that were rejected or made no difference stay on the timeline, marked as such.</p>
                        <p>The meters replay the evidence as you read. Each one moves only when you reach the entry that recorded it, and none of them is ever combined with another.</p>
                    </div>
                    {MONTHS.map((m) => <Month key={m.key} month={m} />)}
                    <section className="rr-tl-final" aria-labelledby="timeline-final-heading">
                        <h3 className="rr-subhead" id="timeline-final-heading">Where the meters ended</h3>
                        {final}
                    </section>
                </div>
                <aside className="rr-rail" aria-label="The meters, as of the entry you are reading">
                    <div className="rr-rail-sticky">{rail}</div>
                </aside>
            </div>
        </section>
    );
}

function Month({ month }) {
    const list = ENTRIES.filter((e) => e.month === month.key);
    const counts = {};
    for (const e of list) counts[e.kind] = (counts[e.kind] || 0) + 1;
    const headingId = `month-${month.key}-heading`;
    return (
        <section className="rr-month" id={`month-${month.key}`} aria-labelledby={headingId}>
            <header className="rr-month-head">
                <h3 id={headingId}>{month.name}</h3>
                <p className="rr-month-sub">{monthSpan(list, month.label)} · {list.length} entries</p>
                <ul className="rr-month-tally" aria-label={`${month.name} by kind`}>
                    {Object.keys(KINDS).filter((k) => counts[k]).map((k) => (
                        <li key={k}><Glyph kind={k} size={9} />{counts[k]} {(counts[k] > 1 ? PLURAL[k] : KINDS[k].label).toLowerCase()}</li>
                    ))}
                </ul>
            </header>
            <ol className="rr-entries">
                {list.map((e) => <Entry key={e.id} entry={e} />)}
            </ol>
        </section>
    );
}

function Entry({ entry: e }) {
    const used = new Set();
    const moves = movedMeters(e, data.meters);
    const statLabel = e.stat && <Linked text={e.stat.l} used={used} />;
    const more = e.more && <Linked text={e.more} used={used} />;
    const meaning = <Linked text={e.meaning} used={used} />;
    const measured = linkHtml(e.measured, MATCHERS, used);
    const suites = linkHtml(e.suites, MATCHERS, used);
    return (
        <li className="rr-entry" id={e.id} data-kind={e.kind}>
            <span className="rr-entry-node" aria-hidden="true"><Glyph kind={e.kind} /></span>
            <div className="rr-entry-body">
                <div className="rr-entry-meta">
                    <time className="rr-entry-date" dateTime={e.iso}>{e.date}</time>
                    <span className="rr-flag" data-kind={e.kind}><Glyph kind={e.kind} size={9} />{e.flag || KINDS[e.kind].label}</span>
                </div>
                <h4 className="rr-entry-title">{e.title}</h4>
                {e.stat
                    ? <p className="rr-entry-stat"><span className="rr-entry-stat-v">{e.stat.v}</span><span className="rr-entry-stat-l">{statLabel}</span></p>
                    : <p className="rr-entry-stat is-none"><span className="rr-entry-stat-v">No speed claim</span></p>}
                {more && <p className="rr-entry-more">{more}</p>}
                <p className="rr-entry-meaning">{meaning}</p>
                {e.rejected && <p className="rr-entry-rejected"><Glyph kind="rejected" size={10} /><span><b>Also rejected:</b> {e.rejected}</span></p>}
                {moves.length > 0 && (
                    <div className="rr-entry-foot">
                        <span className="rr-moves">Moves{moves.map((m) => <button key={m.key} type="button" className="rr-chip" data-meter={m.key}>{m.name}</button>)}</span>
                    </div>
                )}
                <details className="rr-more">
                    <summary>Exact figures and what they mean</summary>
                    <dl className="rr-more-body">
                        <dt>In the report</dt>
                        <dd dangerouslySetInnerHTML={{ __html: e.change }} />
                        <dt>Measured</dt>
                        <dd dangerouslySetInnerHTML={{ __html: measured }} />
                        <dt>What it means for the test suites</dt>
                        <dd dangerouslySetInnerHTML={{ __html: suites }} />
                        <dt>Evidence</dt>
                        <dd className="rr-evidence">
                            {e.evidence.map((src) => (src.href
                                ? <a key={src.label} href={src.href} target="_blank" rel="noopener noreferrer">{src.label} <span aria-hidden="true">↗</span></a>
                                : <span key={src.label} className="is-private">{src.label} (private; summarized here)</span>))}
                            {(e.commits || []).map((sha) => (
                                <a key={sha} className="rr-commit" href={`https://github.com/urnetwork/connect/commit/${sha}`} target="_blank" rel="noopener noreferrer" title={data.commits[sha]}>
                                    connect {sha.slice(0, 8)} <span aria-hidden="true">↗</span>
                                </a>
                            ))}
                        </dd>
                    </dl>
                </details>
            </div>
        </li>
    );
}

function StartToEnd() {
    return (
        <Section id="end" eyebrow="Start to end" title="How far each kind of gain went">
            <p>The report’s own estimates, axis by axis, with the confidence each one deserves.</p>
            <div className="rr-end-grid">
                {data.end.map((card) => (
                    <article key={card.axis} className={`rr-end-card${card.none ? ' is-none' : ''}`}>
                        <h3>{card.axis}</h3>
                        <p className="rr-end-figure">
                            {card.figure.split(' · ').map((part, i) => <React.Fragment key={part}>{i > 0 && ' · '}<span className="rr-nw">{part}</span></React.Fragment>)}
                        </p>
                        <p className="rr-end-what">{card.what}</p>
                        <p className="rr-end-conf"><b>Confidence</b> {card.confidence}</p>
                        {card.milestone && (
                            <details className="rr-more">
                                <summary>In the report</summary>
                                <div className="rr-more-body">
                                    {data.milestone.report.guards.map((g) => <p key={g} dangerouslySetInnerHTML={{ __html: g }} />)}
                                </div>
                            </details>
                        )}
                        {card.report && (
                            <details className="rr-more">
                                <summary>In the report</summary>
                                <dl className="rr-more-body">
                                    <dt>Start-to-end evidence</dt>
                                    <dd dangerouslySetInnerHTML={{ __html: card.report.evidence }} />
                                    <dt>Estimate and confidence</dt>
                                    <dd dangerouslySetInnerHTML={{ __html: card.report.estimate }} />
                                </dl>
                            </details>
                        )}
                    </article>
                ))}
            </div>
            <blockquote className="rr-pull">
                <p>“{data.summary.charAt(0).toUpperCase()}{data.summary.slice(1)}”</p>
                <cite>The report’s own one-sentence summary</cite>
            </blockquote>
        </Section>
    );
}

function Methods({ figures }) {
    return (
        <Section id="methods" eyebrow="Methods" title="How the research was done">
            <p>The program moved from exploratory tuning toward tests that tell competing causes apart. Each method has a short schematic animation, and the example beside it comes from the timeline.</p>
            <ol className="rr-methods">
                {data.methods.map((m, j) => {
                    const used = new Set();
                    return (
                        <li className="rr-method" id={`method-${m.key}`} key={m.key}>
                            {figures[`figure${cap(m.key)}`] || <MethodFigure sceneKey={m.key} label={m.alt} caption={m.caption} />}
                            <div className="rr-method-text">
                                <span className="rr-method-no">{String(j + 1).padStart(2, '0')}</span>
                                <h3>{m.heading}</h3>
                                <p>{m.plain}</p>
                                <p className="rr-seen">Seen in{m.seen.map((i) => <a key={i} className="rr-chip" href={`#${ENTRIES[i].id}`}>{ENTRIES[i].date}: {ENTRIES[i].title}</a>)}</p>
                                <details className="rr-more">
                                    <summary>In the report</summary>
                                    <div className="rr-more-body">
                                        <p><b>{m.title}.</b> <span dangerouslySetInnerHTML={{ __html: linkHtml(m.text, MATCHERS, used) }} /></p>
                                    </div>
                                </details>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </Section>
    );
}

function Instruments() {
    return (
        <Section id="instruments" eyebrow="Instruments" title="What changed in the tests themselves">
            <p>The test coverage improved substantially, even where performance is still open.</p>
            <div className="rr-cards">
                {data.instruments.map((it) => (
                    <article className="rr-card" key={it.name}>
                        <h3>{it.name}</h3>
                        <p>{it.plain}</p>
                        <details className="rr-more">
                            <summary>In the report</summary>
                            <div className="rr-more-body"><p dangerouslySetInnerHTML={{ __html: it.text }} /></div>
                        </details>
                    </article>
                ))}
            </div>
        </Section>
    );
}

function OpenQuestions() {
    return (
        <Section id="open" eyebrow="Open questions" title="What is not yet shown">
            <p>No cumulative app-speed or battery improvement is claimed. These are the gaps the next qualification has to close.</p>
            <ul className="rr-open">
                {data.open.map((q) => <li key={q.title}><h3>{q.title}</h3><p>{q.text}</p></li>)}
            </ul>
            <div className="rr-latest">
                <h3>The latest result, summarized</h3>
                <p>{data.latest}</p>
            </div>
        </Section>
    );
}

function Glossary({ updated }) {
    return (
        <Section id="glossary" eyebrow="Glossary" title="Terms used in this report">
            <dl className="rr-glossary">
                {data.glossary.map(([term, def]) => (
                    <div key={term} id={termId(term)}><dt>{term}</dt><dd>{def}</dd></div>
                ))}
            </dl>
            <p className="rr-fine">
                Source: <a href={data.source.href} target="_blank" rel="noopener noreferrer">{data.source.label} <span aria-hidden="true">↗</span></a>, in urnetwork/connect.
                {' '}Every figure is quoted from it unrounded; percentages and ratios appear only where the report states them.
                {updated && <> Updated <time dateTime={updated}>{updated}</time>.</>}
            </p>
        </Section>
    );
}
