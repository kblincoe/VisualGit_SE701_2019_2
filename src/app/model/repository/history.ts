import * as nodegit from 'nodegit';
import { Observable, combineLatest } from 'rxjs';
import { flatMap, distinctUntilChanged } from 'rxjs/operators';

import Core from "./core";
import { logger } from 'logger';


export default class RepoHistory {
  public constructor(core: Core) {
    this.git = core;

    this.commits =
      combineLatest(this.git.onChange.local, this.git.onChange.remote)
      .pipe(
        flatMap(this.getAllCommits.bind(this)),
        distinctUntilChanged(RepoHistory.compareHistory)
      );
  }

  public findCommit(sha: string) {
    return nodegit.Commit.lookup(this.git.repo, sha);
  }

  public async getBranchHistory(branch: nodegit.Reference) {
    const walker = await nodegit.Revwalk.create(this.git.repo);
    walker.pushRef(branch.name());

    return walker.getCommitsUntil(c => true) as Promise<nodegit.Commit[]>;
  }

  public commits: Observable<nodegit.Commit[]>;

  public async getAllCommits(reverse = false) {
    const walker = await nodegit.Revwalk.create(this.git.repo);
    walker.sorting(nodegit.Revwalk.SORT.TIME + nodegit.Revwalk.SORT.TOPOLOGICAL + (reverse ? nodegit.Revwalk.SORT.REVERSE : 0));

    walker.pushGlob("refs/heads/*");

    return walker.getCommitsUntil(c => true) as Promise<nodegit.Commit[]>;
  }
  private static compareHistory(before: nodegit.Commit[], now: nodegit.Commit[]) {
    if(before.length !== now.length) {
      logger.info("Repo history changed");
      return false;
    }

    for(let i = 0; i < before.length; i++) {
      if(before[i].id().cmp(now[i].id()) !== 0) {
        logger.info("Repo history changed");
        return false;
      }
    }

    return true;
  }

  private git: Core;
}
