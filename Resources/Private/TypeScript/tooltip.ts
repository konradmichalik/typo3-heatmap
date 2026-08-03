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

export class HeatmapTooltip {
    private container: HTMLElement;
    private el: HTMLDivElement;
    private isVisible = false;

    constructor(container: HTMLElement) {
        this.container = container;
        this.el = document.createElement('div');
        this.el.className = 'heatmap-tooltip';
        Object.assign(this.el.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            display: 'none',
            pointerEvents: 'none',
            zIndex: '10',
            padding: '4px 8px',
            borderRadius: '3px',
            background: '#24292e',
            color: '#ffffff',
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            lineHeight: '1.3',
            whiteSpace: 'pre-line',
            textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        } as Partial<CSSStyleDeclaration>);
        this.container.appendChild(this.el);
    }

    /**
     * Show the tooltip above `target`, centered horizontally and clamped to the
     * container bounds. Falls back to below the target when there is no room
     * above.
     */
    public show(target: Element, content: string): void {
        this.el.textContent = content;
        this.el.style.display = 'block';
        this.isVisible = true;

        const containerRect = this.container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const cellLeft = targetRect.left - containerRect.left;
        const cellTop = targetRect.top - containerRect.top;

        const tooltipWidth = this.el.offsetWidth;
        const tooltipHeight = this.el.offsetHeight;
        const gap = 6;

        let left = cellLeft + targetRect.width / 2 - tooltipWidth / 2;
        left = Math.max(0, Math.min(left, containerRect.width - tooltipWidth));

        let top = cellTop - tooltipHeight - gap;
        if (top < 0) {
            // No room above — place below the cell instead.
            top = cellTop + targetRect.height + gap;
        }

        this.el.style.left = `${left}px`;
        this.el.style.top = `${top}px`;
    }

    public hide(): void {
        this.el.style.display = 'none';
        this.isVisible = false;
    }

    public isShowing(): boolean {
        return this.isVisible;
    }

    public destroy(): void {
        this.el.remove();
    }
}
