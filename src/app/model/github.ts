import * as Octokit from "@octokit/rest";
import { User } from "model/user";
import { Observable } from 'rxjs';

// Taken from https://developer.github.com/v3/repos/
// Contains the important parts of the repo (list) response message
export interface GithubRepositoryInfo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: any;
  private: boolean;

  url: string; // The URL for API access (https://api.github...)
  html_url: string; // The URL for user access (https://github.com...)
  clone_url: string;
  git_url: string;
}

/**
 * Finds information about the given github repository, using the access rights of the user if given.
 */
export async function findRepo(owner: string, name: string, user?: User): Promise<GithubRepositoryInfo> {
  const response = await ((user && user.github) || new Octokit()).repos.get({ owner, repo: name });

  return response.data;
}

export type Issue = Octokit.IssuesListForRepoResponseItem;
export type Assignee = Octokit.IssuesListAssigneesResponseItem;

export class GitHub {
  // Can construct with repository info or URL
  public constructor(user: User, repoInfo: GithubRepositoryInfo) {
    this.user = user;
    this.repoInfo = repoInfo;
  }

  async getIssueList(): Promise<Issue[]> {
    const result = await this.user.github.issues.listForRepo({owner: this.repoInfo.owner.login, repo: this.repoInfo.name, state: "open"});
    return result.data;
  }

  async sendCommentMessage(issueNum: number, message: string) {
    await this.user.github.issues.createComment({
      owner: this.repoInfo.owner.login,
      repo: this.repoInfo.name,
      number: issueNum,
      body: message
    });
  }

  async closeIssue(issueNum: number) {
    await this.user.github.issues.update({
      owner: this.repoInfo.owner.login,
      repo: this.repoInfo.name,
      number: issueNum,
      state: "closed"
    });
  }

  async createIssue(issueTitle: string, description: string) {
    await this.user.github.issues.create({
      owner: this.repoInfo.owner.login,
      repo: this.repoInfo.name,
      title: issueTitle,
      body: description
    });
  }

  async getAllAssignees(): Promise<Assignee[]> {
    let assignees: Assignee[];

    const result = await this.user.github.issues.listAssignees({
      owner: this.repoInfo.owner.login,
      repo: this.repoInfo.name
    });
    assignees = result.data;
    return assignees;
  }

  async getCurrentAssignees(issueNum: number): Promise<Assignee[]> {
    let assignees: Assignee[];

    const result = await this.user.github.issues.get({
      owner: this.repoInfo.owner.login,
      repo: this.repoInfo.name,
      number: issueNum
    });
    assignees = result.data.assignees;
    return assignees;
  }

  async addNewAssignees(issueNum: number, assigneeList: string[]) {
    await this.user.github.issues.addAssignees({
      owner: this.repoInfo.owner.login,
      repo: this.repoInfo.name,
      number: issueNum,
      assignees: assigneeList
    });

  }

  async removeAssignees(issueNum: number, assigneeList: string[]) {
    await this.user.github.issues.removeAssignees({
      owner: this.repoInfo.owner.login,
      repo: this.repoInfo.name,
      number: issueNum,
      assignees: assigneeList
    });
  }

  public issues: Observable<Issue[]>;

  private user: User;
  private repoInfo: GithubRepositoryInfo;
}
