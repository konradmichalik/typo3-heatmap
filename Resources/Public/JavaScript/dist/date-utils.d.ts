/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/date-utils
 *
 * Pure date/layout helpers for the heatmap renderer. Kept free of DOM access
 * so they can be unit tested in isolation.
 */
export type DateRangeMode = 'year' | 'year-auto' | 'month' | 'auto';
/**
 * Format a date as a local `YYYY-MM-DD` key.
 *
 * Uses the local calendar fields instead of `toISOString()` (which is UTC) so
 * that keys match the date strings produced server-side in local time. Using
 * UTC here shifted cells by a day west of UTC / depending on server timezone.
 */
export declare function toDateKey(d: Date): string;
/**
 * Return the first day of the week containing `date`, normalized to local
 * midnight. Respects the configured week start (Monday or Sunday).
 */
export declare function getWeekStart(date: Date, weekStartsOnMonday: boolean): Date;
/**
 * Return the 0-6 row index of `date` within its week, respecting the configured
 * week start.
 */
export declare function getDayOfWeekIndex(date: Date, weekStartsOnMonday: boolean): number;
/**
 * Number of week columns spanned by the inclusive range [start, end].
 *
 * Computed from week starts and rounded, so it stays correct across daylight
 * saving transitions (where a "week" is 7 days ± 1 hour).
 */
export declare function weekSpan(start: Date, end: Date, weekStartsOnMonday: boolean): number;
/**
 * Resolve how many week columns to display for a given container width.
 *
 * Fixed modes (`year`, `month`) return a constant column budget. `auto` uses
 * deliberately coarse breakpoints so the layout rarely re-renders — between
 * breakpoints the SVG scales for free via its viewBox.
 */
export declare function resolveWeekCount(containerWidth: number, mode: DateRangeMode): number;
//# sourceMappingURL=date-utils.d.ts.map