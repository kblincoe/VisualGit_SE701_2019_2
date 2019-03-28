import * as nodegit from 'nodegit';
import * as Octokit from '@octokit/rest';
import { GithubRepository } from './repositories';
import { logger } from 'logger';

const EMPTY_TREE_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

// An error thrown when an operation requires the repo to be clean
export class RepoNotCleanError extends Error {}

export class Repository {
  public constructor(github: GithubRepository, local: nodegit.Repository, creds: nodegit.Cred = nodegit.Cred.defaultNew()) {
    this.github = github;
    this.local = local;

    this.credentialOptions = { callbacks: {
      certificateCheck() { return 1; },
      credentials() { return creds; }
    }};
  }

  public async setup() {
    // Get the remote repo
    // The remote would be nice to use for more things, if we could figure out how to
    const remotes = await this.local.getRemotes();
    if(remotes.length === 0) {
      logger.warn("No remotes to choose from!");
    }
    else if(remotes.length > 1) {
      if('origin' in remotes) {
        this.remote = await this.local.getRemote('origin');
      }
      else {
        logger.warn("Could not find origin in remote list: " + remotes + ". Using " + remotes[0]);
        this.remote = await this.local.getRemote(remotes[0]);
      }
    }
    else {
      logger.info("Using remote " + remotes[0]);
      this.remote = await this.local.getRemote(remotes[0]);
    }
  }

  // Git Commands

  public async createBranch(branchName: string) {
    logger.info("Creating branch " + branchName);
    await this.local.createBranch(branchName, await this.local.getHeadCommit());
  }
  public async mergeCommit(commitFrom: string) {
    logger.info("Merging from " + commitFrom);
    // Taken from original :\
    const ref = await nodegit.AnnotatedCommit.lookup(
      this.local,
      await nodegit.Reference.nameToId(this.local, commitFrom)
    );

    const info = await nodegit.Merge.merge(this.local, ref, null, {
      checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE,
    });

    if((await this.local.index()).hasConflicts()) {
      logger.info("We have conflicts!");
      throw new RepoNotCleanError("Cannot merge: current index is not clean");
    }
  }
  public async mergeBranch(branchFrom: string) {
    logger.info("Merging from " + branchFrom);

    const from = await this.local.getBranch('refs/heads/' + branchFrom);
    const to = await this.local.getCurrentBranch();

    this.local.mergeBranches(to, from);

    if((await this.local.index()).hasConflicts()) {
      logger.info("We have conflicts!");
      throw new RepoNotCleanError("Cannot merge: current branch is not clean");
    }
  }
  public async pull(branchName?: string) {
    branchName = branchName || (await this.local.getCurrentBranch()).shorthand();
    logger.info(`Pulling from ${this.remote.name()}/${branchName} into ${branchName}`);

    await this.local.fetch(this.remote, this.credentialOptions);
    await this.local.mergeBranches(
      branchName,
      this.remote.name() + "/" + branchName,
      this.local.defaultSignature()
    );
  }
  public async push(branchName?: string) {
    branchName = branchName || (await this.local.getCurrentBranch()).name();
    logger.info("Pushing to " + branchName);
    await this.remote.push([`refs/heads/${branchName}:refs/heads/${branchName}`], this.credentialOptions);
  }
  public async rebase(branchFrom: string, branchTo: string) {
    logger.info(`Rebasing from ${branchFrom} to ${branchTo}`);
    const fromCommit = await nodegit.AnnotatedCommit.lookup(
      this.local,
      await nodegit.Reference.nameToId(this.local, 'refs/heads/' + branchFrom)
    );

    const toCommit = await nodegit.AnnotatedCommit.lookup(
      this.local,
      await nodegit.Reference.nameToId(this.local, 'refs/heads/' + branchTo)
    );

    const rebase = await nodegit.Rebase.init(this.local, fromCommit, toCommit, null);
    await rebase.next();
  }
  public async reset(commit: string) {
    // Taken from original :\
    const ref = await nodegit.AnnotatedCommit.lookup(
      this.local,
      await nodegit.Reference.nameToId(this.local, commit)
    );

    nodegit.Reset.fromAnnotated(this.local, ref, nodegit.Reset.TYPE.HARD, {});
  }
  public async revert(commit: string) {
    // Taken from original :\
    const ref = await nodegit.Commit.lookup(
      this.local,
      await nodegit.Reference.nameToId(this.local, commit)
    );

    await nodegit.Revert.revert(this.local, ref, ref.parents().length > 1 ? {mainline: 1} : {});
  }
  public async clean() {
    throw new Error("git clean is not implemented");
  }
  public async commit(message: string) {
    try {
      const headCommit = await this.local.getHeadCommit();

      const index = await this.local.index();
      const tree = await index.writeTree();

      console.log("Entries: ");
      console.log(index.entries());

      await this.local.createCommit(
        "HEAD",
        this.local.defaultSignature(),
        this.local.defaultSignature(),
        message,
        tree,
        [headCommit]
      );
      } catch(error) {
        logger.error("Error committing: ");
        logger.error(error);
      }
  }

