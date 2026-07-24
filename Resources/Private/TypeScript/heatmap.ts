/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/heatmap
 * Version: 2.0.0 - TypeScript implementation
 *
 * Modular, configurable GitHub-style heatmap widget for TYPO3
 */

import {HeatmapRenderer} from './renderer.js';
import {HeatmapData, HeatmapOptions} from './types.js';

/**
 * Main heatmap widget class
 */
class Heatmap {
    constructor() {
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        document.addEventListener('widgetContentRendered', (event) => {
            this.initializeWidget(event.target as HTMLElement);
        });
    }

    private initializeWidget(target: HTMLElement): void {
        const container = target.querySelector('#heatmap-container') as HTMLElement;
        if (!container) return;

        // Prevent duplicate initialization
        if (container.dataset.initialized === 'true') return;
        container.dataset.initialized = 'true';

        try {
            const data: HeatmapData[] = JSON.parse(container.dataset.values || '[]');
            const options = this.parseOptions(container.dataset);

            // Tear down a previous renderer (and its ResizeObserver) if present.
            const previous = (container as unknown as {_heatmapRenderer?: HeatmapRenderer})._heatmapRenderer;
            previous?.destroy();

            // Clear any existing content
            container.innerHTML = '';

            // Store renderer instance for potential cleanup
            (container as unknown as {_heatmapRenderer?: HeatmapRenderer})._heatmapRenderer =
                new HeatmapRenderer(container, data, options);
        } catch (error) {
            console.error('Error initializing heatmap:', error);
            this.showError(container, 'Failed to load heatmap data');
            // Reset initialization flag on error
            container.dataset.initialized = 'false';
        }
    }

    private parseOptions(dataset: DOMStringMap): HeatmapOptions {
        return {
            duration: parseInt(dataset.optionsDuration || '365'),
            dateRangeMode: (dataset.optionsDateRangeMode as 'year' | 'year-auto' | 'month' | 'auto') || 'auto',
            color: dataset.optionsColor || '255, 135, 0',
            locale: dataset.optionsLocale || 'en-GB',
            showLegend: dataset.optionsShowLegend !== 'false',
            showYearLabels: dataset.optionsShowYearLabels !== 'false',
            showMonthLabels: dataset.optionsShowMonthLabels !== 'false',
            minCellSize: parseInt(dataset.optionsMinCellSize || '8'),
            maxCellSize: parseInt(dataset.optionsMaxCellSize || '20'),
            tooltipWidth: parseInt(dataset.optionsTooltipWidth || '120'),
            tooltipHeight: parseInt(dataset.optionsTooltipHeight || '26'),
            tooltipItemSingular: dataset.optionsTooltipItemSingular || 'change',
            tooltipItemPlural: dataset.optionsTooltipItemPlural || 'changes',
            legendLess: dataset.optionsLegendLess || 'Less',
            legendMore: dataset.optionsLegendMore || 'More',
            weekStartsOnMonday: !!+(dataset.optionsWeekStartsOnMonday || '0')
        };
    }

    private showError(container: HTMLElement, message: string): void {
        container.innerHTML = '';
        const errorEl = document.createElement('div');
        errorEl.style.color = '#d73a49';
        errorEl.style.padding = '20px';
        errorEl.style.textAlign = 'center';
        errorEl.textContent = message;
        container.appendChild(errorEl);
    }
}

export default new Heatmap();
