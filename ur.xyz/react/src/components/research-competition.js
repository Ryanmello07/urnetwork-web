/**
 * The research page's algo competition: where it runs and when, and what its
 * card shows at a given moment. ResearchExtras.jsx draws the card; the Astro
 * pages read the phase at build time; tests/research-competition.test.mjs
 * checks the clock. No React in here.
 *
 * The current competition runs on Apex (Bittensor SN1): six weekly rounds
 * from Thursday 2026-10-29 00:00 UTC. Until then the card counts down to the
 * start; from the start it says the competition is live, and after the last
 * round that it has ended. Until the competition page is finalized `url` is
 * null and the card's art, title and button are not links.
 */
export const APEX_COMPETITION = Object.freeze({
    url: 'https://apex.macrocosmos.ai/competitions/15',
    startsAt: '2026-10-29T00:00:00Z',
    rounds: 6,
    roundDays: 7,
});

const DAY_MS = 86_400_000;

/** 'upcoming' | 'live' | 'ended' at time `now` (ms): live from the start for rounds × roundDays days. */
export function competitionPhase(now, { startsAt, rounds, roundDays } = APEX_COMPETITION) {
    const start = Date.parse(startsAt);
    if (now < start) return 'upcoming';
    return now < start + rounds * roundDays * DAY_MS ? 'live' : 'ended';
}

/**
 * The time left before the start at `now` (ms) as whole days, hours, minutes
 * and seconds, all zero from the start on. A part second counts as a second,
 * so the clock reads 00:00:00:01 in the last second and is never at zero
 * while the competition is still upcoming.
 */
export function countdown(now, { startsAt } = APEX_COMPETITION) {
    const left = Math.max(0, Math.ceil((Date.parse(startsAt) - now) / 1000));
    return {
        days: Math.floor(left / 86_400),
        hours: Math.floor(left / 3_600) % 24,
        minutes: Math.floor(left / 60) % 60,
        seconds: left % 60,
    };
}
