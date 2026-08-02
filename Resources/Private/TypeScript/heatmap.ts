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

        const store = container as unknown as {_heatmapRenderer?: HeatmapRenderer};

        // Tear down a previous renderer (and its ResizeObserver) before re-init.
        // Keying off the stored instance keeps the guard effective while still
        // running the teardown on a genuine re-render of the same container.
        if (store._heatmapRenderer) {
            store._heatmapRenderer.destroy();
            store._heatmapRenderer = undefined;
        } else if (container.dataset.initialized === 'true') {
            return; // initialized elsewhere, nothing to replace
        }
        container.dataset.initialized = 'true';

        try {
            const data: HeatmapData[] = JSON.parse(container.dataset.values || '[]');
            const options = this.parseOptions(container.dataset);

            // Clear any existing content
            container.innerHTML = '';

            // Store renderer instance for potential cleanup
            store._heatmapRenderer = new HeatmapRenderer(container, data, options);
        } catch (error) {
            console.error('Error initializing heatmap:', error);
            this.showError(container, 'Failed to load heatmap data');
            // Reset initialization flag on error
            container.dataset.initialized = 'false';
        }
    }

    private parseOptions(dataset: DOMStringMap): HeatmapOptions {
        const options: HeatmapOptions = {
            dateRangeMode: (dataset.optionsDateRangeMode as HeatmapOptions['dateRangeMode']) || 'auto',
            color: dataset.optionsColor || '255, 135, 0',
            locale: dataset.optionsLocale || 'en-GB',
            showLegend: dataset.optionsShowLegend !== 'false',
            showYearLabels: dataset.optionsShowYearLabels !== 'false',
            showMonthLabels: dataset.optionsShowMonthLabels !== 'false',
            tooltipItemSingular: dataset.optionsTooltipItemSingular || 'change',
            tooltipItemPlural: dataset.optionsTooltipItemPlural || 'changes',
            legendLess: dataset.optionsLegendLess || 'Less',
            legendMore: dataset.optionsLegendMore || 'More',
            weekStartsOnMonday: !!+(dataset.optionsWeekStartsOnMonday || '0')
        };

        // Deprecated options: only forward them when explicitly configured so
        // the deprecation warning fires exactly for setups that still use them.
        if (dataset.optionsDuration !== undefined) options.duration = parseInt(dataset.optionsDuration);
        if (dataset.optionsMinCellSize !== undefined) options.minCellSize = parseInt(dataset.optionsMinCellSize);
        if (dataset.optionsMaxCellSize !== undefined) options.maxCellSize = parseInt(dataset.optionsMaxCellSize);
        if (dataset.optionsTooltipWidth !== undefined) options.tooltipWidth = parseInt(dataset.optionsTooltipWidth);
        if (dataset.optionsTooltipHeight !== undefined) options.tooltipHeight = parseInt(dataset.optionsTooltipHeight);

        return options;
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
