import React, { useEffect, useRef, useState } from 'react';
import data from '../../../data/research-report-2026-q3.json';
import { computeStates, fmt, MONTHS, rows } from './model';
import { onPulse, useActiveEntry, useReducedMotion, useWidth } from './active';
import { tipHandlers } from './tooltip';
import Glyph from './Glyph';

/**
 * The meters of the research report: one per axis, never combined, each as of
 * the entry the reader is at (active.js). The rail beside the timeline (wide
 * screens) and the block above it (tablets and phones) are this component in
 * two modes. Every mark is drawn from the start and shown only once its entry
 * is reached, so no box changes size as the meters fill (DESIGNSTYLE:
 * placeholders, not pop-in); scrolling back rewinds them.
 */
const ENTRIES = data.entries;
const STATES = computeStates(ENTRIES);
const FINAL = STATES[STATES.length - 1];
const MONTH_COUNTS = MONTHS.map((m) => ENTRIES.filter((e) => e.month === m.key).length);
const SPAN = (Date.parse(`${data.period.end}T00:00:00Z`) - Date.parse(`${data.period.start}T00:00:00Z`)) / 86_400_000;
const UR = '#ED8FFF', UI = '#D6E6F4', BG = '#101010', WHITE = '#F8F8F8', AXIS = 'rgba(214,230,244,0.56)';

export function Progress({ index, className = 'rr-progress' }) {
    let first = 0;
    return (
        <div className={className} aria-hidden="true">
            {MONTHS.map((m, j) => {
                const done = Math.max(0, Math.min(MONTH_COUNTS[j], index + 1 - first));
                const fill = done / MONTH_COUNTS[j];
                first += MONTH_COUNTS[j];
                return <span key={m.key} style={{ flex: `${MONTH_COUNTS[j]} 1 0` }}><i style={{ '--fill': fill }} /></span>;
            })}
        </div>
    );
}

/** A number that eases to its new value (a one-shot 520ms ease-in-out), or jumps under reduced motion. */
function useTween(value, decimals, animate) {
    const [shown, setShown] = useState(value);
    const from = useRef(value);
    useEffect(() => {
        if (value == null || from.current == null || !animate || from.current === value) {
            from.current = value;
            setShown(value);
            return undefined;
        }
        const a = from.current, t0 = performance.now();
        let raf = 0;
        const step = (now) => {
            const x = Math.min(1, (now - t0) / 520);
            const e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
            setShown(a + (value - a) * e);
            if (x < 1) raf = requestAnimationFrame(step);
            else from.current = value;
        };
        raf = requestAnimationFrame(step);
        return () => { cancelAnimationFrame(raf); from.current = value; };
    }, [value, animate]);
    return shown == null ? '—' : fmt(shown, decimals);
}

const Label = ({ x, y, anchor = 'start', fill = AXIS, size = 9, children }) => (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor}>{children}</text>
);

