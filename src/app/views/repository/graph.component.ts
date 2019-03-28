import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { Subscription } from 'rxjs';
import { Repository } from 'model/repository';

import * as nodegit from 'nodegit';
import * as vis from 'vis';

import { RepositoryService } from 'services/repository';
import { logger } from 'logger';

@Component({
  selector: "app-graph-panel",
  templateUrl: "graph.component.html",
  styleUrls: ["graph.component.scss"]
})
export class GraphPanelComponent implements OnInit, OnDestroy {
  public constructor(
    private repositoryService: RepositoryService
  ) {}

  public ngOnInit() {
    this.subscription = this.repositoryService.observeRepository().subscribe(this.recalculateGraph.bind(this));
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async recalculateGraph(repo: Repository) {
    if(repo === null)
      return;

    const nodes: vis.Node[] = [];
    const edges: vis.Edge[] = [];

    // Walk every commit
    repo.local.head();
    const walker = await nodegit.Revwalk.create(repo.local);
    walker.pushGlob("refs/heads/*");
    const commits: nodegit.Commit[] = await walker.getCommitsUntil(c => true);

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
