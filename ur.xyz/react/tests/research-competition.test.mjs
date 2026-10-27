// The research page's competition clock (src/components/research-competition.js):
// the countdown to the start, and the phase the card shows at a given moment.
import test from 'node:test';
import assert from 'node:assert/strict';
import { APEX_COMPETITION, competitionPhase, countdown } from '../src/components/research-competition.js';

const START = Date.UTC(2026, 9, 29); // Thursday 2026-10-29 00:00 UTC
const WEEK = 7 * 86_400_000;

test('the competition starts on Thursday, October 29 at 00:00 UTC and links its page', () => {
    assert.equal(Date.parse(APEX_COMPETITION.startsAt), START);
    assert.equal(new Date(START).getUTCDay(), 4);
    assert.equal(APEX_COMPETITION.url, 'https://apex.macrocosmos.ai/competitions/15');
});

test('it is upcoming until the start, live for six weeks, then ended', () => {
    assert.equal(competitionPhase(Date.UTC(2026, 9, 26, 12)), 'upcoming');
    assert.equal(competitionPhase(START - 1), 'upcoming');
    assert.equal(competitionPhase(START), 'live');
    assert.equal(competitionPhase(START + 6 * WEEK - 1), 'live');
    assert.equal(competitionPhase(START + 6 * WEEK), 'ended');
});

test('the countdown splits the time left into days, hours, minutes and seconds', () => {
    assert.deepEqual(countdown(Date.UTC(2026, 9, 26, 12)), { days: 2, hours: 12, minutes: 0, seconds: 0 });
    assert.deepEqual(countdown(START - (3 * 86_400 + 4 * 3_600 + 5 * 60 + 6) * 1000), { days: 3, hours: 4, minutes: 5, seconds: 6 });
    // more than 99 days still counts whole days
    assert.deepEqual(countdown(START - 120 * 86_400_000), { days: 120, hours: 0, minutes: 0, seconds: 0 });
});

test('a part second counts as a second, so the clock is never at zero before the start', () => {
    assert.deepEqual(countdown(START - 1), { days: 0, hours: 0, minutes: 0, seconds: 1 });
    assert.deepEqual(countdown(START - 59_001), { days: 0, hours: 0, minutes: 1, seconds: 0 });
    // read 20ms past the second, as the card's clock is: the seconds the device's clock shows
    assert.deepEqual(countdown(START - 10_000 + 20), { days: 0, hours: 0, minutes: 0, seconds: 10 });
});

test('from the start on the countdown stays at zero', () => {
    const zero = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    assert.deepEqual(countdown(START), zero);
    assert.deepEqual(countdown(START + WEEK), zero);
});

// The dictionaries write the start out in words; they must say the moment the clock counts to.
test('every language writes the start the clock counts to', async () => {
    const start = new Date(APEX_COMPETITION.startsAt);
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(start);
    const time = start.toISOString().slice(11, 16);
    for (const code of ['en', 'ar', 'de', 'es', 'ru', 'zh']) {
        const c = (await import(`../src/i18n/${code}.js`)).default.research.competition;
        if (code === 'en') assert.equal(c.startDate, `${day} · ${time} UTC`);
        for (const key of ['startDate', 'startedDate']) {
            assert.match(c[key], new RegExp(`(^|\\D)${start.getUTCDate()}(\\D|$)`), `${code} ${key}: the day`);
            assert.ok(c[key].includes(`${time} `) && c[key].includes('UTC'), `${code} ${key}: the time, in UTC`);
        }
    }
});
