import { Injectable, OnDestroy } from "@angular/core";
import { interval, Observable, Subscription, BehaviorSubject } from "rxjs";
import { combineLatest } from "rxjs/internal/observable/combineLatest";
import { flatMap, shareReplay, distinctUntilChanged } from "rxjs/operators";

import { GitHub, Issue, Assignee,  Label  } from "model/github";

import { RepositoryService } from "services/repository";
import { logger } from 'logger';
import { CurrencyIndex } from '@angular/common/src/i18n/locale_data';
import { IssuesListLabelsOnIssueResponseItem } from "node_modules/@octokit/rest";


@Injectable({ providedIn: "root" })
export class IssueService implements OnDestroy {
  constructor(private repositoryService: RepositoryService) {
    // Make our refresher update AT LEAST every REFRESH_RATE
    this.subscription.add(
      interval(this.REFRESH_RATE).subscribe(() => this.refresher.next())
    );
    this.subscription.add(
      this.repositoryService.github.subscribe(github => this.currentGithub = github)
    );

    this.issues =
      combineLatest(this.repositoryService.github, this.refresher)
      .pipe(
        flatMap(([github, _]) => github && github.getIssueList()),
        distinctUntilChanged(IssueService.areIssuesSame),
        shareReplay(1)
      );

    this.allAssignees =
      combineLatest(this.repositoryService.github, this.refresher).pipe(
        flatMap(([github, _]) => this.selectedIssue == null ? null :
          github && github.getAllAssignees()
        ),
        distinctUntilChanged(IssueService.areAssigneeSame),
        shareReplay(1)
      );

    this.currentAssignees =
      combineLatest(this.repositoryService.github, this.refresher).pipe(
        flatMap(([github, _]) => this.selectedIssue == null ? null :
          github && github.getCurrentAssignees(this.selectedIssue.number)
        ),
        distinctUntilChanged(IssueService.areAssigneeSame),
        shareReplay(1)
      );

    this.labels =
      combineLatest(this.repositoryService.github, this.refresher).pipe(
        flatMap(([github, _]) => this.selectedIssue == null ? null :
          github && github.getGitHubIssueLabels(this.selectedIssue.number)
        ),
        distinctUntilChanged(IssueService.areLabelSame),
        shareReplay(1)
      );
    this.allLabels =
      combineLatest(this.repositoryService.github, this.refresher).pipe(
        flatMap(([github, _]) => this.selectedIssue == null ? null :
          github && github.getAllAvailabeIssueLabels()
        ),
        distinctUntilChanged(IssueService.areLabelSame),
        shareReplay(1)
      );


  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  // Force the issue list to refresh
  public refresh() {
    this.refresher.next();
  }

  public async sendCommentMessage(message: string) {
    const issueNum = this.selectedIssue.number;
    await this.currentGithub.sendCommentMessage(issueNum, message);
  }

  public async closeIssue() {
    await this.currentGithub.closeIssue(this.selectedIssue.number);
    this.refresh();
  }

  public async createIssue(issueTitle: string, description?: string) {
    await this.currentGithub.createIssue(issueTitle, description);
    this.refresh();
  }

  public async removeLabel(labelName: string) {
    await this.currentGithub.removeLabel(this.selectedIssue.number, labelName);
    this.refresh();
  }

  public async addLabel(labelName: string) {
    const label: string[] = new Array();
    label.push(labelName);
    await this.currentGithub.addLabels(this.selectedIssue.number, label);
    this.refresh();

  }

  public async addAssigneesToIssue(assignees: string[]) {
    await this.currentGithub.addNewAssignees(this.selectedIssue.number, assignees);
    this.refresh();
  }

  public async removeAssigneesFromIssue(assignees: string[]) {
    await this.currentGithub.removeAssignees(this.selectedIssue.number, assignees);
    this.refresh();
  }


  public selectedIssue: Issue;
  public issues: Observable<Issue[]>;
  public allAssignees: Observable<Assignee[]>;
  public currentAssignees: Observable<Assignee[]>;
  public labels: Observable<Label[]>;
  public allLabels: Observable<Label[]>;
  public available: Observable<Label[]>;

  /**
   * Does a basic check for whether the current list is different from the previous one
   */
  private static areIssuesSame(prev: Issue[], cur: Issue[]) {
    if (prev.length !== cur.length) {
      logger.info("Updating issue list");
      return false;
    }

    for (let i = 0; i < prev.length; ++i) {
      if (prev[i].title !== cur[i].title || prev[i].updated_at !== cur[i].updated_at) {
        logger.info("Updating issue list");
        return false;
      }
    }

    return true;
  }

  private static areLabelSame(prev: Label[], cur: Label[]) {
    if(prev.length !== cur.length) {
      logger.info("Updating label list");
      return false;
    }

    for(let i = 0; i < prev.length; ++i) {
      if(prev[i].name !== cur[i].name || prev[i].id !== cur[i].id || prev[i].node_id !== cur[i].node_id ) {
        logger.info("Updating label list");
        return false;
      }
    }

    return true;
  }

  private static areAssigneeSame(prev: Assignee[], cur: Assignee[]) {
    if (prev.length !== cur.length) {
      logger.info("Updating assignee list");
      return false;
    }

    for (let i = 0; i < prev.length; i++) {
      if (prev[i].login !== cur[i].login || prev[i].id !== cur[i].id || prev[i].node_id !== cur[i].node_id) {
        logger.info("Updating assignee list");
        return false;
      }
    }

    return true;
  }

  private currentGithub: GitHub = null;
  private refresher = new BehaviorSubject<void>(null);
  private subscription = new Subscription();
  private REFRESH_RATE = 4000;
}

