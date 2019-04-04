import { promises as fs, Dirent } from 'fs';
import { logger } from 'logger';

import * as nodegit from 'nodegit';
import * as Octokit from '@octokit/rest';

import { User } from './user';
import { ProgressbarComponent } from "views/select/progressbar.component";


// Taken from https://developer.github.com/v3/repos/
// Contains the important parts of the repo (list) response message
export interface GithubRepository {
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
 * Gets a list of repositories that could be used
 */
export async function getOwnedGithubRepositories(user: User): Promise<GithubRepository[]> {
    const response = await user.github.repos.list();
    return (response.data as GithubRepository[]);
}

export async function findGithubRepo(gitUrl: string, user: User): Promise<GithubRepository> {
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

  }else {

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


export function clone(gitUrl: string, localPath: string, user?: User, SSH?: string,SetProgressBarValue?) {
  logger.info(`Cloning ${gitUrl} into ${localPath}`);
  // use ssh and public/private key credentials
  let sshPublicKeyPath = "C:/Users/User/.ssh/id_rsa.pub";
  let sshPrivateKeyPath = "C:/Users/User/.ssh//id_rsa";

  if(gitUrl.startsWith('git@')) {
    // check that SSH key is set
    if(SSH) {
      sshPublicKeyPath = SSH + "id_rsa.pub";
      sshPrivateKeyPath = SSH + "id_rsa";

      // set clone options to include ssh keys with cred callback
      const options = {
        fetchOpts: {
          callbacks: {
            certificateCheck: () => 0,
            transferProgress: (data) => {
                const recvObjects = data.receivedObjects();
                const percentage = Math.floor( recvObjects / data.totalObjects() * 100) ;
                if(percentage % 1 === 0) {
                    SetProgressBarValue(percentage);
                }
            },
            credentials(url, userName) {
              return nodegit.Cred.sshKeyNew(
                userName,
                sshPublicKeyPath,
                sshPrivateKeyPath,
                "");
            }
          }
        }
      };
      return nodegit.Clone.clone(gitUrl, localPath + '/', options);
    }else {

      throw new Error(`SSH key directory not set or invalid`);

    }
  }
  else
  {
    return nodegit.Clone.clone(gitUrl, localPath + '/', {
      fetchOpts: {
        callbacks: {
          certificateCheck: () => 1,
          credentials: () => user.gitCredentials,
          transferProgress: (data) => {
            const recvObjects = data.receivedObjects();
            const percentage = Math.floor( recvObjects / data.totalObjects() * 100) ;
            if(percentage % 1 === 0) {
                SetProgressBarValue(percentage);
          }
        }
      }
    });
  }
  return nodegit.Clone.clone(gitUrl, localPath + '/', {
    fetchOpts: {
      callbacks: {
        certificateCheck: () => 1,
        credentials: () => user.gitCredentials,
        transferProgress: (data) => {
          const recvObjects = data.receivedObjects();
          const percentage = Math.floor( recvObjects / data.totalObjects() * 100) ;
          if(percentage % 1 === 0) {
            SetProgressBarValue(percentage);
          }

        }
      },



    }
  });
}
