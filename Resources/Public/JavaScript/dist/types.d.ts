/**
 * Type definitions for TYPO3 Heatmap Widget
 */
import { DateRangeMode } from './date-utils.js';
export interface HeatmapData {
    date: string;
    count: number;
    link?: string;
    dateObject?: Date;
    /**
     * @deprecated Legacy field name. Superseded by `date`. Support is retained
     * throughout 1.x and will be removed in 2.0.
     */
    change_date?: string;
    /**
     * @deprecated Legacy field name. Superseded by `count`. Support is retained
     * throughout 1.x and will be removed in 2.0.
     */
    changes_count?: number;
}
export interface HeatmapOptions {
    duration?: number;
    dateRangeMode?: DateRangeMode;
    color?: string;
    locale?: string;
    showLegend?: boolean;
    showYearLabels?: boolean;
    showMonthLabels?: boolean;
    minCellSize?: number;
    maxCellSize?: number;
    tooltipWidth?: number;
    tooltipHeight?: number;
    tooltipItemSingular?: string;
    tooltipItemPlural?: string;
    weekStartsOnMonday?: boolean;
    legendLess?: string;
    legendMore?: string;
}
export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}
export interface DateRange {
    start: Date;
    end: Date;
}
//# sourceMappingURL=types.d.ts.map