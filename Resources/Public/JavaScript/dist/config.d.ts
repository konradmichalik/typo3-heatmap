/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 */
import { HeatmapOptions, ColorRGB } from './types.js';
import { DateRangeMode } from './date-utils.js';
export declare class HeatmapConfig {
    duration: number;
    dateRangeMode: DateRangeMode;
    color: ColorRGB;
    locale: string;
    showLegend: boolean;
    showYearLabels: boolean;
    showMonthLabels: boolean;
    minCellSize: number;
    maxCellSize: number;
    cellSpacing: number;
    containerPadding: number;
    tooltipWidth: number;
    tooltipHeight: number;
    tooltipItemSingular: string;
    tooltipItemPlural: string;
    weekStartsOnMonday: boolean;
    legendLess: string;
    legendMore: string;
    constructor(options?: HeatmapOptions);
}
//# sourceMappingURL=config.d.ts.map