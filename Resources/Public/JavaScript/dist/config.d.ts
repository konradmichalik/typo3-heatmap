/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 */
import { HeatmapOptions, ColorRGB } from './types.js';
import { DateRangeMode } from './date-utils.js';
export declare class HeatmapConfig {
    /** @deprecated Ignored since the viewBox rewrite; use dateRangeMode. Removal targeted for 2.0. */
    duration: number;
    dateRangeMode: DateRangeMode;
    color: ColorRGB;
    locale: string;
    showLegend: boolean;
    showYearLabels: boolean;
    showMonthLabels: boolean;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    minCellSize: number;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    maxCellSize: number;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    tooltipWidth: number;
    /** @deprecated Ignored since the viewBox rewrite. Removal targeted for 2.0. */
    tooltipHeight: number;
    tooltipItemSingular: string;
    tooltipItemPlural: string;
    weekStartsOnMonday: boolean;
    legendLess: string;
    legendMore: string;
    constructor(options?: HeatmapOptions);
}
//# sourceMappingURL=config.d.ts.map