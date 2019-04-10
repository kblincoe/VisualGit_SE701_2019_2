import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable } from 'rxjs';
import { RepositoryService } from 'services/repository';
import { switchMap, scan, filter } from 'rxjs/operators';

@Component({
  selector: "app-footer",
  templateUrl: "component.html",
  styleUrls: ["component.scss"]
})
export class FooterComponent implements OnInit, OnDestroy {
  public constructor(
    private repositoryService: RepositoryService
  ) {}

  public ngOnInit() {
    this.commands =
      this.repositoryService.repository
      .pipe(
        filter(repo => !!repo),
        switchMap(repo => repo.commandRecord),
        scan((acc, val: string) => [val, ...acc].slice(-100), []) // Create an array, adding items to the front. Max 100.
      );
  }
  public ngOnDestroy() {
  }

  public commands: Observable<string[]>;
}
