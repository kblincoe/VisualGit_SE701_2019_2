import * as nodegit from 'nodegit';
import { Observable, combineLatest } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { logger } from 'logger';

import Core from "./core";

export class RepoNotCleanError extends Error {}
export class RemoteNotSetError extends Error {}

/**
 * Stores information about the repo's head
 *
 * Note: Currently assumes head is a branch.
 */
export default class Head {
  public constructor(core: Core) {
    this.git = core;

    this.connected =
      this.git.onChange.head.pipe(
        flatMap(this.findRemote.bind(this)) // Has side effect of saving current remote
      );

    // Have to subscribe so that it actually starts trying to find remotes.
    this.connected.subscribe();

    this.commitDifference =
      combineLatest(this.git.onChange.head, this.git.onChange.remote).pipe(
        flatMap(this.calculateCommitDiff.bind(this))
      );

    this.name =
      this.git.onChange.head.pipe(
        map(() => this.git.head.shorthand())
      );
  }

  public async merge(from: nodegit.Reference) {
    logger.info("Merging from " + from.shorthand());

    if(this.git.repo.isMerging() || this.git.repo.isRebasing() || this.git.repo.isReverting())
      throw new RepoNotCleanError("Cannot merge: branch is not clean");

    await this.git.repo.mergeBranches(this.git.head, from);
    await this.refresh();

    return { hasConflicts: this.git.repo.isMerging() };
  }

  /**
   * Push the branch updates to the given remote, or its default upstream remote
   */
  public async push(remote?: string | nodegit.Remote) {
    const branch = this.git.head;

    let remoteBranch: nodegit.Reference;

    if(remote !== undefined) {
      if(typeof remote === "string")
        remote = await this.git.repo.getRemote(remote);

      remoteBranch = branch;
    }
    else {
      if(!this.remote)
        throw new RemoteNotSetError("Can't push to default remote, as there is no default remote for branch " + this.git.head.shorthand());

      remote = this.remote;
      remoteBranch = this.remoteBranch;
    }

    logger.info("PURRRRSRSRSRSRSRSRS");
    await remote.push([branch.name() + ":" + branch.name()], {
      callbacks: this.git.credentials
    });

    await this.refresh();
  }

  /**
   * Pull branch updates from its default
   */
  public async pull(remote?: string | nodegit.Remote) {
    const branch = this.git.head;
    let remoteBranch: nodegit.Reference;

    if(remote !== undefined) {
      if(typeof remote === "string")
        remote = await this.git.repo.getRemote(remote);

      remoteBranch = branch;
    }
    else {
      if(!this.remote) {
        throw new RemoteNotSetError(
          "Can't pull from default remote, as there is no default remote for branch "
          + this.git.head.shorthand()
        );
      }

      remote = this.remote;
      remoteBranch = this.remoteBranch;
    }

    logger.info("Using refspec of: " + branch.name() + ":" + remoteBranch.name());
    await remote.fetch(
      [branch.name() + ":" + remoteBranch.name()],
      { callbacks: this.git.credentials },
      "fetch"
    );

    await this.git.repo.mergeBranches(
      branch,
      remoteBranch,
      this.git.repo.defaultSignature()
    );
    this.git.commandRecord.next("git pull" + remote ? ` ${remoteBranch.shorthand()}` : "");

    this.refresh();

    return { hasConflicts: this.git.repo.isMerging() || this.git.repo.isRebasing() };
  }

  /**
   * Revert back to a given commit
   */
  public async revert(commit: string) {
    const headCommit = await nodegit.Commit.lookup(this.git.repo, commit);

    await nodegit.Revert.revert(this.git.repo, headCommit, headCommit.parents().length > 1 ? {mainline: 1} : {});
    this.git.commandRecord.next("git revert HEAD~1");

    this.refresh();
  }

  /**
   * Resets back to the given commit
   */
  public async reset(commitHash: string, type: "hard" | "soft" = "soft") {
    await nodegit.Reset.reset(
      this.git.repo,
      await nodegit.Commit.lookup(this.git.repo, commitHash),
      type === "hard" ? nodegit.Reset.TYPE.HARD : nodegit.Reset.TYPE.SOFT,
      {}
    );
    this.git.commandRecord.next("git reset" + type === "hard" ? " --HARD" : "");
  }

  public name: Observable<string>;
  public commitDifference: Observable<{ahead: number, behind: number}>;
  public connected: Observable<boolean>;

  private async refresh() {
    this.git.refresh();
  }

  /**
   * Calculates how many commits behind and ahead we are
   */
  private async calculateCommitDiff() {
    if(!this.remoteBranch)
      return;

    // The typescript for nodegit is fucked up again, it believes this just gives one number rather than two.
    const result: any = await nodegit.Graph.aheadBehind(this.git.repo, this.git.head.target(), this.remoteBranch.target());

    return result as { ahead: number, behind: number };
  }

  /**
   * Finds the default remote and remote branch for this branch
   */
  private async findRemote() {
    logger.info("Finding remote");
    try {
      this.remoteBranch = await nodegit.Branch.upstream(this.git.head);

      const remoteName = await ((nodegit.Branch as any).remoteName(this.git.repo, this.remoteBranch.name()) as string);
      this.remote = await this.git.repo.getRemote(remoteName);
    } catch(error) {
      if(error.errno === -3) { // Remote was not found, because the branch is not attached to a remote.
        logger.warn("No remote branch: " + error);
        this.remote = null;
        this.remoteBranch = null;
      }
      else
        throw error; // Rethrow
    }
  }

  private git: Core;

  private remote: nodegit.Remote;
  private remoteBranch: nodegit.Reference;
}
