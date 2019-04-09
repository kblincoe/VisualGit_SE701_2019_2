import * as nodegit from 'nodegit';

import { Component, OnInit, OnDestroy, OnChanges, Input } from "@angular/core";
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: "app-graph-tooltip",
  templateUrl: "graph.tooltip.component.html",
  styleUrls: ["graph.tooltip.component.scss"]
})
export class GraphTooltipComponent implements OnInit, OnDestroy, OnChanges {
  @Input() commit: nodegit.Commit;

  public ngOnInit() {
  }
  public ngOnDestroy() {
  }

  public ngOnChanges() {
    if(!this.commit) {
      if(this.subscription !== null) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
      return;
    }

    this.subscription = fromEvent(document.body, 'mousemove').subscribe((evt: MouseEvent) => {
      this.x = evt.pageX + 10;
      this.y = evt.pageY + 10;
    });

    const message = this.commit.message();

    // Calculate title and body
    const splitPos = message.indexOf('\n');
    if(splitPos === -1) {
      this.title = message;
      this.body = "";
    }
    else {
      this.title = message.slice(0, splitPos);
      this.body = message.slice(splitPos)
        .replace('\n\n', '\n')
        .trimLeft().trimRight();
    }

    this.author = this.commit.author().name();
  }

  x: number;
  y: number;

  title: string;
  body: string;
  author: string;

  private subscription: Subscription = null;
}
