import { Injectable, OnDestroy } from "@angular/core";
import { interval, Observable, Subject, Subscription } from "rxjs";
import { combineLatest } from "rxjs/internal/observable/combineLatest";
import { flatMap } from "rxjs/operators";

import { IssuesListForRepoResponseItem } from "@octokit/rest";
import {
  addLabels,
  CloseGitHubIssue,
  createGitHubIssue,
  getAllAvailabeIssueLabels,
  getGitHubIssueLabels,
  getGitHubIssueList, removeLabel,
  SendGitHubCommentMessage
} from "model/issue";

import { UserService } from "services/user";
import { RepositoryService } from "services/repository";
import { IssuesListForRepoResponseItemLabelsItem } from "node_modules/@octokit/rest";
import { User } from "model/user";


@Injectable({providedIn: "root"})
export class IssueService implements OnDestroy{

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  constructor(private userService: UserService, private repositoryService: RepositoryService) {
    // Make our refresher update AT LEAST every REFRESH_RATE
    this.subscription =
      interval(this.REFRESH_RATE).subscribe(() => this.refresher.next());

    this.issues =
      combineLatest(this.userService.observeUser(), this.repositoryService.repository, this.refresher).pipe(
        flatMap(([user, repository, _]) =>
          getGitHubIssueList(user, repository.getName())));
    this.labels =
      combineLatest(this.userService.observeUser(), this.repositoryService.repository, this.refresher).pipe(
        flatMap(([user, repository, _]) => this.selectedIssue == null ? null :
              getGitHubIssueLabels(user, repository.getName(), this.selectedIssue.number)
          ));
    this.allLabels =
      combineLatest(this.userService.observeUser(), this.repositoryService.repository, this.refresher).pipe(
        flatMap(([user, repository, _]) => this.selectedIssue == null ? null :
          getAllAvailabeIssueLabels(user, repository.getName())
        ));
  }

  // Force the issue list to refresh
  public refresh() {
    this.refresher.next();
  }



  public async sendCommentMessage(message: string) {
    try {
      const repoName = this.repositoryService.current().getName();
      const issueNum = this.selectedIssue.number;
      await SendGitHubCommentMessage(this.userService.getUser(), repoName, issueNum, message);
    }catch (e) {
    }
  }

  public async closeIssue() {
    try {
      await CloseGitHubIssue(this.userService.getUser(), this.repositoryService.current().getName(), this.selectedIssue.number);
      this.refresh();
    }catch (e) {

    }
  }

  public async createIssue(issueTitle: string, description?: string) {
    try {
      await createGitHubIssue(this.userService.getUser(), this.repositoryService.current().getName(), issueTitle, description);
      this.refresh();
    }catch (e) {
    }
  }

  public async removeLabel(labelName: string) {
    try {
      await removeLabel(this.userService.getUser(), this.repositoryService.current().getName(), this.selectedIssue.number, labelName);
      this.refresh();
    }catch (e) {
    }
  }

  public async addLabel(labelName: string) {
    try {
      const label: string[] = new Array();
      label.push(labelName);
      await addLabels(this.userService.getUser(), this.repositoryService.current().getName(), this.selectedIssue.number, label);
      this.refresh();
    }catch (e) {
    }
  }

  public selectedIssue: IssuesListForRepoResponseItem;
  public issues: Observable<IssuesListForRepoResponseItem[]>;
  public labels: Observable<IssuesListForRepoResponseItemLabelsItem[]>;
  public allLabels: Observable<IssuesListForRepoResponseItemLabelsItem[]>;
  private refresher = new Subject<void>();
  private subscription: Subscription;
  private REFRESH_RATE = 4000;


}