/** Page load: a strip of observations on one log axis, with the Aug 24 baselines as a band. */
function LoadChart({ W, index }) {
    const L = 4, R = 6, axisY = 46, H = 62;
    const x = (v) => L + ((Math.log(v) - Math.log(300)) / (Math.log(5000) - Math.log(300))) * (W - L - R);
    const [b0, b1] = FINAL.load.baselines.map((b) => b.v).sort((p, q) => p - q);
    const bandAt = Math.min(...FINAL.load.baselines.map((b) => b.i));
    const points = FINAL.load.points;
    const r = rows(points.map((p) => x(p.v)), 8);
    const latest = STATES[index + 1].load.points.length - 1;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Median Wikipedia load observations on a log scale, with the Aug 24 baselines">
            <line x1={L} x2={W - R} y1={axisY} y2={axisY} stroke="rgba(214,230,244,0.25)" />
            {[[300, '300'], [500, '500'], [1000, '1K'], [2000, '2K'], [4000, '4K']].map(([v, lab]) => (
                <g key={v}>
                    <line x1={x(v)} x2={x(v)} y1={axisY} y2={axisY + 3} stroke="rgba(214,230,244,0.35)" />
                    <Label x={x(v)} y={H - 2} anchor={v === 300 ? 'start' : 'middle'}>{lab}</Label>
                </g>
            ))}
            <g className={`rr-mk${bandAt <= index ? ' is-on' : ''}`} tabIndex={bandAt <= index ? 0 : -1} role="img" aria-label={`Aug 24 baselines, ${fmt(b0, 1)} and ${fmt(b1, 1)} ms`}
                {...tipHandlers(() => [`${fmt(b0, 1)} and ${fmt(b1, 1)} ms`, 'Aug 24 baselines: the explicit-H1 control and the low-bar bundled baseline'])}>
                <rect x={x(b0)} y={16} width={x(b1) - x(b0)} height={axisY - 16} fill="rgba(214,230,244,0.1)" />
                <line x1={x(b0)} x2={x(b0)} y1={16} y2={axisY} stroke="rgba(214,230,244,0.45)" />
                <line x1={x(b1)} x2={x(b1)} y1={16} y2={axisY} stroke="rgba(214,230,244,0.45)" />
                <Label x={W - R} y={10} anchor="end" fill="rgba(214,230,244,0.7)">Aug 24 baselines</Label>
            </g>
            {points.map((p, j) => {
                const e = ENTRIES[p.i];
                const cx = x(p.v), cy = axisY - 9 - r[j] * 8;
                const pub = p.src === 'public', cur = j === latest, on = p.i <= index;
                return (
                    <g key={j} className={`rr-mk${on ? ' is-on' : ''}`} tabIndex={on ? 0 : -1} role="img" aria-label={`${fmt(p.v, 1)} ms, ${p.l}, ${e.date}`}
                        {...tipHandlers(() => [`${fmt(p.v, 1)} ms`, p.l, e.date])}>
                        <circle cx={cx} cy={cy} r="11" fill="transparent" />
                        <circle cx={cx} cy={cy} r={cur ? 4.4 : 3.4}
                            fill={pub ? BG : (cur ? UR : UI)} fillOpacity={pub || cur ? 1 : 0.75}
                            stroke={pub ? (cur ? UR : UI) : BG} strokeWidth={pub ? 1.4 : 2} />
                        {cur && <Label x={cx} y={10} anchor="middle" fill={WHITE} size={10}>{fmt(p.v, 1)}</Label>}
                    </g>
                );
            })}
        </svg>
    );
}

