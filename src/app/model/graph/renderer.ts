import { logger } from 'logger';
import Konva from 'konva';

import * as display from './display';
import * as data from './data';

// In place normalizes the given vector to the given length
function normalize(vec: {x: number, y: number}, length = 1) {
  const vecLength = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  vec.x *= length / vecLength;
  vec.y *= length / vecLength;
  return vec;
}

/**
 * Creates a function for positioning nodes such that they aren't too close but respect order
 */
class NodePositioner {
  public constructor(orders: number[], start: number, end: number) {
    // Make distinct and sorted
    orders = [...new Set(orders)].sort();

    orders.forEach((order, i) => {
      const orderBasedPosition = (order - start) / (end - start);
      const indexBasedPosition = (i + 1) / (orders.length + 1);

      const actualPosition = orderBasedPosition * 0.5 + indexBasedPosition * 0.5;

      this.positions.set(order, actualPosition);
    });

    const positions = [...this.positions.values()];
    const gaps = positions.slice(1).map((pos, i) => pos - positions[i]);

    this.minDist = Math.min(...gaps);
    this.maxDist = Math.max(...gaps);
  }

  public positionOf(order: number) {
    return this.positions.get(order);
  }

  public minDistance() {
    return this.minDist;
  }
  public maxDistance() {
    return this.maxDist;
  }

  private minDist: number;
  private maxDist: number;
  private positions = new Map<number, number>();
}

export class ParapetRenderer {

  public constructor(
    private view: display.ParapetView,
    private nodeLayer: Konva.Layer,
    private railLayer: Konva.Layer, // Is not yet used
    private balusterLayer: Konva.Layer // Not yet used
  ) {}

  public redraw() {
    logger.verbose("Rendering graph");

    this.width = this.nodeLayer.width();
    this.height = this.nodeLayer.height();

    this.positioner = new NodePositioner(
      // Collect every node's order into a single array
      this.view.railings.flatMap(railing => railing.segments.flatMap(segment => segment.nodes.map(node => node.order))),
      this.view.start,
      this.view.end
    );

    this.nodeRadius = Math.min(Math.max(
      Math.floor(this.positioner.minDistance() * this.width / 2.5),
      this.nodeLayer.height() / 50),
      this.nodeLayer.height() / 10
    );
    logger.debug("Node radius is " + this.nodeRadius);

    // Draw the rails
    let railIndex = 0;
    for(const railing of this.view.railings) {
      for(const segment of railing.segments) {
        if(segment.lineStart === segment.lineEnd)
          continue;

        this.drawNode(segment.nodes[0], railIndex);

        segment.nodes.slice(1).forEach((node, i) => {
          this.drawNode(node, railIndex);
          this.drawInlineEdge(segment.nodes[i], node);
        });
      }

      railIndex++;
    }

    // Draw the edges
    for(const edge of this.view.edges) {
      this.drawOutlineEdge(
        edge.from,
        edge.to
      );
    }

    // Render balusters and rails: (NOTE: not complete)

    // Instead, for now, we will just render those as edges to nothing
    const leftCapitals = this.view.leftBal.capitals.length;
    this.view.leftBal.capitals.forEach((edge, i) => {
      const node = this.view.railings[edge.to.railing].segments[edge.to.segment].nodes[edge.to.node];
      const nodePos = this.nodeLocs.get(node.id);

      if(!this.nodeLocs.has(edge.node.id)) {
        const y = ((i + 1) / (leftCapitals + 1)) * this.nodeLayer.height();
        this.nodeLocs.set(edge.node.id, {x: 0, y});
      }

      const fromLoc = this.nodeLocs.get(edge.node.id);

      this.nodeLayer.add(
        new Konva.Line({
          points: [fromLoc.x, fromLoc.y, nodePos.x - this.nodeRadius, nodePos.y],
          stroke: 'red'
        })
      );
    });

    const rightCapitals = this.view.rightBal.capitals.length;
    this.view.rightBal.capitals.forEach((edge, i) => {
      const node = this.view.railings[edge.to.railing].segments[edge.to.segment].nodes[edge.to.node];
      const nodePos = this.nodeLocs.get(node.id);

      if(!this.nodeLocs.has(edge.node.id)) {
        const y = ((i + 1) / (rightCapitals + 1)) * this.nodeLayer.height();
        this.nodeLocs.set(edge.node.id, {x: this.nodeLayer.width(), y});
      }
      const toLoc = this.nodeLocs.get(edge.node.id);

      this.nodeLayer.add(
        new Konva.Line({
          points: [toLoc.x, toLoc.y, nodePos.x + this.nodeRadius, nodePos.y],
          stroke: 'red'
        })
      );
    });
  }

