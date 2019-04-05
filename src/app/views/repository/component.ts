import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';

import * as nodegit from 'nodegit';

import { RepositoryService } from 'services/repository';
import WorkingDirectory from 'model/repository/working-directory';
import { logger } from 'logger';
import RepoHistory from 'model/repository/history';

@Component({
  selector: "app-repository-screen",
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class RepositoryComponent implements OnInit, OnDestroy {
  public constructor(
    private repositoryService: RepositoryService
  ) {}

  public ngOnInit() {
    this.subscription = this.repositoryService.repository.subscribe(repo => {
      if(repo === null) {
        logger.error("Should not be on the repo page if the repo is null");
      }
      else {
        this.workingDirectory = repo.workingDirectory;
        this.history = repo.history;
        this.selectedPatch = null;
        this.selectedPrePatch = null;
      }
    });
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  displayFile({patch, prePatch}: {patch: nodegit.ConvenientPatch, prePatch?: nodegit.ConvenientPatch}) {
    this.selectedPatch = patch;
    this.selectedPrePatch = prePatch;
  }

  workingDirectory: WorkingDirectory = null;
  history: RepoHistory = null;

  selectedPatch: nodegit.ConvenientPatch = null;
  selectedPrePatch: nodegit.ConvenientPatch = null;

  private subscription: Subscription = null;
}