/** Bulk speed: the controlled before-and-after as a dumbbell; public and phone readings beneath it, on the same axis. */
function BulkChart({ W, index, compact }) {
    const H = compact ? 66 : 74, L = 2, R = 6, axisY = H - 13, rowA = 10, rowB = axisY - 9;
    const x = (v) => L + ((Math.log(v) - Math.log(5)) / (Math.log(150) - Math.log(5))) * (W - L - R);
    const c = FINAL.bulk.controlled, cOn = c.i <= index;
    const r = rows(FINAL.bulk.points.map((p) => x(p.v)), 8);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Bulk speed in Mbps on a log scale: the controlled H1 path, and public and phone readings">
            <line x1={L} x2={W - R} y1={axisY} y2={axisY} stroke="rgba(214,230,244,0.25)" />
            {[5, 10, 25, 50, 100].map((v) => (
                <g key={v}>
                    <line x1={x(v)} x2={x(v)} y1={axisY} y2={axisY + 3} stroke="rgba(214,230,244,0.35)" />
                    <Label x={x(v)} y={H - 1} anchor={v === 5 ? 'start' : 'middle'}>{v}</Label>
                </g>
            ))}
            <Label x={L} y={rowA - 4} fill="rgba(214,230,244,0.66)">controlled H1 path</Label>
            <Label x={L} y={rowB - 14 - (compact ? 0 : 2)} fill="rgba(214,230,244,0.66)">public and phone readings</Label>
            <g className={`rr-mk${cOn ? ' is-on' : ''}`} tabIndex={cOn ? 0 : -1} role="img" aria-label={`controlled H1 path, about ${c.from} to ${c.to} Mbps`}
                {...tipHandlers(() => [`about ${c.from} → ${c.to} Mbps (${c.x})`, `runs ${c.runs.join(' / ')} Mbps`, ENTRIES[c.i].date])}>
                <rect x={x(c.from) - 8} y={rowA - 4} width={x(c.to) - x(c.from) + 16} height={18} fill="transparent" />
                <line className="rr-grow" x1={x(c.from)} x2={x(c.to)} y1={rowA + 5} y2={rowA + 5} stroke={UR} strokeWidth="2" strokeLinecap="round" style={{ transformOrigin: `${x(c.from)}px 0` }} />
                <circle cx={x(c.from)} cy={rowA + 5} r="3.6" fill={BG} stroke={UR} strokeWidth="1.5" />
                <circle cx={x(c.to)} cy={rowA + 5} r="4.2" fill={UR} stroke={BG} strokeWidth="2" />
                <Label x={x(c.to) + 8} y={rowA + 8} fill={WHITE} size={10}>{c.x}</Label>
            </g>
            {FINAL.bulk.points.map((p, j) => {
                const on = p.i <= index, cx = x(p.v), cy = rowB + 3 - r[j] * 7;
                return (
                    <g key={j} className={`rr-mk${on ? ' is-on' : ''}`} tabIndex={on ? 0 : -1} role="img" aria-label={`${p.v} Mbps, ${p.l}, ${p.date}`}
                        {...tipHandlers(() => [`${p.v} Mbps`, p.l, p.date])}>
                        <circle cx={cx} cy={cy} r="11" fill="transparent" />
                        <circle cx={cx} cy={cy} r="3.4" fill={UI} fillOpacity="0.72" stroke={BG} strokeWidth="2" />
                    </g>
                );
            })}
        </svg>
    );
}

/** Packet path and memory: one series each, so one colour; bars from one baseline, rounded at the data end, the value at the tip. */
function Bars({ W, index, items, min, max, ticks, tick, label }) {
    const rowH = 19, R = 44, H = items.length * rowH + 12;
    const x = (v) => ((v - min) / (max - min)) * (W - R);
    const bar = (w, y0) => {
        const r = Math.min(3, w / 2, 3);
        return `M0 ${y0} H${w - r} A${r} ${r} 0 0 1 ${w} ${y0 + r} V${y0 + 6 - r} A${r} ${r} 0 0 1 ${w - r} ${y0 + 6} H0 Z`;
    };
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}>
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={x(t)} x2={x(t)} y1={0} y2={H - 11} stroke="rgba(214,230,244,0.08)" />
                    <Label x={x(t)} y={H - 1} anchor={t === min ? 'start' : 'middle'}>{tick(t)}</Label>
                </g>
            ))}
            {items.map((it, j) => {
                const y0 = j * rowH, on = it.i <= index;
                const v0 = Array.isArray(it.v) ? it.v[0] : it.v;
                const end = Array.isArray(it.v) ? x(it.v[1]) : x(v0);
                return (
                    <g key={it.l}>
                        <rect x={0} y={y0 + 10} width={x(max)} height={6} fill="rgba(214,230,244,0.07)" />
                        <g className={`rr-mk${on ? ' is-on' : ''}`} tabIndex={on ? 0 : -1} role="img" aria-label={`${it.l}: ${it.t}, ${it.date}`}
                            {...tipHandlers(() => [it.t, it.l, it.date])}>
                            <rect x={0} y={y0} width={W} height={rowH} fill="transparent" />
                            <Label x={0} y={y0 + 7.5} size={9.5} fill="rgba(214,230,244,0.78)">{it.l}</Label>
                            <path className="rr-grow" d={bar(Math.max(2, x(v0)), y0 + 10)} fill={UR} style={{ transformOrigin: '0 0' }} />
                            {Array.isArray(it.v) && (
                                <>
                                    <line className="rr-grow" x1={x(v0)} x2={x(it.v[1])} y1={y0 + 13} y2={y0 + 13} stroke={UR} strokeWidth="1.5" style={{ transformOrigin: '0 0' }} />
                                    <line className="rr-grow" x1={x(it.v[1])} x2={x(it.v[1])} y1={y0 + 9.5} y2={y0 + 16.5} stroke={UR} strokeWidth="1.5" style={{ transformOrigin: '0 0' }} />
                                </>
                            )}
                            <Label x={end + 5} y={y0 + 16} size={10} fill={WHITE}>{it.t}</Label>
                        </g>
                    </g>
                );
            })}
        </svg>
    );
}

