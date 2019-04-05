import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, OnChanges } from "@angular/core";
import { Subscription } from 'rxjs';

import * as nodegit from 'nodegit';
import * as vis from 'vis';

import RepoHistory from 'model/repository/history';
import { Repository } from 'model/repository';
import { RepositoryService } from 'services/repository';
import { logger } from 'logger';

@Component({
  selector: "app-graph-panel",
  templateUrl: "graph.component.html",
  styleUrls: ["graph.component.scss"]
})
export class GraphPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() history: RepoHistory;

  public ngOnInit() {
    if(this.history)
      this.subscription = this.history.commits.subscribe(this.recalculateGraph.bind(this));
  }
  public ngOnChanges() {
    if(this.history)
      this.subscription = this.history.commits.subscribe(this.recalculateGraph.bind(this));
  }
  public ngOnDestroy() {
    if(this.subscription)
      this.subscription.unsubscribe();
  }

  private async recalculateGraph(commits: nodegit.Commit[]) {
    logger.info("Recalculating graph");

    const nodes: vis.Node[] = [];
    const edges: vis.Edge[] = [];

    for(const commit of commits) {
      if(nodes.length > 100)
        break;
      // Create the node
      nodes.push({id: commit.sha(), label: commit.sha().substr(0, 4)});

      for(const parent of await commit.getParents(5)) {
        edges.push({
          from: parent.sha(),
          to: commit.sha()
        });
      }
    }

    this.network = new vis.Network(
      this.graphContainer.nativeElement,
      {nodes, edges},
      {layout: {
        heirarchical: {
          enabled: true
        }
      }});
  }

  @ViewChild("graphContainer") graphContainer: ElementRef;

  private network: vis.Network;
  private subscription: Subscription;
}
