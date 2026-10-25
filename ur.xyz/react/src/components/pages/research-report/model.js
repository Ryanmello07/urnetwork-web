/**
 * The pure parts of the research report page (pages/ResearchReport.jsx): the
 * meters' state as of each entry, glossary links, chart layouts and number
 * formatting. No React and no DOM, so tests/research-report.test.mjs can run
 * it under node.
 */

export const fmt = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export const PLURAL = { gain: 'gains', recovery: 'recoveries', observation: 'observations', mixed: 'mixed', rejected: 'rejected', groundwork: 'groundwork' };

export const MONTHS = [
    { key: 'aug', name: 'August', label: 'Aug' },
    { key: 'sep', name: 'September', label: 'Sep' },
    { key: 'oct', name: 'October', label: 'Oct' },
];

const DAY = 86_400_000;
/** Days from `startIso` to `iso` (both YYYY-MM-DD, UTC). */
export const daysBetween = (startIso, iso) => (Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${startIso}T00:00:00Z`)) / DAY;

/**
 * The meters as of every entry: states[0] is before the first entry and
 * states[i + 1] is after entry i. A meter moves only at the entry that
 * recorded its evidence; nothing is ever summed or multiplied across entries.
 */
export function computeStates(entries) {
    const st = { i: -1, load: { baselines: [], points: [], latest: null, final: false }, bulk: { controlled: null, points: [] }, path: [], memory: [], fixed: [] };
    const copy = () => JSON.parse(JSON.stringify(st));
    const states = [copy()];
    entries.forEach((e, i) => {
        const m = e.meters || {};
        st.i = i;
        if (m.load) {
            if (m.load.baseline) st.load.baselines.push({ ...m.load.baseline, i });
            for (const p of m.load.points || []) {
                st.load.points.push({ ...p, i });
                st.load.latest = { ...p, i, date: e.date };
                if (p.final) st.load.final = true;
            }
        }
        if (m.bulk) {
            if (m.bulk.controlled) st.bulk.controlled = { ...m.bulk.controlled, i, date: e.date };
            for (const p of m.bulk.points || []) st.bulk.points.push({ ...p, i, date: e.date });
        }
        for (const it of m.path || []) st.path.push({ ...it, i, date: e.date });
        for (const it of m.memory || []) st.memory.push({ ...it, i, date: e.date });
        if (m.fixed) st.fixed.push({ ...m.fixed, i, date: e.date });
        states.push(copy());
    });
    return states;
}

/** The meters an entry moves, in meter order. */
export function movedMeters(entry, meters) {
    return meters.filter((m) => entry.meters && entry.meters[m.key]);
}

/**
 * Greedy rows so that marks closer than `gap` never overlap: each mark takes
 * the lowest row whose last mark is far enough to its left. Returns the row of
 * each input, in input order.
 */
export function rows(xs, gap) {
    const order = xs.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x || a.i - b.i);
    const last = [];
    const out = new Array(xs.length);
    for (const { x, i } of order) {
        let r = last.findIndex((l) => x - l >= gap);
        if (r < 0) { r = last.length; last.push(-Infinity); }
        last[r] = x;
        out[i] = r;
    }
    return out;
}

/** The end date of a dated range such as "Sep 14–19", as YYYY-MM-DD, or null. */
export function rangeEnd(entry) {
    const m = String(entry.date).match(/^[A-Z][a-z]{2} \d+–(\d+)$/);
    return m ? `${entry.iso.slice(0, 8)}${m[1].padStart(2, '0')}` : null;
}

// ── glossary links ────────────────────────────────────────────────────────────
// The first use of a glossary term in each entry (and in each method's report
// text) links to its definition. Only the jargon is matched; everyday words in
// the glossary (carrier, provider, median) are defined there but not linked.
const TERM_PATTERNS = {
    'A/A test': /\bA\/A\b/,
    'ACK compression': /\bACK compression\b/,
    ACK: /\bACKs?\b/,
    Connect: /\bConnect\b/,
    'Fast.com': /\bFast\.com\b/,
    Framer: /\bFramer(?:XL)?\b/,
    GC: /\b(?:GOGC|GC)\b/,
    Goroutine: /\bgoroutines?\b/i,
    gVisor: /\bgVisor\b/,
    'H1+': /\bH1\+/,
    H1: /\bH1\b(?!\+)/,
    H3: /\bH3\b/,
    'iOS profile': /\biOS[- ](?:profile|surrogate)\b/,
    'Model Mbps': /\bmodel Mbps\b/,
    LOWBAR: /\bLOWBAR\b/,
    MEMSTEADY: /\bMEMSTEADY\b/,
    NAT: /\bNAT\b/,
    p95: /\bp95\b/,
    P2P: /\bP2P\b/,
    Pack: /\bPacks?\b/,
    Pacing: /\bpacing\b/i,
    PERFVAR: /\bPERFVAR\b/,
    PTO: /\bPTO\b/,
    'Race mode': /\brace (?:mode|diagnostic|confirmations?)\b/,
    RPC: /\bRPC\b/,
    RTT: /\bRTT\b/,
    SDK: /\bSDK\b/,
    SYN: /\bSYN\b/,
    synctest: /\bsynctest\b/,
    TTFB: /\bTTFB\b/,
    TUN: /\b(?:full-)?TUN\b/,
    'WebSocket masking': /\b(?:WebSocket )?masking\b/,
    Window: /\bcwnd\b/,
};

/** The anchor id of a glossary term: "WebSocket masking" is g-websocket-masking, "H1+" g-h1-plus. */
export const termId = (term) => `g-${term.toLowerCase().replace(/\+/g, ' plus ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

/** The glossary terms the page links, longest pattern first so H1+ wins over H1. */
export function termMatchers(glossary) {
    return glossary
        .filter(([term]) => TERM_PATTERNS[term])
        .map(([term, def]) => ({ term, def, id: termId(term), re: TERM_PATTERNS[term] }))
        .sort((a, b) => b.re.source.length - a.re.source.length);
}

/**
 * Plain text split into runs: { text } or { text, id } for a linked term.
 * `used` (a Set of term ids) carries across the calls of one entry, so each
 * term links once per entry.
 */
export function linkText(text, matchers, used) {
    let runs = [{ text: String(text) }];
    for (const t of matchers) {
        if (used.has(t.id)) continue;
        const next = [];
        let found = false;
        for (const run of runs) {
            if (found || run.id) { next.push(run); continue; }
            const m = run.text.match(t.re);
            if (!m) { next.push(run); continue; }
            found = true;
            const before = run.text.slice(0, m.index);
            const after = run.text.slice(m.index + m[0].length);
            if (before) next.push({ text: before });
            next.push({ text: m[0], id: t.id });
            if (after) next.push({ text: after });
        }
        if (found) used.add(t.id);
        runs = next;
    }
    return runs;
}

/**
 * The same over the report's HTML (bold and code only): terms are linked in
 * text, never inside a tag or a <code> span.
 */
export function linkHtml(html, matchers, used) {
    const parts = String(html).split(/(<[^>]+>)/);
    let inCode = false;
    return parts.map((part) => {
        if (part.startsWith('<')) {
            if (/^<code\b/i.test(part)) inCode = true;
            else if (/^<\/code>/i.test(part)) inCode = false;
            return part;
        }
        if (inCode || !part) return part;
        return linkText(part, matchers, used)
            .map((run) => (run.id ? `<a class="rr-term" href="#${run.id}" data-term="${run.id}">${run.text}</a>` : run.text))
            .join('');
    }).join('');
}

// ── the page's sections ───────────────────────────────────────────────────────
// The order the page reads in, and what the sidebar (wide screens) and the
// section menu (tablets and phones) list: each group's id is an element on the
// page, and so is each of its items.
export const TOC = [
    { id: 'report', label: 'Intro', items: [{ id: 'glance', label: 'At a glance' }, { id: 'why', label: 'Why it matters' }] },
    { id: 'timeline', label: 'Timeline', items: [{ id: 'month-aug', label: 'August' }, { id: 'month-sep', label: 'September' }, { id: 'month-oct', label: 'October' }] },
    { id: 'methods', label: 'Methods', items: [] },
    { id: 'milestones', label: 'Milestones', items: [{ id: 'milestone', label: 'Gigabit-class throughput' }] },
    { id: 'details', label: 'Details', items: [{ id: 'end', label: 'Start to end' }, { id: 'instruments', label: 'Instruments' }, { id: 'open', label: 'Open questions' }, { id: 'glossary', label: 'Glossary' }] },
];

/** Every section id in page order, groups before their items. */
export const TOC_IDS = TOC.flatMap((g) => [g.id, ...g.items.map((i) => i.id)]);

/** The group an id belongs to, and the id's own label. */
export function tocPlace(id) {
    for (const g of TOC) {
        if (g.id === id) return { group: g, item: null };
        const item = g.items.find((i) => i.id === id);
        if (item) return { group: g, item };
    }
    return { group: TOC[0], item: null };
}
