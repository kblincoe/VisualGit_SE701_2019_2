import { Observable, combineLatest } from 'rxjs';
import { flatMap, map, share } from 'rxjs/operators';
import * as nodegit from 'nodegit';
import { logger } from 'logger';

import Core from './core';

const EMPTY_TREE_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

// Used for nodegit.diff.*
const DIFF_OPTIONS = {
  flags:
    nodegit.Diff.OPTION.INCLUDE_UNTRACKED
  + nodegit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
  + nodegit.Diff.OPTION.INCLUDE_UNMODIFIED
};

// Used for diff.findSimilar
const DIFF_FIND_OPTIONS = {
  flags:
    nodegit.Diff.FIND.ALL
  + nodegit.Diff.FIND.REMOVE_UNMODIFIED
};

export default class WorkingDirectory {
  public constructor(core: Core) {
    this.git = core;

    this.stagedChanges =
      combineLatest(this.git.onChange.index, this.git.onChange.tip)
      .pipe(
        flatMap(this.getStagedDiff.bind(this)),
        flatMap(WorkingDirectory.calculatePatches),
        map(changes => changes.sort((a, b) => // Sort by name
          a.newFile().path().localeCompare(b.newFile().path()) || a.oldFile().path().localeCompare(b.oldFile().path())
        )),
        share()
      );

    this.unstagedChanges =
      this.git.onChange.workingDirectory
      .pipe(
        flatMap(this.getUnstagedDiff.bind(this)),
        flatMap(WorkingDirectory.calculatePatches),
        map(changes => changes.sort((a, b) => // Sort by name
          a.newFile().path().localeCompare(b.newFile().path()) || a.oldFile().path().localeCompare(b.oldFile().path())
        )),
        share()
      );
  }

  /**
   * Removes all local changes
   */
  public async clean() {
    nodegit.Reset.reset(this.git.repo, this.git.commit, nodegit.Reset.TYPE.HARD, {});
    // Could also remove unstaged changes, though not necessary.
  }

  /**
   * Commits staged changes to current head
   */
  public async commit(message: string) {
    logger.info("Committing to repository");
    try {
      const headCommit = await this.git.repo.getHeadCommit();

      const index = await this.git.index;
      const tree = await index.writeTree();

      await this.git.repo.createCommit(
        "HEAD",
        this.git.repo.defaultSignature(),
        this.git.repo.defaultSignature(),
        message,
        tree,
        [headCommit]
      );

      await this.git.refresh();
    } catch(error) {
      logger.error("Error committing: ");
      logger.error(error);
    }
  }

  public async stage(paths: string[]) {
    logger.verbose("Staging " + paths);

    const index = this.git.index;
    await index.addAll(paths);
    await index.write();

    this.git.commandRecord.next("git add " + paths.join(" "));

    await this.refresh();
  }
  public async unstage(paths: string[]) {
    logger.verbose("Unstaging " + paths);

    await nodegit.Reset.default(
      this.git.repo,
      this.git.commit,
      paths
    );
    await this.git.index.write();

    this.git.commandRecord.next("git reset HEAD " + paths.join(" "));

    await this.refresh();
  }

  public getPath() {
    return this.git.repo.workdir();
  }

  public stagedChanges: Observable<nodegit.ConvenientPatch[]>;
  public unstagedChanges: Observable<nodegit.ConvenientPatch[]>;

  private async refresh() {
    // Ideally the refresh would just update the working directory
    this.git.refresh();
  }

  private async getUnstagedDiff() {
    const a = await nodegit.Diff.indexToWorkdir(this.git.repo, this.git.index, DIFF_OPTIONS);
    return a;
  }

  private async getStagedDiff() {
    // The tree describes the head commit's state
    let tree;
    if(this.git.commit)
      tree = await this.git.commit.getTree();
    else
      tree = await nodegit.Tree.lookup(this.git.repo, EMPTY_TREE_HASH);

    return await nodegit.Diff.treeToIndex(this.git.repo, tree, this.git.index, DIFF_OPTIONS);
  }

  /**
   * Gets the changes to the working directory, as compared to current head
   */
  private static async calculatePatches(diff: nodegit.Diff) {
    await diff.findSimilar(DIFF_FIND_OPTIONS);
    const patches = await diff.patches();

    return patches.filter(patch => !patch.isUnmodified());
  }

  private git: Core;
}
