import * as nodegit from 'nodegit';

import * as graph from './graph';
import { Repository } from './repository';

/**
 * This class takes converts a repository's commits into HistoryGraph data
 */
export class GraphGenerator {
  public constructor(private repo: Repository) {
  }

  /**
   * Produces a graph, where each line represents one branch, from the given heads and commits.
   * The master branch is guaranteed to be the first line, and to have as many commits as possible
   * (i.e. at no point will the master branch be derived from another branch).
   *
   * NOTE: Assumes that commits are ordered topologically and chronologically
   */
  async generate(heads: nodegit.Reference[], commits: nodegit.Commit[]): Promise<graph.data.Graph> {
    // Clear any previous data.
    this.lines = [];
    this.commitLoc.clear();
    this.extraEdges = [];
    this.tags = [];

    // Copy heads as we modify it
    heads = [...heads];

    // Put master at the front, then other locals, then remotes
    const masterIndex = heads.findIndex(head => head.shorthand() === "master");

    const master = heads.splice(masterIndex)[0];
    const locals = [master, ...heads.filter(head => head.isBranch())];
    const remotes = heads.filter(head => head.isRemote());

    for(const local of locals)
      await this.processBranch(local);

    for(const remote of remotes) {
      const localName = remote.shorthand().slice(remote.shorthand().indexOf('/') + 1);
      const local = locals.find(loc => loc.shorthand() === localName);
      let canUseLine;
      if(local)
        canUseLine = this.commitLoc.get((await this.repo.getHeadCommit(local)).sha()).line;

      await this.processBranch(remote, canUseLine);
    }

    // Now do every other commit that wasn't checked.
    for(const commit of commits) {
      if(!!this.commitLoc.get(commit.sha()))
        continue;

      const parents = await commit.getParents(null);

      if(parents.length === 0) {
        this.add(commit);
        continue;
      }

      const primaryParent = parents[0];
      const parentLoc = this.commitLoc.get(primaryParent.sha());

      if(!parentLoc)
        throw new Error("Error, given commits must be ordered to get parents before their children");

      if(this.lines[parentLoc.line].nodes.length === parentLoc.commit + 1)
        this.add(commit, parentLoc.line, parents.slice(1)); // Add to that line if we can
      else
        this.add(commit, undefined, parents);
    }

    // Now turn all extra edges into normalized edges
    const edges: graph.data.ExternalEdge[] = [];
    for(const edge of this.extraEdges) {
      const fromLoc = this.commitLoc.get(edge.from);
      const toLoc = this.commitLoc.get(edge.to);

      if(!fromLoc)
        throw new Error("Commit with sha " + edge.from + " not found");
      if(!toLoc)
        throw new Error("Commit with sha " + edge.to + " not found");

      edges.push({
        fromLine: fromLoc.line,
        fromNode: fromLoc.commit,
        toLine: toLoc.line,
        toNode: toLoc.commit
      });
    }

    // Finally, add branches as tags (NOTE: needs to be done)

    return {
      lines: this.lines,
      edges
    };
  }

  /**
   * Adds all nodes in the branch's (direct) ancestry into the graph, all on the same line.
   * If canUseLine is set, then reaching an ancestor that's the end of that line will add this
   * branch onto that line, rather than making a new one.
   */
  private async processBranch(head: nodegit.Reference, canUseLine?: number) {

    const headCommit = await this.repo.getHeadCommit(head);

    this.tags.push({
      nodeId: headCommit.sha(),
      description: head.shorthand()
    });

    if(!!this.commitLoc.get(headCommit.sha()))
      return;
    const commits = [headCommit];
    let root;
    let rootLoc;

    // Push every commit on the branch
    while(true) {
      const commit = commits[commits.length - 1];

      if(commit.parentcount() === 0)
        break;

      // We can't use commit.parent(0), as that actually doesnt setup the commit object correctly, so commit.parent(0).parent(0) will fail!!
      const parents = await commit.getParents(null);
      const primaryParent = parents[0];

      if(!!this.commitLoc.get(primaryParent.sha())) {
        root = primaryParent;
        rootLoc = this.commitLoc.get(primaryParent.sha());
        break;
      }

      commits.push(primaryParent);
    }

    // Use the line given to us if our ancestor is at the end of it
    let line: number;
    if(root && rootLoc.line === canUseLine && rootLoc.commit === this.lines[rootLoc.line].nodes.length - 1)
      line = rootLoc.line;
    else
      line = this.addLine();

    // Add all commits
    for(const commit of commits.reverse()) {
      await this.add(commit, line, undefined, (commit === headCommit) ? "head" : null);
    }
  }

  /**
   * Add a commit to a given line. If no line is given, creates a new line.
   * Adds parents that aren't directly above on the line as extra edges, calculating parents if none are provided.
   */
  private async add(commit: nodegit.Commit, line?: number, extraParents?: nodegit.Commit[], style?: string) {
    if(line === undefined)
      line = this.addLine();

    const styles = style ? [style] : [];

    // 2 parents means merge commit, which is not that interesting.
    if(commit.parentcount() === 2)
      styles.push("boring");

    this.lines[line].nodes.push({id: commit.sha(), order: commit.time(), styles});

    if(extraParents === undefined) {
      extraParents = await commit.getParents(null);
      // Assume that the parent above on the line is always the first parent.
      if(this.lines[line].nodes.length > 1)
        extraParents = extraParents.slice(1);
    }

    // Register the extra parents
    extraParents.forEach(parent => this.extraEdges.push({ from: parent.sha(), to: commit.sha() }));

    const location = {line, commit: this.lines[line].nodes.length - 1};
    this.commitLoc.set(commit.sha(), location);

    return location;
  }

  private addLine() {
    return this.lines.push({nodes: []}) - 1;
  }

  private lines: graph.data.Line[] = [];
  private commitLoc = new Map<string, {line: number, commit: number}>();

  private extraEdges: {from: string, to: string}[] = [];

  // Note: Tags not yet created by this class.
  private tags: graph.data.Tag[] = [];
}
