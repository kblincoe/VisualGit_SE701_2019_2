
export interface Node {
  id: string;
  order: number;

  styles?: string[] | string;
}

export interface Line {
  nodes: Node[];

  anonymous?: boolean; // Whether the line should be labeled with its tags or not
}

// This is not fully used yet
export interface Tag {
  nodeId: string;

  description: string;
}

export interface ExternalEdge {
  fromLine: number; // Can be supplied as line name or index
  fromNode: number; // Can be supplied as commit name or index
  toLine: number;
  toNode: number;
}

export interface Graph {
  lines: Line[];
  edges: ExternalEdge[];
  tags?: Tag[];
}

// A data.Line with some extra helpers, used internally
export interface LayoutLine {
  nodes: Node[];

  // Start and end of relevancy of the line
  start: number;
  end: number;

  tags: Tag[];

  // Relations from this line to another line
  from: { fromNode: number, toLine: number, toNode: number }[];
  // Relations from another line to this line
  to: { fromLine: number, fromNode: number, toNode: number }[];
}

/**
 * Converts lines and edges into a series of display.lines
 */
export function constructLayout(graph: Graph): LayoutLine[] {
  const layoutLines: LayoutLine[] = [];

  for(let index = 0; index < graph.lines.length; index++) {
    const line = graph.lines[index];

    // Edges from this line to elsewhere
    const fromEdges =
      graph.edges
      .filter(edge => edge.fromLine === index)
      .map(edge => ({fromNode: edge.fromNode, toLine: edge.toLine, toNode: edge.toNode}));

    // Edges to this line
    const toEdges =
      graph.edges
      .filter(edge => edge.toLine === index)
      .map(edge => ({fromLine: edge.fromLine, fromNode: edge.fromNode, toNode: edge.toNode}));


    // The first and last point this line is visible in, which could be from an edge from some other line to this one (or vice versa).
    const start = Math.min(
      line.nodes[0].order,
      ...toEdges.map(edge => graph.lines[edge.fromLine].nodes[edge.fromNode].order)
    );
    const end = Math.max(
      line.nodes[line.nodes.length - 1].order,
      ...fromEdges.map(edge => graph.lines[edge.toLine].nodes[edge.toNode].order)
    );

    const tags = graph.tags ? graph.tags.filter(tag => line.nodes.some(node => node.id === tag.nodeId)) : [];

    layoutLines.push({
      nodes: line.nodes,
      start,
      end,
      tags,
      from: fromEdges,
      to: toEdges
    });
  }

  return layoutLines;
}