  private drawNode(node: data.Node, rail: number) {
    const x = this.positioner.positionOf(node.order) * this.width;
    const y = this.getRailPos(rail);

    // Web colour for light blue. These styles are magic, and should
    // eventually be replaced by a styler interface (implemented by component displaying graph), that
    // we call with styles and any other info.
    let fill = '#ADD8E6';
    if(node.styles && node.styles.includes("head"))
      fill = 'green';
    else if(node.styles && node.styles.includes("boring"))
      fill = 'gray';

    this.nodeLayer.add(
      new Konva.Circle({x, y, radius: this.nodeRadius, fill, stroke: 'black', name: node.id, id: node.id})
    );
    this.nodeLocs.set(node.id, {x, y});
  }

  private drawInlineEdge(from: data.Node, to: data.Node) {
    const fromPos = this.nodeLocs.get(from.id);
    const toPos = this.nodeLocs.get(to.id);

    const xOff = this.nodeRadius;

    if(fromPos.x + xOff > toPos.x - xOff)
      return;

    this.nodeLayer.add(new Konva.Line({
      points: [fromPos.x + xOff, fromPos.y, toPos.x - xOff, toPos.y],
      stroke: 'black'
    }));
  }
  private drawOutlineEdge(from: display.NodePos, to: display.NodePos) {

    const fromNode = this.view.railings[from.railing].segments[from.segment].nodes[from.node];
    const toNode = this.view.railings[to.railing].segments[to.segment].nodes[to.node];

    const fromPos = this.nodeLocs.get(fromNode.id);
    const toPos = this.nodeLocs.get(toNode.id);

    const fromOffset = {x: 0, y: 0};
    const toOffset = {x: 0, y: 0};

    // If the node the edge is from is the final one in it's segment,
    // then we have the edge protrude as if it continues the segment (i.e. horizontally)
    if(from.node === this.view.railings[from.railing].segments[from.segment].nodes.length - 1)
      fromOffset.x = 1;
    else // Else just protrude in the correct direction to meet the other node.
      fromOffset.y = from.railing <= to.railing ? 1 : -1;

    // If the node the edge is going to is the first one in it's segment,
    // then we have the edge protrude as if it creates the segment (i.e. horizontally)
    if(to.node === 0)
      toOffset.x = -1;
    else // Else just protrude in the correct direction to meet the other node.
      toOffset.y = from.railing >= to.railing ? 1 : -1;

    // Normalize by nodeRadius
    normalize(fromOffset, this.nodeRadius);
    normalize(toOffset, this.nodeRadius);

    this.nodeLayer.add(new Konva.Line({
      points: [fromPos.x + fromOffset.x, fromPos.y + fromOffset.y, toPos.x + toOffset.x, toPos.y + toOffset.y],
      stroke: 'black'
    }));
  }

  // Vertical position of the rail
  public getRailPos(rail: number) {
    const gap = this.height / (this.view.railings.length + 1);
    return gap * (rail + 1);
  }

  private positioner: NodePositioner;

  private nodeRadius: number;
  private nodeLocs = new Map<string, Konva.Vector2d>();

  private width: number;
  private height: number;
}
