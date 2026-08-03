/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 */
// Options that no longer influence rendering after the viewBox rewrite. They
// are still read for backwards compatibility but emit a one-time warning and
// will be removed in 2.0.
const deprecatedOptions = [
    { key: 'duration', reason: 'the date range is derived from dateRangeMode and container width' },
    { key: 'minCellSize', reason: 'cell size is now fixed in a logical coordinate system and scaled via the SVG viewBox' },
    { key: 'maxCellSize', reason: 'cell size is now fixed in a logical coordinate system and scaled via the SVG viewBox' },
    { key: 'tooltipWidth', reason: 'the tooltip is an HTML overlay that sizes itself automatically' },
    { key: 'tooltipHeight', reason: 'the tooltip is an HTML overlay that sizes itself automatically' },
];
const warnedOptions = new Set();
function warnDeprecatedOptions(options) {
    for (const { key, reason } of deprecatedOptions) {
        if (options[key] === undefined || warnedOptions.has(key))
            continue;
        warnedOptions.add(key);
        console.warn(`[typo3-heatmap] Option "${key}" is deprecated and ignored: ${reason}. ` +
            `It will be removed in 2.0.`);
    }
}
export class HeatmapConfig {
    constructor(options = {}) {
        warnDeprecatedOptions(options);
        // `duration` is deprecated and no longer read by the renderer; the
        // active range comes from dateRangeMode + container width. Kept for
        // backwards compatibility until 2.0.
        this.duration = options.duration ?? 365;
        this.dateRangeMode = options.dateRangeMode ?? 'auto';
        // Color configuration
        const colorString = options.color ?? '255, 135, 0';
        const colorParts = colorString.split(',').map(c => parseInt(c.trim()));
        this.color = {
            r: colorParts[0] ?? 255,
            g: colorParts[1] ?? 135,
            b: colorParts[2] ?? 0
        };
        // Localization
        this.locale = options.locale ?? 'en-GB';
        // Display options
        this.showLegend = options.showLegend ?? true;
        this.showYearLabels = options.showYearLabels ?? true;
        this.showMonthLabels = options.showMonthLabels ?? true;
        // Deprecated layout dimensions — read but no longer used for rendering.
        this.minCellSize = options.minCellSize ?? 8;
        this.maxCellSize = options.maxCellSize ?? 20;
        // Deprecated tooltip dimensions — read but no longer used for rendering.
        this.tooltipWidth = options.tooltipWidth ?? 120;
        this.tooltipHeight = options.tooltipHeight ?? 26;
        this.tooltipItemSingular = options.tooltipItemSingular ?? 'change';
        this.tooltipItemPlural = options.tooltipItemPlural ?? 'changes';
        // Week configuration
        this.weekStartsOnMonday = options.weekStartsOnMonday ?? false; // Default: Sunday (GitHub style)
        // Legend labels
        this.legendLess = options.legendLess ?? 'Less';
        this.legendMore = options.legendMore ?? 'More';
    }
}
