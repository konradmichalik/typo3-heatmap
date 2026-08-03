import {describe, expect, it} from 'vitest';
import {
    getDayOfWeekIndex,
    getWeekStart,
    resolveWeekCount,
    toDateKey,
    weekSpan,
} from '../../Resources/Private/TypeScript/date-utils';

// These tests assume a fixed timezone so local-date arithmetic (and the DST
// case below) is deterministic. The `test:js` npm script pins TZ=Europe/Berlin.

describe('toDateKey', () => {
    it('formats a date as a local YYYY-MM-DD key', () => {
        expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('zero-pads month and day', () => {
        expect(toDateKey(new Date(2026, 8, 9))).toBe('2026-09-09');
    });

    it('uses local time, not UTC (late-evening date does not roll over)', () => {
        // 23:30 local stays on the same calendar day, unlike toISOString().
        expect(toDateKey(new Date(2026, 2, 15, 23, 30))).toBe('2026-03-15');
    });
});

describe('resolveWeekCount', () => {
    it('returns a fixed column budget for year and month modes', () => {
        expect(resolveWeekCount(300, 'year')).toBe(53);
        expect(resolveWeekCount(1200, 'year')).toBe(53);
        expect(resolveWeekCount(300, 'month')).toBe(5);
        expect(resolveWeekCount(1200, 'month')).toBe(5);
    });

    it('applies width breakpoints in auto mode', () => {
        expect(resolveWeekCount(399, 'auto')).toBe(13);
        expect(resolveWeekCount(400, 'auto')).toBe(26);
        expect(resolveWeekCount(699, 'auto')).toBe(26);
        expect(resolveWeekCount(700, 'auto')).toBe(53);
    });

    it('falls back to width breakpoints for year-auto', () => {
        expect(resolveWeekCount(350, 'year-auto')).toBe(13);
        expect(resolveWeekCount(500, 'year-auto')).toBe(26);
        expect(resolveWeekCount(800, 'year-auto')).toBe(53);
    });
});

describe('getWeekStart', () => {
    // 2026-01-07 is a Wednesday.
    it('returns the preceding Sunday for Sunday-based weeks', () => {
        expect(toDateKey(getWeekStart(new Date(2026, 0, 7), false))).toBe('2026-01-04');
    });

    it('returns the preceding Monday for Monday-based weeks', () => {
        expect(toDateKey(getWeekStart(new Date(2026, 0, 7), true))).toBe('2026-01-05');
    });

    it('treats Sunday as the last day of a Monday-based week', () => {
        // 2026-01-04 is a Sunday -> previous Monday is 2025-12-29.
        expect(toDateKey(getWeekStart(new Date(2026, 0, 4), true))).toBe('2025-12-29');
    });

    it('is idempotent on a week start', () => {
        const sundayStart = getWeekStart(new Date(2026, 0, 7), false);
        expect(toDateKey(getWeekStart(sundayStart, false))).toBe(toDateKey(sundayStart));
    });

    it('normalizes to local midnight', () => {
        const start = getWeekStart(new Date(2026, 0, 7, 18, 45), false);
        expect([start.getHours(), start.getMinutes(), start.getSeconds()]).toEqual([0, 0, 0]);
    });
});

describe('getDayOfWeekIndex', () => {
    it('maps Sunday-based indices (Sunday = 0)', () => {
        expect(getDayOfWeekIndex(new Date(2026, 0, 4), false)).toBe(0); // Sunday
        expect(getDayOfWeekIndex(new Date(2026, 0, 5), false)).toBe(1); // Monday
        expect(getDayOfWeekIndex(new Date(2026, 0, 10), false)).toBe(6); // Saturday
    });

    it('maps Monday-based indices (Monday = 0, Sunday = 6)', () => {
        expect(getDayOfWeekIndex(new Date(2026, 0, 5), true)).toBe(0); // Monday
        expect(getDayOfWeekIndex(new Date(2026, 0, 4), true)).toBe(6); // Sunday
    });
});

describe('weekSpan', () => {
    it('counts a single week as 1', () => {
        expect(weekSpan(new Date(2026, 0, 5), new Date(2026, 0, 7), false)).toBe(1);
    });

    it('counts inclusive week columns', () => {
        // 2026-01-04 (Sun) .. 2026-01-24 (Sat) spans 3 Sunday weeks.
        expect(weekSpan(new Date(2026, 0, 4), new Date(2026, 0, 24), false)).toBe(3);
    });

    it('stays correct across a DST spring-forward boundary', () => {
        // Europe/Berlin springs forward on 2026-03-29. The 03-29 -> 04-05 week
        // is only 167 hours; a naive floor would under-count.
        expect(weekSpan(new Date(2026, 2, 22), new Date(2026, 3, 5), false)).toBe(3);
    });

    it('spans a full calendar year as 53 or 54 columns', () => {
        const span = weekSpan(new Date(2026, 0, 1), new Date(2026, 11, 31), false);
        expect(span).toBeGreaterThanOrEqual(53);
        expect(span).toBeLessThanOrEqual(54);
    });
});
