/**
 * Where the reader is on the research report, shared by every part of the page
 * that follows them: the section sidebar and the meters in the rail (wide
 * screens), the meters above the timeline, and the bar under the nav (tablets
 * and phones). On the static page these are separate islands; they share this
 * module, so one scroll listener serves them all and they always agree.
 *
 *   index       the last timeline entry whose top has passed the reading line
 *               (42% down the viewport below the nav), or -1 above the first.
 *               Moving back needs the entry 28px back past the line, so a stop
 *               near the line does not flicker between two entries.
 *   section     the section being read (model.js TOC): the last whose top has
 *               passed a line a quarter of the way down.
 *   docked      whether the bar shows under the nav (under 1320px, where the
 *               sidebars do not fit beside the column). Binary, with the site's
 *               0.25 hysteresis: it docks once the page's title block is 75%
 *               under the nav and undocks below 25% (DESIGNSTYLE, scroll-dock).
 *   inTimeline  whether the bar shows the meters (the reader is in the
 *               timeline) or the section; 40px of hysteresis at either end.
 *
 * `pulse(key)` asks every meter set to flash one meter (an entry's "Moves"
 * chips call it, through a delegated click listener installed here).
 */
import { useEffect, useState } from 'react';
import { TOC_IDS } from './model';

export const WIDE = 1320;
const INITIAL = { index: -1, section: TOC_IDS[0], docked: false, inTimeline: false };
let state = INITIAL;
const listeners = new Set();
const pulseListeners = new Set();
let started = false;
let raf = 0;
let entries = [];
let sections = [];

function collect() {
    entries = [...document.querySelectorAll('.rr-entry')];
    sections = TOC_IDS.map((id) => document.getElementById(id)).filter(Boolean);
}

function navBottom() {
    const nav = document.querySelector('.nav');
    return nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 64;
}

function computeIndex(current, top) {
    const line = top + (window.innerHeight - top) * 0.42;
    let index = -1;
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].getBoundingClientRect().top <= line) index = i;
        else break;
    }
    if (current >= 0 && index < current && entries[current] && entries[current].getBoundingClientRect().top <= line + 28) index = current;
    return index;
}

function computeSection(top) {
    const line = top + (window.innerHeight - top) * 0.25;
    let id = TOC_IDS[0];
    for (const el of sections) if (el.getBoundingClientRect().top <= line) id = el.id;
    return id;
}

function computeDocked(current, top) {
    if (window.innerWidth >= WIDE) return false;
    const head = document.querySelector('#report .section-header');
    if (!head) return false;
    const r = head.getBoundingClientRect();
    const passed = (top - r.top) / Math.max(1, r.height);
    if (!current && passed >= 0.75) return true;
    if (current && passed <= 0.25) return false;
    return current;
}

function computeInTimeline(current, top) {
    const timeline = document.getElementById('timeline');
    if (!timeline) return false;
    const r = timeline.getBoundingClientRect();
    const slack = current ? 40 : 0;
    return r.top <= top + 80 + slack && r.bottom >= top + 160 - slack;
}

function update() {
    raf = 0;
    if (!entries.length || !sections.length) collect();
    const top = navBottom();
    const next = {
        index: computeIndex(state.index, top),
        section: computeSection(top),
        docked: computeDocked(state.docked, top),
        inTimeline: computeInTimeline(state.inTimeline, top),
    };
    if (Object.keys(next).every((k) => next[k] === state[k])) return;
    // the entry being read is marked on the timeline itself (its node rings)
    if (next.index !== state.index) entries.forEach((el, i) => el.classList.toggle('is-active', i === next.index));
    state = next;
    for (const fn of listeners) fn(state);
}
const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

function onClick(e) {
    const chip = e.target.closest && e.target.closest('.rr-chip[data-meter]');
    if (chip) pulse(chip.dataset.meter);
}

function start() {
    if (started) return;
    started = true;
    collect();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => { collect(); schedule(); });
    document.addEventListener('click', onClick);
    // fonts and late layout move the entries; settle once they are in
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    update();
}

export function subscribe(fn) {
    start();
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
}

export function onPulse(fn) {
    pulseListeners.add(fn);
    return () => pulseListeners.delete(fn);
}

export function pulse(key) {
    for (const fn of pulseListeners) fn(key);
}

/** The shared state, as a hook. The first render (and the static page) is the top of the page. */
export function useActiveEntry() {
    const [s, setS] = useState(INITIAL);
    useEffect(() => subscribe(setS), []);
    return s;
}

/** Whether the visitor asked for reduced motion; false on the server. */
export function useReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const q = window.matchMedia('(prefers-reduced-motion: reduce)');
        const on = () => setReduced(q.matches);
        on();
        q.addEventListener?.('change', on);
        return () => q.removeEventListener?.('change', on);
    }, []);
    return reduced;
}

/** The element's content width, measured after mount; `fallback` on the server. */
export function useWidth(ref, fallback) {
    const [w, setW] = useState(fallback);
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const measure = () => setW(Math.max(160, Math.floor(el.clientWidth || fallback)));
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref, fallback]);
    return w;
}
