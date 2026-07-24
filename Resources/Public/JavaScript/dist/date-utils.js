/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/date-utils
 *
 * Pure date/layout helpers for the heatmap renderer. Kept free of DOM access
 * so they can be unit tested in isolation.
 */
/**
 * Format a date as a local `YYYY-MM-DD` key.
 *
 * Uses the local calendar fields instead of `toISOString()` (which is UTC) so
 * that keys match the date strings produced server-side in local time. Using
 * UTC here shifted cells by a day west of UTC / depending on server timezone.
 */
export function toDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/**
 * Return the first day of the week containing `date`, normalized to local
 * midnight. Respects the configured week start (Monday or Sunday).
 */
export function getWeekStart(date, weekStartsOnMonday) {
    const weekStart = new Date(date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, ..., 6 = Saturday
    if (weekStartsOnMonday) {
        // Monday-based weeks: Sunday wraps to the end of the previous week.
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekStart.setDate(weekStart.getDate() - mondayOffset);
    }
    else {
        // Sunday-based weeks (GitHub style).
        weekStart.setDate(weekStart.getDate() - dayOfWeek);
    }
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}
/**
 * Return the 0-6 row index of `date` within its week, respecting the configured
 * week start.
 */
export function getDayOfWeekIndex(date, weekStartsOnMonday) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, ..., 6 = Saturday
    if (weekStartsOnMonday) {
        return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    }
    return dayOfWeek;
}
/**
 * Number of week columns spanned by the inclusive range [start, end].
 *
 * Computed from week starts and rounded, so it stays correct across daylight
 * saving transitions (where a "week" is 7 days ± 1 hour).
 */
export function weekSpan(start, end, weekStartsOnMonday) {
    const s = getWeekStart(start, weekStartsOnMonday).getTime();
    const e = getWeekStart(end, weekStartsOnMonday).getTime();
    return Math.round((e - s) / (7 * 24 * 60 * 60 * 1000)) + 1;
}
/**
 * Resolve how many week columns to display for a given container width.
 *
 * Fixed modes (`year`, `month`) return a constant column budget. `auto` uses
 * deliberately coarse breakpoints so the layout rarely re-renders — between
 * breakpoints the SVG scales for free via its viewBox.
 */
export function resolveWeekCount(containerWidth, mode) {
    if (mode === 'year')
        return 53; // ~1 year
    if (mode === 'month')
        return 5; // ~1 month
    // 'auto' (and any width-driven fallback): breakpoints on container width.
    if (containerWidth >= 700)
        return 53; // 1 year
    if (containerWidth >= 400)
        return 26; // 6 months
    return 13; // 3 months
}