const PATH_ITEMS = FINAL.path.filter((p) => p.featured).map((p) => ({ ...p, v: p.x }));
const MEMORY_ITEMS = FINAL.memory.filter((p) => p.featured).map((p) => ({ ...p, v: p.pct, t: `−${p.pct}%` }));

function Chart({ mode, children }) {
    const ref = useRef(null);
    const W = useWidth(ref, mode === 'rail' ? 240 : 320);
    return <div className="rr-meter-chart" ref={ref}>{children(W)}</div>;
}

function Others({ items, open, onToggle }) {
    if (!items.length) return null;
    return (
        <>
            <button className="rr-meter-toggle" type="button" aria-expanded={open} onClick={onToggle}>{open ? 'Hide the rest' : `${items.length} more`}</button>
        </>
    );
}

export default function ReportMeters({ mode = 'rail' }) {
    const { index } = useActiveEntry();
    const reduced = useReducedMotion();
    const state = STATES[index + 1];
    const [pulses, setPulses] = useState({});
    const [open, setOpen] = useState({ path: false, memory: false });
    const prev = useRef(index);
    const [animate, setAnimate] = useState(false);

    // a meter flashes once when the entry that moves it is reached going forward,
    // or when an entry's chip asks for it
    const flash = (keys) => {
        if (reduced || !keys.length) return;
        setPulses((p) => {
            const next = { ...p };
            for (const k of keys) next[k] = (p[k] || 0) + 1;
            return next;
        });
        setTimeout(() => setPulses((p) => { const next = { ...p }; for (const k of keys) next[k] = 0; return next; }), 1400);
    };
    useEffect(() => onPulse((key) => flash([key])), [reduced]);
    useEffect(() => {
        const from = prev.current;
        prev.current = index;
        if (index > from && index - from <= 3) {
            const keys = new Set();
            for (let k = from + 1; k <= index; k++) for (const key of Object.keys(ENTRIES[k].meters || {})) keys.add(key);
            flash([...keys]);
        }
        // values ease only once the reader is moving through the timeline
        setAnimate(!reduced);
    }, [index]);

    const L = state.load.latest, c = state.bulk.controlled, nObs = state.bulk.points.length;
    const load = useTween(L ? L.v : null, 1, animate);
    const bulk = useTween(c ? c.to : null, 0, animate);
    const counts = {
        path: useTween(state.path.length || null, 0, animate),
        memory: useTween(state.memory.length || null, 0, animate),
        fixed: useTween(state.fixed.length || null, 0, animate),
    };
    const meterClass = (key) => {
        const p = pulses[key] || 0;
        return `rr-meter${p ? (p % 2 ? ' is-pulse-a' : ' is-pulse-b') : ''}`;
    };
    const othersOf = (key) => state[key].filter((p) => !p.featured);
    const recentFixed = state.fixed.slice(mode === 'rail' ? -1 : -3).reverse();

    return (
        <div className={`rr-meters-set rr-meters-${mode}`}>
            <div className="rr-as-of">
                <span><span className="rr-as-of-label">As of</span> <span className="rr-as-of-date">{index >= 0 ? ENTRIES[index].date : 'Start'}</span></span>
                <span className="rr-as-of-count">{index + 1} of {ENTRIES.length}</span>
            </div>
            <Progress index={index} />
            {mode !== 'rail' && (
                <div className="rr-progress-months" aria-hidden="true">
                    {MONTHS.map((m, j) => <span key={m.key} style={{ flex: `${MONTH_COUNTS[j]} 1 0` }}>{m.label}</span>)}
                </div>
            )}
            <div className="rr-meters">
                {data.meters.map((m) => {
                    const empty = m.key === 'load' ? !L : m.key === 'bulk' ? !c : !state[m.key].length;
                    const value = m.key === 'load' ? load : m.key === 'bulk' ? bulk : counts[m.key];
                    return (
                        <section key={m.key} className={meterClass(m.key)} data-meter={m.key} aria-label={m.name}>
                            <h3 className="rr-meter-name">{m.name}{m.key === 'load' && mode === 'rail' && state.load.final ? <small className="is-final">4.7–7.3× vs Aug 24</small> : <small>{m.tag}</small>}</h3>
                            <p className={`rr-meter-value${empty ? ' is-empty' : ''}`}>
                                <b>{value}</b>
                                <em style={empty ? { visibility: 'hidden' } : undefined}>{m.unit}</em>
                                {(m.key === 'path' || m.key === 'memory') && (
                                    <Others items={othersOf(m.key)} open={open[m.key]} onToggle={() => setOpen((o) => ({ ...o, [m.key]: !o[m.key] }))} />
                                )}
                            </p>
                            {m.key === 'load' && (
                                <p className={`rr-meter-sub${mode === 'rail' ? ' is-one' : ''}`}>
                                    <span>{L ? `${L.l}, ${L.date}` : 'No measurement yet'}</span>
                                    {/* the rail says it in the meter's name row, to keep its height */}
                                    {mode !== 'rail' && <span className={`rr-meter-badge${state.load.final ? ' is-on' : ''}`}>4.7–7.3× faster than Aug 24, low confidence</span>}
                                </p>
                            )}
                            {m.key === 'bulk' && (
                                <p className="rr-meter-sub is-one">{c ? `from about ${c.from}, ${c.x}${nObs ? ` · ${nObs} other reading${nObs > 1 ? 's' : ''}` : ''}` : 'No measurement yet'}</p>
                            )}
                            {m.key === 'load' && <Chart mode={mode}>{(W) => <LoadChart W={W} index={index} />}</Chart>}
                            {m.key === 'load' && (
                                <ul className="rr-legend rr-chart-legend" aria-hidden="true">
                                    <li><svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.8" fill={UI} fillOpacity="0.75" /></svg>phone</li>
                                    <li><svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.8" fill={BG} stroke={UI} strokeWidth="1.5" /></svg>public route</li>
                                    <li className="rr-chart-note">ms, lower is faster</li>
                                </ul>
                            )}
                            {m.key === 'bulk' && <Chart mode={mode}>{(W) => <BulkChart W={W} index={index} compact={mode === 'rail'} />}</Chart>}
                            {m.key === 'path' && <Chart mode={mode}>{(W) => <Bars W={W} index={index} items={PATH_ITEMS} min={1} max={5} ticks={[1, 3, 5]} tick={(t) => `${t}×`} label="The largest packet-path and window speed-ups, each measured alone" />}</Chart>}
                            {m.key === 'memory' && <Chart mode={mode}>{(W) => <Bars W={W} index={index} items={MEMORY_ITEMS} min={0} max={100} ticks={[0, 50, 100]} tick={(t) => `${t}%`} label="The three memory reductions the report features, each in its own owner" />}</Chart>}
                            {(m.key === 'path' || m.key === 'memory') && open[m.key] && othersOf(m.key).length > 0 && (
                                <ul className="rr-meter-list">
                                    {othersOf(m.key).map((p) => <li key={p.l}><span>{p.l}: {p.t}</span><time>{p.date}</time></li>)}
                                </ul>
                            )}
                            {m.key === 'fixed' && (
                                <ul className="rr-meter-list">
                                    {recentFixed.map((p) => <li key={p.l}><Glyph kind="recovery" size={9} /><span>{p.l}</span><time>{p.date}</time></li>)}
                                    {state.fixed.length > recentFixed.length && <li className="is-more">and {state.fixed.length - recentFixed.length} earlier</li>}
                                </ul>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
