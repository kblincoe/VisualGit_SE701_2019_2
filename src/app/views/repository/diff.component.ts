import { Component, Input, OnChanges } from "@angular/core";

import { EOL } from 'os';
import { promises as fs, rename } from 'fs';
import * as nodegit from 'nodegit';
import { logger } from 'logger';

import { RepositoryService } from 'services/repository';
import { WorkingDirectoryService } from 'services/working.directory';

type ContentType = "added" | "removed" | "same";

interface LineInfo {
  text: string;
  type: ContentType;
}

@Component({
  selector: "app-diff-panel",
  templateUrl: "diff.component.html",
  styleUrls: ["diff.component.scss"]
})
export class DiffPanelComponent implements OnChanges {
  @Input() fileDiff: nodegit.ConvenientPatch;

  public constructor(
    private repositoryService: RepositoryService,
    private workingDirectoryService: WorkingDirectoryService
  ) {}

  /**
   * This function (called every time there are changes) updates the line changes.
   * It is a somewhat complex process but hopefully the comments explain it.
   *
   * Interesting note: this async function will only cause an update when typescript is compiled to pre-ES2017,
   *  as zone.js, the thing inspecting for when to update, won't recognise native async functions as asynchronous,
   *  and async functions only exist from ES2017
   */
  public async ngOnChanges() {
    if(this.fileDiff === null || this.repositoryService.getRepository() === null) {
      this.lines = [];
      return;
    }

    // This could probably be written better, but for now it does some things.

    logger.info("Updating diff panel to " + this.fileDiff.newFile().path() || this.fileDiff.oldFile().path());
    // We want to display the entire file, so we're going to load it here
    // Keep in mind this is the new file. If the file is deleted, we cant (and dont need to) load it.
    const path = this.repositoryService.getRepository().local.workdir() + '/' + this.fileDiff.newFile().path();
    const newFileLines = this.fileDiff.isDeleted() ? [] : (await fs.readFile(path, "utf8")).split(/(?<=\r\n|\r|\n)/g);

    if(newFileLines.length > 300) {
      logger.warn("We should not be showing full contents of files this large (" + newFileLines.length + " lines)");
    }

    let newFileEnd = 0;
    let oldFileEnd = 0;

    let contentLines: LineInfo[] = [];

    // Depending on whether the file is modified, deleted, or added, the default change assumption is different.
    let defaultType: ContentType = "same";
    if(this.fileDiff.isAdded())
      defaultType = "added";
    else if(this.fileDiff.isDeleted())
      defaultType = "removed";

    // Hunks are small bits of info that capture at least a section of changing lines (sometimes more)
    // This means a hunk will contain some links in both old and new, some lines that are old only, and some lines that are new only.
    // Note: There is no concept of 'partially modified' lines. They are either identical or separate.
    // Hunks only exist around changes, so the whole file might not be captured by hunks.
    const hunks = await this.fileDiff.hunks();
    for(const hunk of hunks) {
      // Lines between previous hunk end and hunk start should be same
      // This assumption is not necessarily true in all cases, e.g. if the file is fully deleted there are no new lines.
      if(this.fileDiff.isModified() &&
        (hunk.newStart() - newFileEnd !== hunk.oldStart() - oldFileEnd)) {
        throw new Error("Assumption error in hunks: line difference between previous hunk end and new hunk start: New "
          + newFileEnd + "-" + hunk.newStart() + " vs. " + oldFileEnd + "-" + hunk.oldStart());
      }

      // Add missing lines
      if(newFileEnd < hunk.newStart()) {
        contentLines = contentLines.concat(
          newFileLines.slice(newFileEnd, hunk.newStart()).map(text => ({text, type: defaultType}))
        );
      }

      const lines = await hunk.lines();
      lines.forEach(line => {
        // If this line was already processed
        if((line.newLineno() !== -1 && line.newLineno() < newFileEnd)
        || (line.oldLineno() !== -1) && line.oldLineno() < oldFileEnd)
          return;

        // Line that isnt in old or new
        if(line.newLineno() === -1 && line.oldLineno() === -1)
          throw new Error("Line here which doesn't exist in new or old file");
        // Don't know what numlines does, so am being defensive here
        if(line.numLines() > 1) {
          if(line.content().includes("No newline at end of file")) // Git diff occasionally likes to tell you this, we can ignore it.
            return;
          throw new Error("Failed assumption: A line contains more than one line :/ (" + line.numLines() + "): " + line.content());
        }
        // I think content offset means position within the line we are starting from (if the line is too long),
        // but not sure so leaving unimplemented.

        let type: ContentType;
        if(line.newLineno() === -1 && line.oldLineno() !== -1)
          type = "removed";
        else if(line.newLineno() !== -1 && line.oldLineno() === -1)
          type = "added";
        else
          type = defaultType;

        contentLines.push({text: line.content().trimRight(), type});
      });

      // Update ends
      newFileEnd = hunk.newStart() + hunk.newLines();
      oldFileEnd = hunk.oldStart() + hunk.oldLines();
    }

    // And go to past end of hunks
    contentLines = contentLines.concat(
      newFileLines.slice(newFileEnd).map(text => ({text, type: defaultType}))
    );

    this.lines = contentLines;
  }

  /**
   * Adds the file to the index
   */
  async save() {
    this.workingDirectoryService.stageFiles([
      this.fileDiff.oldFile().path(),
      this.fileDiff.newFile().path()]);
  }

  /**
   * Undoes every change this file represents,
   * then stages it (staging will at most undo a previous staging of the updates)
   */
  async discard() {
    const workDir = this.repositoryService.getRepository().local.workdir() + '/';
    const oldFile = workDir + this.fileDiff.oldFile().path();
    const newFile = workDir + this.fileDiff.newFile().path();

    logger.info("Discarding changes to " + newFile);

    if(this.fileDiff.isAdded() || this.fileDiff.isCopied()) {
      fs.unlink(newFile);
      return;
    }

    // Unapply diffs
    let lineTranslate = 0;
    const contents = this.fileDiff.isDeleted() ? [] : (await fs.readFile(newFile, 'utf8')).split(EOL);

    const hunks = await this.fileDiff.hunks();
    for(const hunk of hunks) {
      for(const line of await hunk.lines()) {
        // Remove every new line
        if(line.newLineno() !== -1 && line.oldLineno() === -1) {
          // Must translate the new line number to the old line number
          contents.splice(line.newLineno() - 1 + lineTranslate, 1);
          lineTranslate -= 1;
        }
        // Add every old line
        else if(line.oldLineno() !== -1 && line.newLineno() === -1) {
          // No translation needed: file up to this point should only be old lines
          contents.splice(line.oldLineno() - 1, 0, line.content().replace('\n', ''));
          lineTranslate += 1;
        }
      }
    }

    // delete new file if it exists, no longer need it
    if(oldFile !== newFile && !this.fileDiff.isDeleted())
      fs.unlink(newFile);
    // Overwrite/create old file
    fs.writeFile(oldFile, contents.join(EOL), {
      encoding: 'utf8',
      flag: 'w'
    });

    // Now stage changes
    await this.save();
  }

  lines: LineInfo[] = [];
}
