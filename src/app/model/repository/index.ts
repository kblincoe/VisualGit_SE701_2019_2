import { Observable, combineLatest } from 'rxjs';
import { flatMap, distinctUntilChanged } from 'rxjs/operators';
import * as nodegit from 'nodegit';
import { logger } from 'logger';

import { User } from '../user';
import Core from './core';
import Head from './head';
import WorkingDirectory from './working-directory';
import RepoHistory from './history';
import Commit from './commit';

export class BranchNotFoundError extends Error {}

export class Repository {
  public static async create(local: nodegit.Repository, name: string, user?: User) {
    const core = new Core(local, user);
    await core.refresh(true);

    return new Repository(core, name);
  }
  public constructor(core: Core, name: string) {
    this.git = core;
    this.name = name;

    this.head = new Head(this.git);
    this.workingDirectory = new WorkingDirectory(this.git);
    this.history = new RepoHistory(this.git);

    this.branches =
      combineLatest(this.git.onChange.local, this.git.onChange.remote)
      .pipe(
        flatMap(this.findBranches.bind(this)),
        // Ensure that we don't needlessly update when value hasnt changed
        distinctUntilChanged<nodegit.Reference[]>((a, b) => {
          if(a.length !== b.length) {
            logger.info("Updating branches");
            return false;
          }

          const aSorted = a.sort((x, y) => x.name().localeCompare(y.name()));
          const bSorted = b.sort((x, y) => x.name().localeCompare(y.name()));
          for(let i = 0; i < a.length; ++i) {
            if(aSorted[i].name() !== bSorted[i].name()) {
              logger.info("Updating branches");
              return false;
            }
          }
          return true;
        })
      );
    this.commandRecord = this.git.commandRecord.asObservable();
  }
  public refresh() {
    this.git.refresh();
  }

  public async createBranch(name: string) {
    logger.info("Creating branch " + name);
    await this.git.repo.createBranch(name, await this.git.repo.getHeadCommit());

    this.git.commandRecord.next("git branch " + name);
    await this.git.refresh();
  }
  
  public async deleteBranch(name: string) {
    logger.info("Deleting branch " + name);
    const deleted = await nodegit.Branch.delete(await this.git.repo.getReference(name));

    if (deleted) {
      this.git.commandRecord.next("git branch -d " + name);
      await this.git.refresh();
    }
  }

  public async checkout(branch: string | nodegit.Reference) {
    const branches = await this.git.repo.getReferences(nodegit.Reference.TYPE.LISTALL);

    if(typeof branch === "string") {
      const actualBranch = branches.find(b => (b.name() === branch) || (b.shorthand() === branch));

      if(actualBranch === null)
        throw new BranchNotFoundError("Can't checkout branch " + branch);

      branch = actualBranch;
    }

    if(branch.isRemote()) {
      const headCommit = await this.git.repo.getHeadCommit();

      // Remove the remote name from the branch name
      let name = branch.shorthand();
      name = name.slice(name.indexOf('/') + 1);

      const localBranch = await this.git.repo.createBranch(name, headCommit);
      await this.git.repo.checkoutBranch(localBranch);

      const correctCommmit = await this.git.repo.getReferenceCommit(branch);
      await nodegit.Reset.reset(this.git.repo, correctCommmit, nodegit.Reset.TYPE.HARD, {});

      branch = localBranch;
    }
    else {
      return this.git.repo.checkoutBranch(branch);
    }

    this.git.commandRecord.next("git checkout " + branch.shorthand());
  }

  public getName() {
    return this.name;
  }

  public getHeadCommit(head: nodegit.Reference) {
    return this.git.repo.getReferenceCommit(head);
  }
  public getCommit(commit: nodegit.Commit) {
    return new Commit(this.git, commit);
  }

  public hasChanges() {
    return this.git.hasChanges();
  }

  public head: Head;
  public workingDirectory: WorkingDirectory;
  public history: RepoHistory;

  public branches: Observable<nodegit.Reference[]>;
  public commandRecord: Observable<string>;

  private async findBranches() {
    const refs = await this.git.repo.getReferences(nodegit.Reference.TYPE.LISTALL);

    const locals = refs.filter(ref => ref.isBranch());

    // Removes all remotes that are already local
    const remotes = refs.filter(ref =>
      ref.isRemote()
      && !locals.find(
        other => other.shorthand() === ref.shorthand().slice(ref.shorthand().indexOf('/' + 1))
      )
    );

    // Locals first (sorted), then remotes (also sorted)
    return [
      ...locals.sort((a, b) => a.shorthand().localeCompare(b.shorthand())),
      ...remotes.sort((a, b) => a.shorthand().localeCompare(b.shorthand()))
    ];
  }

  private git: Core;
  private name: string;
}
