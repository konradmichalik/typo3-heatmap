/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/renderer
 *
 * GitHub-style heatmap renderer.
 *
 * The heatmap is drawn in a fixed logical coordinate system (constant cell
 * size) and scaled to the container via the SVG `viewBox`. The only dynamic
 * decision left is how many week columns to show; everything else — scaling,
 * centering — is handled by the browser.
 */
import { HeatmapData, HeatmapOptions } from './types.js';
export declare class HeatmapRenderer {
    private container;
    private data;
    private config;
    private colorScale;
    private tooltip;
    private svg?;
    private resizeObserver?;
    private resizeHandler?;
    private destroyed;
    private currentWeeks;
    private earliestData?;
    constructor(container: HTMLElement, data: HeatmapData[], options?: HeatmapOptions);
    private observe;
    private update;
    private findEarliestData;
    /**
     * Resolve the date range to display for a given container width. Only the
     * date window changes with size — never the cell geometry.
     */
    private resolveRange;
    private renderRange;
    /**
     * Materialize one entry per day in the range, merged with the data counts.
     */
    private buildDates;
    private renderCells;
    private renderCell;
    private addCellInteractivity;
    private formatTooltipContent;
    private renderMonthLabels;
    private renderYearLabels;
    private renderLegend;
    private estimateTextWidth;
    private addLegendSquareTooltip;
    destroy(): void;
}
//# sourceMappingURL=renderer.d.ts.map