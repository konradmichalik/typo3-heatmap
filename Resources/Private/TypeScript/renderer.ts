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

import {HeatmapConfig} from './config.js';
import {ColorScale} from './color-scale.js';
import {HeatmapTooltip} from './tooltip.js';
import {HeatmapData, HeatmapOptions, DateRange} from './types.js';
import {
    getDayOfWeekIndex,
    getWeekStart,
    resolveWeekCount,
    toDateKey,
    weekSpan,
} from './date-utils.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Logical coordinate system — the viewBox scales these to any container size.
const CELL = 10;              // logical cell size
const GAP = 2;                // gap between cells
const PITCH = CELL + GAP;     // 12 — grid pitch
const LABEL_TOP = 16;         // band above the grid for month labels
const LABEL_LEFT = 0;         // reserved for optional weekday labels
const LEGEND_H = 20;          // band below the grid for legend + year labels
const DAYS = 7;               // rows per week

const RESIZE_DEBOUNCE_MS = 150;

function debounce<T extends (...args: never[]) => void>(fn: T, wait: number): T {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return ((...args: Parameters<T>) => {
        if (timer !== undefined) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    }) as T;
}

export class HeatmapRenderer {
    private container: HTMLElement;
    private data: HeatmapData[];
    private config: HeatmapConfig;
    private colorScale: ColorScale;
    private tooltip: HeatmapTooltip;
    private svg?: SVGSVGElement;
    private resizeObserver?: ResizeObserver;
    private currentWeeks = -1;
    private earliestData?: Date;

    constructor(container: HTMLElement, data: HeatmapData[], options: HeatmapOptions = {}) {
        this.container = container;
        this.data = data;
        this.config = new HeatmapConfig(options);
        this.colorScale = new ColorScale(this.config, data);
        this.earliestData = this.findEarliestData();

        // The HTML tooltip is positioned relative to the container.
        this.container.style.position = 'relative';
        this.tooltip = new HeatmapTooltip(this.container);

        // No immediate render: the first ResizeObserver callback with a real
        // width triggers the initial draw. This also fixes initialization while
        // the widget is still hidden (width 0).
        this.observe();
    }

    private observe(): void {
        this.resizeObserver = new ResizeObserver(
            debounce((entries: ResizeObserverEntry[]) => {
                const width = entries[0]?.contentRect.width ?? 0;
                this.update(width);
            }, RESIZE_DEBOUNCE_MS),
        );
        this.resizeObserver.observe(this.container);
    }

    private update(width: number): void {
        if (width === 0) return; // widget not visible yet

        const range = this.resolveRange(width);
        const weeks = weekSpan(range.start, range.end, this.config.weekStartsOnMonday);

        // Only re-render when the column count actually changes. Between
        // breakpoints the SVG scales for free via its viewBox.
        if (weeks === this.currentWeeks) return;
        this.currentWeeks = weeks;
        this.renderRange(range, weeks);
    }

    private findEarliestData(): Date | undefined {
        if (this.data.length === 0) return undefined;
        const times = this.data
            .map(d => {
                // Parse YYYY-MM-DD as local midnight — new Date('YYYY-MM-DD')
                // is UTC per spec, which would shift the day west of UTC.
                const [y, m, day] = (d.date || d.change_date || '').split('-').map(Number);
                return new Date(y, (m ?? 1) - 1, day ?? 1).getTime();
            })
            .filter(t => !Number.isNaN(t));
        if (times.length === 0) return undefined;
        return new Date(Math.min(...times));
    }

    /**
     * Resolve the date range to display for a given container width. Only the
     * date window changes with size — never the cell geometry.
     */
    private resolveRange(width: number): DateRange {
        const monday = this.config.weekStartsOnMonday;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(today);

        const startWeeksBack = (columns: number): Date => {
            const start = getWeekStart(today, monday);
            start.setDate(start.getDate() - (columns - 1) * 7);
            return start;
        };

        switch (this.config.dateRangeMode) {
            case 'year':
                return {start: startWeeksBack(resolveWeekCount(width, 'year')), end};
            case 'month':
                return {start: startWeeksBack(resolveWeekCount(width, 'month')), end};
            case 'year-auto': {
                // Current calendar year, clamped to the earliest available data,
                // with a 30-day floor for a meaningful display.
                const yearStart = new Date(today.getFullYear(), 0, 1);
                let start = this.earliestData && this.earliestData > yearStart
                    ? new Date(this.earliestData)
                    : yearStart;
                const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
                if (days < 30) {
                    start = new Date(end);
                    start.setDate(start.getDate() - 29);
                }
                start.setHours(0, 0, 0, 0);
                return {start, end};
            }
            default: // 'auto'
                return {start: startWeeksBack(resolveWeekCount(width, 'auto')), end};
        }
    }

