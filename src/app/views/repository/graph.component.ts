import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, OnChanges } from "@angular/core";
import { Subscription, combineLatest } from 'rxjs';

import { logger } from 'logger';
import * as nodegit from 'nodegit';

import HistoryGraph, * as graph from 'model/graph';
import { Repository } from 'model/repository';
import { GraphGenerator } from 'model/commit-graph';

declare var ResizeObserver: any;

if(!ResizeObserver) {
  logger.error("Resize observer not available");
}

@Component({
  selector: "app-graph-panel",
  templateUrl: "graph.component.html",
  styleUrls: ["graph.component.scss"]
})
export class GraphPanelComponent implements OnInit, OnDestroy, OnChanges, graph.NodeTooltipCapturer {
  @Input() repository: Repository;

  public ngOnInit() {
    this.graph = new HistoryGraph("network", this.graphContainer.nativeElement.width, this.graphContainer.nativeElement.height, this);

    this.resizeObserver = new ResizeObserver(objects => this.onResize(objects[0]));
    this.resizeObserver.observe(this.graphContainer.nativeElement);
  }
  public ngOnChanges() {
    this.subscription.unsubscribe();

    if(this.repository) {
      this.graphGenerator = new GraphGenerator(this.repository);
      this.subscription =
        combineLatest(this.repository.branches, this.repository.history.commits)
        .subscribe(this.recalculateGraph.bind(this));
    }
  }
  public ngOnDestroy() {
    this.resizeObserver.disconnect();
    this.subscription.unsubscribe();
  }

  // Shows our custom tooltip component when user hovers over a commit
  public showTooltip(sha: string) {
    this.showingTooltip = true;
    this.repository.history.findCommit(sha).then(commit => {
      if(this.showingTooltip) // In case the user has stopped looking at the tooltip by the time this promise completes
        this.selectedCommit = commit;
    });
  }

  // Hides tooltip when user leaves a commit
  public hideTooltip(sha: string) {
    this.showingTooltip = false;
    this.selectedCommit = null;
  }

  private async recalculateGraph([branches, commits]: [nodegit.Reference[], nodegit.Commit[]]) {
    if(commits.length === 0)
      return;

    logger.info("Recalculating graph");

    // We have to do the weird thing with branches because it gets modified, and that messes up the repositories branch comparisons. :/
    const graphData = await this.graphGenerator.generate(branches, commits);
    this.graph.set(graphData);
  }

  private onResize(element) {
    this.graph.resize(element.contentRect.width, element.contentRect.height);
  }

  selectedCommit: nodegit.Commit;
  @ViewChild("graphContainer") graphContainer: ElementRef;

  private showingTooltip = false;

  private graph: HistoryGraph;
  private graphGenerator: GraphGenerator;

  private resizeObserver;
  private subscription = new Subscription();
}
