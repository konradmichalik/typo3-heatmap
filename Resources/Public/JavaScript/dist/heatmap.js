/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/heatmap
 * Version: 2.0.0 - TypeScript implementation
 *
 * Modular, configurable GitHub-style heatmap widget for TYPO3
 */
import { HeatmapRenderer } from './renderer.js';
/**
 * Main heatmap widget class
 */
class Heatmap {
    constructor() {
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        document.addEventListener('widgetContentRendered', (event) => {
            this.initializeWidget(event.target);
        });
    }
    initializeWidget(target) {
        const container = target.querySelector('#heatmap-container');
        if (!container)
            return;
        // Prevent duplicate initialization
        if (container.dataset.initialized === 'true')
            return;
        container.dataset.initialized = 'true';
        try {
            const data = JSON.parse(container.dataset.values || '[]');
            const options = this.parseOptions(container.dataset);
            // Tear down a previous renderer (and its ResizeObserver) if present.
            const previous = container._heatmapRenderer;
            previous?.destroy();
            // Clear any existing content
            container.innerHTML = '';
            // Store renderer instance for potential cleanup
            container._heatmapRenderer =
                new HeatmapRenderer(container, data, options);
        }
        catch (error) {
            console.error('Error initializing heatmap:', error);
            this.showError(container, 'Failed to load heatmap data');
            // Reset initialization flag on error
            container.dataset.initialized = 'false';
        }
    }
    parseOptions(dataset) {
        const options = {
            duration: parseInt(dataset.optionsDuration || '365'),
            dateRangeMode: dataset.optionsDateRangeMode || 'auto',
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
        if (dataset.optionsMinCellSize !== undefined)
            options.minCellSize = parseInt(dataset.optionsMinCellSize);
        if (dataset.optionsMaxCellSize !== undefined)
            options.maxCellSize = parseInt(dataset.optionsMaxCellSize);
        if (dataset.optionsTooltipWidth !== undefined)
            options.tooltipWidth = parseInt(dataset.optionsTooltipWidth);
        if (dataset.optionsTooltipHeight !== undefined)
            options.tooltipHeight = parseInt(dataset.optionsTooltipHeight);
        return options;
    }
    showError(container, message) {
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
