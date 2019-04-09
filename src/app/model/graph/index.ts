import Konva from 'konva';
import { logger } from 'logger';

import * as data from './data';
import * as display from './display';
import { ParapetRenderer } from './renderer';

export { data };

const RADIUS = 8; // Radius of a node
const GAP = RADIUS * 3;

export interface NodeTooltipCapturer {
  showTooltip(id: string): void;
  hideTooltip(id: string): void;
}

export default class HistoryGraph {
  public constructor(
    id: string,
    width: number,
    height: number,
    tooltipCapturer?: NodeTooltipCapturer) {
    this.stage = new Konva.Stage({
      container: id,
      width,
      height,
      draggable: true,
      dragBoundFunc: (pos) => {
        return {
            x : 0,
            y : 0
        };
      }
    });

    this.nodeLayer.on('mouseover', this.showTooltip.bind(this));
    this.nodeLayer.on('mouseout', this.hideTooltip.bind(this));

    this.stage.add(this.nodeLayer);

    // Note: Balusters and rails are not yet rendered.
    this.stage.add(this.railLayer);
    this.stage.add(this.balusterLayer);

    this.tooltipCapturer = tooltipCapturer;

    // Set up scaling
    this.stage.on("wheel", e => {
      this.scale *= 1.0 - e.evt.deltaY / 10000.0;

      this.layout();
    });
    this.stage.on("dragmove", e => {
      this.left -= e.evt.movementX;
      this.layout();
    });
  }

  public set(graph: data.Graph) {
    this.creator = new display.ParapetConstructor(data.constructLayout(graph), graph.edges);

    this.layout(true);
  }

  public resize(width: number, height: number) {
    this.stage.width(width);
    this.stage.height(height);

    this.render();
  }

  /**
   * Re-calculates the layout and renders it
   */
  private layout(scaleDown: boolean = false) {
    const viewWidth = this.creator.end - this.creator.start;
    const stageWidth = this.stage.width();

    const viewLeft = this.creator.start + ((this.left / stageWidth) * viewWidth);
    const viewRight = viewLeft + viewWidth / this.scale;

    const view = this.creator.scope(viewLeft - 0.05 * viewWidth, viewRight + 0.05 * viewWidth);

    const nodeCount = Math.max(...view.railings.map(railing => railing.segments.reduce((prev, segment) => segment.nodes.length, 0)));

    if(scaleDown && nodeCount > 400) {
      this.scale *= 1.2 * (nodeCount / 400);
      this.layout(true);
      return;
    }

    this.renderer = new ParapetRenderer(
      view,
      this.nodeLayer,
      this.railLayer,
      this.balusterLayer
    );

    this.render();
  }

  /**
   * Rendering rewrites to the stage only
   */
  private render() {
    if(this.renderer) {
      this.nodeLayer.destroyChildren();
      this.renderer.redraw();
      this.nodeLayer.draw();
    }
  }

  private showTooltip(evt) {
    if(this.tooltipCapturer && evt.target instanceof Konva.Circle)
      this.tooltipCapturer.showTooltip(((evt.target) as Konva.Circle).id());
  }
  private hideTooltip(evt) {
    if(this.tooltipCapturer && evt.target instanceof Konva.Circle)
      this.tooltipCapturer.hideTooltip(((evt.target) as Konva.Circle).id());
  }

  // Layout derivers
  private creator: display.ParapetConstructor;
  private renderer: ParapetRenderer;

  // Viewport parts
  private scale = 1.0;
  private left = 0;

  // Konva parts
  private nodeLayer = new Konva.Layer();
  private railLayer = new Konva.Layer();
  private balusterLayer = new Konva.Layer();

  private stage: Konva.Stage;

  // Interfaces
  private tooltipCapturer: NodeTooltipCapturer;
}
