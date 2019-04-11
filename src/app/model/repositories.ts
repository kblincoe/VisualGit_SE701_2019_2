import { promises as fs, Dirent } from 'fs';
import { logger } from 'logger';

import * as nodegit from 'nodegit';
import * as Octokit from '@octokit/rest';

import { User } from './user';
import { GithubRepositoryInfo } from './github';

/**
 * Gets a list of repositories that could be used
 */
export async function getOwnedGithubRepositories(user: User): Promise<GithubRepositoryInfo[]> {
    const response = await user.github.repos.list();
    return (response.data as GithubRepositoryInfo[]);
}

export async function findGithubRepo(gitUrl: string, user: User): Promise<GithubRepositoryInfo> {
  // Fetching should be done with user (if present) so we have user's permissions
  if(gitUrl.endsWith('.git'))
    gitUrl = gitUrl.substring(0, gitUrl.length - 4);

  let sections = [""];
  let owner = "";
  let repo = "";
  // split contents of URL depending on ssh or https
  if(gitUrl.startsWith('git@')) {
    // remove semicolons in ssh
    gitUrl = gitUrl.split(":")[1];
    sections = gitUrl.split('/');
    owner = sections[sections.length - 2];
    repo = sections[sections.length - 1];

  } else {
    sections = gitUrl.split('/');
    owner = sections[sections.length - 2];
    repo = sections[sections.length - 1];
  }
  if(!owner || !repo)
    throw new Error("URL not valid");

  logger.info(`Getting github repository ${owner}/${repo}`);
  const response = await ((user && user.github) || new Octokit()).repos.get({owner, repo});

  return response.data;
}

/**
 * Recursively searches for git repos, starting at the given path.
 */
export async function getLocalRepositories(path: string | Dirent): Promise<nodegit.Repository[]> {
  logger.info(`Searching for repositories in ${path}`);

  // Can only work on directories
  if(path instanceof Dirent ?
      !path.isDirectory() :
      !(await fs.stat(path)).isDirectory()) {
    throw new Error(`Path ${path} is not a directory, can't get local repositories.`);
  }

  // A bug in the current node types means fs.promises.readdir does not use withFileTypes,
  // and we cannot update node types further than electron, or electron will complain.
  const children = await ((fs as any).readdir(path, {withFileTypes: true}) as Promise<Dirent[]>);

  if(children.some(child => child.isDirectory() && child.name.endsWith('.git'))) {
    return [
      await nodegit.Repository.open(path instanceof Dirent ? path.name : path)
    ];
  }

  const childRepos = [];
  for(const child of children)
    childRepos.push(await getLocalRepositories(child));

  return childRepos;
}


export function clone(gitUrl: string, localPath: string, user?: User, progressUpdater?: (percent: number) => void) {
  logger.info(`Cloning ${gitUrl} into ${localPath}`);

  let credentials;
  if(user) {
    credentials = user.gitCredentials;
  }
  else {
    credentials = {
      certificateCheck: () => 0,
      credentials: () => {
        logger.warn("Repository asked for credentials, but we have none");
        // Not sure how to give an error to nodegit, something like this: https://libgit2.org/docs/guides/authentication/
        return nodegit.Error.CODE.EUSER;
      }
    };
  }

  return nodegit.Clone.clone(gitUrl, localPath + '/', {
    fetchOpts: {
      callbacks: {
        ...credentials,
        transferProgress: (data: nodegit.TransferProgress) => {
          const percentage = (data.receivedObjects / data.totalObjects) * 100;
          progressUpdater(percentage);
        }
      }
    }
  });
}
