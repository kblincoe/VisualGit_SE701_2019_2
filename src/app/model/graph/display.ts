import * as data from './data';

// Honestly, im just having a bit of fun with these names.

export interface NodePos {
  railing: number;
  segment: number;
  node: number;
}

// Some day we should use this instead of LayoutLine for the railing
export interface LineSegment {
  nodes: data.Node[]; // Contains only nodes within the parapet

  line: data.LayoutLine;
  // The first node from this line visible on the parapet
  lineStart: number;
  // One past the last element visible on the parapet
  lineEnd: number;
}

// A tag assigned to a line
export interface LineTag {
  description: string;

  // The index of the tag it is from
  index: number;
}

// A series of data.lines that are all on on the same horizontal in the graph
export interface Railing {
  segments: LineSegment[];

  // Tags displayed on the side of the railing
  tags: LineTag[];
}

interface Capital {
  node: data.Node;

  to: NodePos;
}

// Displays connections on either side
export interface Baluster {
  capitals: Capital[];
}

export interface ParapetView {
  start: number;
  end: number;

  leftBal: Baluster;
  rightBal: Baluster;
  railings: Railing[];

  // Internal edges from one line to another
  edges: {
    from: NodePos,
    to: NodePos
  }[];
}

/**
 * Handles constructing a view of the specific selection of data,
 * i.e. showing relevant sections left and right.
 */
export class ParapetConstructor {
  public constructor(lines: data.LayoutLine[], edges: data.ExternalEdge[]) {
    this.lines = lines;
    this.edges = edges;

    this.start = Math.min(...lines.map(line => line.nodes[0].order));
    this.end = Math.max(...lines.map(line => line.nodes[line.nodes.length - 1].order));
  }

  /**
   * Scope the view to between the given numbers
   */
  public scope(left: number, right: number): ParapetView {
    // This might have broken me

    const view: ParapetView = {
      start: left,
      end: right,
      railings: [],
      leftBal: { capitals: [] },
      rightBal: { capitals: [] },
      edges: []
    };

    // Collect all lines that are at least partially displayed
    const linePositions: {rail: number, index: number}[] = [];
    for(const line of this.lines) {
      if(line.nodes[line.nodes.length - 1].order < left || line.nodes[0].order > right) {
        linePositions.push({rail: -1, index: -1});
        continue;
      }

      // Choose the lowest possible rail that accomodates this line
      const { rail: railIndex, index: lineIndex } = this.findBestRailing(view.railings, line);

      const start = line.nodes.findIndex(node => node.order > left);
      let end = line.nodes.findIndex(node => node.order > right);
      if(end === -1)
        end = line.nodes.length;

      const segment: LineSegment = {
        line,
        lineStart: start,
        lineEnd: end,
        nodes: line.nodes.slice(start, end)
      };

      // Insert the line
      view.railings[railIndex].segments.splice(lineIndex, 0, segment);
      // Correct the indices for other line segments placed on this rail
      linePositions.filter(pos => pos.rail === railIndex && pos.index >= lineIndex).forEach(pos => pos.index++);
      // And add this line
      linePositions.push({rail: railIndex, index: lineIndex});
    }

    this.createEdges(view, linePositions);

    // Set the segment cutoff capitals for each railing
    view.railings.forEach((rail, index) => this.setCutoffCapitals(view, rail, index));

    return view;
  }



  // Static information
  public start: number; // Start of the entire graph
  public end: number; // End of the entire graph

  /**
   * Finds which railing to place the given line on
   */
  private findBestRailing(railings: Railing[], line: data.LayoutLine): {rail: number, index: number} {
    let railIndex = 0;
    for(const railing of railings) {
      if(railing.segments.length === 0)
        return {rail: railIndex, index: 0};

      let firstAbove = railing.segments.findIndex(their => their.line.start > line.end);
      if(firstAbove === -1)
        firstAbove = railing.segments.length;

      const upperLimit = firstAbove < railing.segments.length ? railing.segments[firstAbove].line.start : line.end + 1;
      const lowerLimit = firstAbove > 0 ? railing.segments[firstAbove - 1].line.end : 0;

      if(lowerLimit <= line.start && upperLimit >= line.end) {
        return {rail: railIndex, index: firstAbove > 1 ? firstAbove - 1 : 0};
      }

      railIndex++;
    }

    // If we reach the end, create a new railing and use that
    railings.push({segments: [], tags: []});
    return {rail: railIndex, index: 0};
  }

  /**
   * Creates all segment to segment and baluster to segment edges,
   * Given the position of every line on the parapet (with lines not on the parapet having values of -1)
   */
  private createEdges(view: ParapetView, linePositions: {rail: number, index: number}[]) {
    // Create the edges
    for(const edge of this.edges) {
      const { rail: fromRail, index: fromSegment } = linePositions[edge.fromLine];
      const { rail: toRail, index: toSegment } = linePositions[edge.toLine];

      if(fromRail === -1 && toRail === -1)
        continue;

      let fromPos: NodePos;
      let toPos: NodePos;
      if(fromRail !== -1) {
        const segment = view.railings[fromRail].segments[fromSegment];

        if(edge.fromNode >= segment.lineEnd)
          continue;

        if(edge.fromNode >= segment.lineStart)
          fromPos = { railing: fromRail, segment: fromSegment, node: edge.fromNode - segment.lineStart };
      }
      if(toRail !== -1) {
        const segment = view.railings[toRail].segments[toSegment];

        if(edge.toNode < segment.lineStart)
          continue;

        if(edge.toNode < segment.lineEnd)
          toPos = { railing: toRail, segment: toSegment, node: edge.toNode - segment.lineStart };
      }

      if(fromPos && toPos) {
        view.edges.push({from: fromPos, to: toPos});
      }
      else if(fromPos && !toPos) {
        view.rightBal.capitals.push({
          node: this.lines[edge.toLine].nodes[edge.toNode],
          to: fromPos
        });
      }
      else if(!fromPos && toPos) {
        view.leftBal.capitals.push({
          node: this.lines[edge.fromLine].nodes[edge.fromNode],
          to: toPos
        });
      }
    }

  }

  private setCutoffCapitals(view: ParapetView, rail: Railing, index: number) {
    // First segment's first visible node
    const firstSegment = rail.segments[0];
    if(firstSegment.lineStart > 0) {
      view.leftBal.capitals.push({
        node: firstSegment.line.nodes[firstSegment.lineStart - 1],
        to: { railing: index, segment: 0, node: 0 }
      });
    }

    // Last segment's last visible node
    const lastSegmentIndex = rail.segments.length - 1;
    const lastSegment = rail.segments[lastSegmentIndex];

    if(lastSegment.lineEnd < lastSegment.line.nodes.length) {
      view.rightBal.capitals.push({
        node: lastSegment.line.nodes[lastSegment.lineEnd],
        to: {railing: index, segment: lastSegmentIndex, node: lastSegment.nodes.length - 1 }
      });
    }
  }

  // Data
  private lines: data.LayoutLine[];
  private edges: data.ExternalEdge[];
}