    private renderRange(range: DateRange, weekCount: number): void {
        const dates = this.buildDates(range);

        const logicalWidth = weekCount * PITCH + LABEL_LEFT;
        const logicalHeight = DAYS * PITCH + LABEL_TOP + LEGEND_H;

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${logicalWidth} ${logicalHeight}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.maxHeight = '100%';
        svg.style.display = 'block';

        this.renderCells(svg, dates, range);
        this.renderMonthLabels(svg, range);
        this.renderYearLabels(svg, range);
        this.renderLegend(svg, logicalWidth);

        // Swap in the new SVG, leaving the tooltip overlay untouched.
        if (this.svg) this.svg.remove();
        this.svg = svg;
        this.container.appendChild(svg);
    }

    /**
     * Materialize one entry per day in the range, merged with the data counts.
     */
    private buildDates(range: DateRange): HeatmapData[] {
        const dateMap = new Map(this.data.map(d => {
            const dateStr = d.date || d.change_date || '';
            const count = d.count ?? d.changes_count ?? 0;
            return [dateStr, {count, link: d.link}];
        }));

        const dates: HeatmapData[] = [];
        for (let d = new Date(range.start); d <= range.end; d.setDate(d.getDate() + 1)) {
            const key = toDateKey(d);
            const dayData = dateMap.get(key);
            dates.push({
                date: key,
                count: dayData?.count || 0,
                link: dayData?.link,
                dateObject: new Date(d),
            });
        }
        return dates;
    }

