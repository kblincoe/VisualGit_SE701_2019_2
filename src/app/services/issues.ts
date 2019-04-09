import { Injectable, OnDestroy } from "node_modules/@angular/core";
import { UserService } from "services/user";
import { RepositoryService } from "services/repository";
import { interval, Observable, Subject, Subscription } from "node_modules/rxjs";
import { IssuesListForRepoResponseItem } from "node_modules/@octokit/rest";
import { combineLatest } from "node_modules/rxjs/internal/observable/combineLatest";
import { flatMap } from "node_modules/rxjs/operators";
import { CloseGitHubIssue, createGitHubIssue, getGitHubIssueList, SendGitHubCommentMessage } from "model/issue";


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


  public selectedIssue: IssuesListForRepoResponseItem;
  public issues: Observable<IssuesListForRepoResponseItem[]>;
  private refresher = new Subject<void>();
  private subscription: Subscription;
  private REFRESH_RATE = 4000;


}
