import { IssuesListForRepoResponseItem } from "@octokit/rest";
import { User } from "model/user";
import { IssuesListLabelsOnIssueResponseItem } from "node_modules/@octokit/rest";


export async function  getGitHubIssueList(user: User, repoName: string): Promise<IssuesListForRepoResponseItem[]> {
  let issueArray: IssuesListForRepoResponseItem[];
  try {
    const github = user.github;
    const result = await github.issues.listForRepo({ owner: user.name, repo: repoName, state: "open"});
    issueArray = result.data;
    return issueArray;
  } catch (e) {
    throw new Error("Failed to get Issue List");
  }
}

export async function SendGitHubCommentMessage(user: User, repoName: string, issueNum: number, message: string) {
  try {
    await user.github.issues.createComment({
      owner: user.name,
      repo: repoName,
      number: issueNum,
      body: message
    });
  }catch (e) {
    throw new Error("Failed to send issue comment");
  }

}

export async function CloseGitHubIssue(user: User, repoName: string, issueNum: number) {
  try {
    await user.github.issues.update({
      owner: user.name,
      repo: repoName,
      number: issueNum,
      state: "closed"
    });
  }catch (e) {
    throw new Error("Failed to close the issue");
  }
}

export async function createGitHubIssue(user: User, repoName: string, issueTitle: string, description: string) {
  try {
    await user.github.issues.create({
      owner: user.name,
      repo: repoName,
      title: issueTitle,
      body: description
    });
  }catch (e) {
    throw new Error("Failed to create a new issue");
  }
}


export async function getGitHubIssueLabels(user: User, repoName: string, issueNum: number): Promise<IssuesListLabelsOnIssueResponseItem[]> {
  let labels: IssuesListLabelsOnIssueResponseItem[];
  try {
    const result = await user.github.issues.listLabelsOnIssue({
      owner: user.name,
      repo: repoName,
      number: issueNum});
    labels = result.data;
    return labels;
  }catch (e) {

  }
}

// A method to get all the labels from a repo(labeled and unlabeled)
export async function getAllAvailabeIssueLabels(user: User, repoName: string)
  : Promise<IssuesListLabelsOnIssueResponseItem[]> {
  let labels: IssuesListLabelsOnIssueResponseItem[];
  try {
    const result = await user.github.issues.listLabelsForRepo({
      owner: user.name,
      repo: repoName,
      });
    labels = result.data;
    return labels;
  }catch (e) {

  }
}


export async function addLabels(user: User, repoName: string, issueNum: number, labelArray: string[]) {
  let labels: IssuesListLabelsOnIssueResponseItem[];
  try {
    const result = await user.github.issues.addLabels({
      owner: user.name,
      repo: repoName,
      number: issueNum,
      labels: labelArray
    });
    labels = result.data;
    return labels;
  }catch (e) {

  }
}

export async function removeLabel(user: User, repoName: string, issueNum: number, label: string) {
  let labels: IssuesListLabelsOnIssueResponseItem[];
  try {
    const result = await user.github.issues.removeLabel({
      owner: user.name,
      repo: repoName,
      number: issueNum,
      name: label
    });
    labels = result.data;
    return labels;
  }catch (e) {

  }
}






