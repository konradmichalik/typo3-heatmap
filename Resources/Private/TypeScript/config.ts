/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 */

import {HeatmapOptions, ColorRGB} from './types.js';
import {DateRangeMode} from './date-utils.js';

// Options that no longer influence rendering after the viewBox rewrite. They
// are still read for backwards compatibility but emit a one-time warning and
// will be removed in 2.0.
const deprecatedOptions: Array<{key: keyof HeatmapOptions; reason: string}> = [
    {key: 'minCellSize', reason: 'cell size is now fixed in a logical coordinate system and scaled via the SVG viewBox'},
    {key: 'maxCellSize', reason: 'cell size is now fixed in a logical coordinate system and scaled via the SVG viewBox'},
    {key: 'tooltipWidth', reason: 'the tooltip is an HTML overlay that sizes itself automatically'},
    {key: 'tooltipHeight', reason: 'the tooltip is an HTML overlay that sizes itself automatically'},
];

const warnedOptions = new Set<string>();

function warnDeprecatedOptions(options: HeatmapOptions): void {
    for (const {key, reason} of deprecatedOptions) {
        if (options[key] === undefined || warnedOptions.has(key)) continue;
        warnedOptions.add(key);
        console.warn(
            `[typo3-heatmap] Option "${key}" is deprecated and ignored: ${reason}. ` +
            `It will be removed in 2.0.`,
        );
    }
}

export class HeatmapConfig {
    public duration: number;
    public dateRangeMode: DateRangeMode;
    public color: ColorRGB;
    public locale: string;
    public showLegend: boolean;
    public showYearLabels: boolean;
    public showMonthLabels: boolean;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    public minCellSize: number;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    public maxCellSize: number;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    public tooltipWidth: number;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    public tooltipHeight: number;
    public tooltipItemSingular: string;
    public tooltipItemPlural: string;
    public weekStartsOnMonday: boolean;
    public legendLess: string;
    public legendMore: string;

    constructor(options: HeatmapOptions = {}) {
        warnDeprecatedOptions(options);

        // Duration and date range. `duration` only takes effect in setups
        // without a fixed dateRangeMode ('year'/'month'); see DataProviders.md.
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