    private renderCells(svg: SVGSVGElement, dates: HeatmapData[], range: DateRange): void {
        const monday = this.config.weekStartsOnMonday;
        const startWeekStart = getWeekStart(range.start, monday);

        dates.forEach(d => {
            if (!d.dateObject) return;

            const dayOfWeek = getDayOfWeekIndex(d.dateObject, monday);
            const currentWeekStart = getWeekStart(d.dateObject, monday);
            const weekIndex = Math.round(
                (currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
            );

            this.renderCell(svg, d, weekIndex, dayOfWeek);
        });
    }

    private renderCell(svg: SVGSVGElement, data: HeatmapData, weekIndex: number, dayOfWeek: number): void {
        const count = data.count ?? data.changes_count ?? 0;

        const rect = document.createElementNS(SVG_NS, 'rect');
        const x = weekIndex * PITCH + LABEL_LEFT;
        const y = dayOfWeek * PITCH + LABEL_TOP;

        rect.setAttribute('x', x.toString());
        rect.setAttribute('y', y.toString());
        rect.setAttribute('width', CELL.toString());
        rect.setAttribute('height', CELL.toString());
        rect.setAttribute('rx', '2');
        rect.setAttribute('ry', '2');
        rect.setAttribute('fill', this.colorScale.getColor(count));
        rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
        rect.setAttribute('stroke-width', '1');

        if (data.link) {
            rect.style.cursor = 'pointer';
        }

        this.addCellInteractivity(rect, data);
        svg.appendChild(rect);
    }

    private addCellInteractivity(rect: SVGRectElement, data: HeatmapData): void {
        const tooltipContent = this.formatTooltipContent(data);

        rect.addEventListener('mouseover', () => {
            this.tooltip.show(rect, tooltipContent);
            rect.setAttribute('stroke', '#1f2328');
            rect.setAttribute('stroke-width', '2');
            rect.style.filter = 'brightness(1.1)';
        });

        rect.addEventListener('mouseout', () => {
            this.tooltip.hide();
            rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
            rect.setAttribute('stroke-width', '1');
            rect.style.filter = 'none';
        });

        if (data.link) {
            rect.addEventListener('click', event => {
                event.preventDefault();
                if (data.link) {
                    window.open(data.link, '_blank', 'noopener,noreferrer');
                }
            });
        }
    }

    private formatTooltipContent(data: HeatmapData): string {
        if (!data.dateObject) return '';

        const date = data.dateObject.toLocaleDateString(this.config.locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const count = data.count ?? data.changes_count ?? 0;
        const word = count === 1 ? this.config.tooltipItemSingular : this.config.tooltipItemPlural;

        let tooltip = `${date}: ${count} ${word}`;
        if (data.link) {
            tooltip += `\n↗`;
        }
        return tooltip;
    }

    private renderMonthLabels(svg: SVGSVGElement, range: DateRange): void {
        if (!this.config.showMonthLabels) return;

        const monday = this.config.weekStartsOnMonday;
        const startWeekStart = getWeekStart(range.start, monday);
        const seen = new Set<string>();

        for (let d = new Date(range.start); d <= range.end; d.setDate(d.getDate() + 1)) {
            if (d.getDate() !== 1) continue;

            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const currentWeekStart = getWeekStart(d, monday);
            const weekIndex = Math.round(
                (currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
            );

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', (weekIndex * PITCH + LABEL_LEFT).toString());
            text.setAttribute('y', (LABEL_TOP - 6).toString());
            text.setAttribute('fill', '#586069');
            text.setAttribute('font-size', '9px');
            text.textContent = d.toLocaleDateString(this.config.locale, {month: 'short'});
            svg.appendChild(text);
        }
    }

    private renderYearLabels(svg: SVGSVGElement, range: DateRange): void {
        if (!this.config.showYearLabels) return;

        const monday = this.config.weekStartsOnMonday;
        const startWeekStart = getWeekStart(range.start, monday);
        const baselineY = LABEL_TOP + DAYS * PITCH + 12;

        // Mark January 1st occurrences within the range.
        const seen = new Set<number>();
        for (let d = new Date(range.start); d <= range.end; d.setDate(d.getDate() + 1)) {
            if (d.getMonth() !== 0 || d.getDate() !== 1) continue;
            if (seen.has(d.getFullYear())) continue;
            seen.add(d.getFullYear());

            const currentWeekStart = getWeekStart(d, monday);
            const weekIndex = Math.round(
                (currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
            );

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', (weekIndex * PITCH + LABEL_LEFT).toString());
            text.setAttribute('y', baselineY.toString());
            text.setAttribute('fill', '#24292e');
            text.setAttribute('font-size', '9px');
            text.setAttribute('font-weight', '600');
            text.textContent = d.getFullYear().toString();
            svg.appendChild(text);
        }
    }

    private renderLegend(svg: SVGSVGElement, logicalWidth: number): void {
        if (!this.config.showLegend) return;

        const legendGroup = document.createElementNS(SVG_NS, 'g');
        const legendY = LABEL_TOP + DAYS * PITCH + 12;

        const lessTextWidth = this.estimateTextWidth(this.config.legendLess, 9);
        const moreTextWidth = this.estimateTextWidth(this.config.legendMore, 9);
        const squareSize = 8;
        const squarePitch = 10;
        const squaresWidth = 5 * squarePitch - (squarePitch - squareSize);
        const spacing = 4;

        const totalLegendWidth = lessTextWidth + spacing + squaresWidth + spacing + moreTextWidth;
        const legendX = Math.max(0, logicalWidth - totalLegendWidth);

        const lessLabel = document.createElementNS(SVG_NS, 'text');
        lessLabel.setAttribute('x', legendX.toString());
        lessLabel.setAttribute('y', legendY.toString());
        lessLabel.setAttribute('fill', '#586069');
        lessLabel.setAttribute('font-size', '9px');
        lessLabel.textContent = this.config.legendLess;
        legendGroup.appendChild(lessLabel);

        const squaresStartX = legendX + lessTextWidth + spacing;
        const thresholds = this.colorScale.getThresholds();
        const {r, g, b} = this.config.color;
        const opacities = [0, 0.4, 0.6, 0.8, 1.0];

        for (let i = 0; i < 5; i++) {
            const square = document.createElementNS(SVG_NS, 'rect');
            square.setAttribute('x', (squaresStartX + i * squarePitch).toString());
            square.setAttribute('y', (legendY - squareSize).toString());
            square.setAttribute('width', squareSize.toString());
            square.setAttribute('height', squareSize.toString());
            square.setAttribute('rx', '2');

            if (i === 0) {
                square.setAttribute('fill', 'var(--typo3-heatmap-empty-color, rgba(235, 237, 240, 0.3))');
            } else {
                square.setAttribute('fill', `rgba(${r}, ${g}, ${b}, ${opacities[i]})`);
            }

            this.addLegendSquareTooltip(square, i, thresholds);
            legendGroup.appendChild(square);
        }

        const moreLabel = document.createElementNS(SVG_NS, 'text');
        moreLabel.setAttribute('x', (squaresStartX + squaresWidth + spacing).toString());
        moreLabel.setAttribute('y', legendY.toString());
        moreLabel.setAttribute('fill', '#586069');
        moreLabel.setAttribute('font-size', '9px');
        moreLabel.textContent = this.config.legendMore;
        legendGroup.appendChild(moreLabel);

        svg.appendChild(legendGroup);
    }

    private estimateTextWidth(text: string, fontSize: number): number {
        // Rough estimate: average glyph width ~0.6 * font size.
        return text.length * fontSize * 0.6;
    }

    private addLegendSquareTooltip(square: SVGRectElement, level: number, thresholds: number[]): void {
        let tooltipText: string;

        if (level === 0) {
            tooltipText = '0';
        } else if (level === 4) {
            tooltipText = `${thresholds[level]}+`;
        } else {
            const minValue = thresholds[level];
            const maxValue = thresholds[level + 1] - 1;
            tooltipText = minValue === maxValue ? `${minValue}` : `${minValue}-${maxValue}`;
        }

        square.addEventListener('mouseover', () => this.tooltip.show(square, tooltipText));
        square.addEventListener('mouseout', () => this.tooltip.hide());
    }

    public destroy(): void {
        this.resizeObserver?.disconnect();
        this.tooltip.destroy();
        if (this.svg) {
            this.svg.remove();
            this.svg = undefined;
        }
    }
}
