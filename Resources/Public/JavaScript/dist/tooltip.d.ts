/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/tooltip
 *
 * HTML overlay tooltip for heatmap cells.
 *
 * The tooltip is an absolutely positioned `<div>` inside the (relatively
 * positioned) container rather than an SVG element. This keeps its text at a
 * constant pixel size regardless of how the SVG is scaled by its viewBox — an
 * SVG tooltip would shrink to unreadable in small widgets and balloon in large
 * ones. Positioning is derived from `getBoundingClientRect()` so it is
 * independent of the current scale factor.
 */
export declare class HeatmapTooltip {
    private container;
    private el;
    private isVisible;
    constructor(container: HTMLElement);
    /**
     * Show the tooltip above `target`, centered horizontally and clamped to the
     * container bounds. Falls back to below the target when there is no room
     * above.
     */
    show(target: Element, content: string): void;
    hide(): void;
    isShowing(): boolean;
    destroy(): void;
}
//# sourceMappingURL=tooltip.d.ts.map