  public async checkout(branchName: string) {
    // As far as I understand, master is always there
    const branches = await this.listBranches();
    if(branchName === 'master') {
      this.local.checkoutBranch(branchName);
    }
    else if(branches.includes('refs/heads/' + branchName)) {
      return this.local.checkoutBranch(branchName);
    }
    else if(branches.includes('refs/remotes/origin/' + branchName)) {
      return this.checkoutRemote(branchName);
    }
  }

  public listBranches() {
    return this.local.getReferenceNames(nodegit.Reference.TYPE.LISTALL);
  }

  /**
   * Gets the changes to the working directory, as compared to current head
   */
  public async listWorkingDiff(includeStaged = true) {
    let diff: nodegit.Diff;

    if(includeStaged) {
      const head = await this.local.getHeadCommit();
      const tree = await (head ? head.getTree() : nodegit.Tree.lookup(this.local, EMPTY_TREE_HASH));

      diff = await nodegit.Diff.treeToWorkdir(this.local, tree, {
        flags:
          nodegit.Diff.OPTION.INCLUDE_UNTRACKED
        + nodegit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
      });

      await diff.findSimilar({flags:
        nodegit.Diff.FIND.RENAMES
        + nodegit.Diff.FIND.COPIES
        + nodegit.Diff.FIND.COPIES_FROM_UNMODIFIED
        + nodegit.Diff.FIND.FOR_UNTRACKED
        + nodegit.Diff.FIND.REMOVE_UNMODIFIED
      });

      console.log(await diff.patches());
    } else {
      diff = await nodegit.Diff.indexToWorkdir(this.local, await this.local.index());
    }

    return await diff.patches();
  }

  public getImageUrl() {
  }
  public getName() {
    if(this.github) {
      return this.github.name;
    } else {
      // Get the last part of the filename. Maybe theres a better way?
      const workdir = this.local.workdir();
      const separator = workdir.includes('\\') ? '\\' : '/';

      return workdir.slice(
        workdir.lastIndexOf(separator, -1),
        workdir.endsWith(separator) ? workdir.length - 1 : workdir.length
      );
    }
  }

  private async checkoutRemote(branchName: string) {
    const headCommit = await this.local.getHeadCommit();
    const branch = await this.local.createBranch(branchName, headCommit);
    await this.local.checkoutBranch(branch);

    const correctCommmit = await this.local.getReferenceCommit("refs/remotes/origin/" + branchName);
    await nodegit.Reset.reset(this.local, correctCommmit, nodegit.Reset.TYPE.HARD, {});
  }

  public github: GithubRepository;
  public local: nodegit.Repository;
  public remote: nodegit.Remote;

  private credentialOptions;
}
