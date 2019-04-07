import { Component, Input, NgZone, OnChanges } from "@angular/core";

import { EOL } from 'os';
import { promises as fs } from 'fs';
import * as nodegit from 'nodegit';
import { logger } from 'logger';

import WorkingDirectory from 'model/repository/working-directory';
import { Router } from "node_modules/@angular/router";
import { IssueService } from "services/issues";


type ContentType = "added" | "removed" | "same";

interface LineInfo {
  text: string;
  type: ContentType;
}

async function unapply(contents: string[], diff: nodegit.ConvenientPatch): Promise<string[]> {
  let lineTranslate = 0;

  const hunks = await diff.hunks();
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

  return contents;
}

// Warning - this is a mess

@Component({
  selector: "app-diff-panel",
  templateUrl: "diff.component.html",
  styleUrls: ["diff.component.scss"]
})
export class DiffPanelComponent implements OnChanges {
  @Input() workingDirectory: WorkingDirectory;
  
  // If the chosen diff is staged, then prediff contains the unstaged diff for the same file (if it exists).
  // This may seem confusing: the prediff is chronologically after the diff,
  // but because we have to work from the file in the working directory, we work backwards, unapplying the preDiff and then the actual diff.
  @Input() preDiff?: nodegit.ConvenientPatch;
  @Input() diff: nodegit.ConvenientPatch;


  constructor(private ngZone: NgZone, private router: Router,private issueService: IssueService) {}
  /**
   * This function (called every time there are changes) updates the line changes.
   * It is a somewhat complex process but hopefully the comments explain it.
   *
   * Interesting note: this async function will only cause an update when typescript is compiled to pre-ES2017,
   *  as zone.js, the thing inspecting for when to update, won't recognise native async functions as asynchronous,
   *  and async functions only exist from ES2017
   */
  public async ngOnChanges() {
    if(!this.diff || !this.workingDirectory) {
      this.lines = [];
      return;
    }

    // This could probably be written better, but for now it does some things.
    // Im sorry.

    logger.verbose("Updating diff panel to " + this.diff.newFile().path() || this.diff.oldFile().path());
    // We want to display the entire file, so we're going to load it here
    // Keep in mind this is the new file. If the file is deleted, we cant (and dont need to) load it.
    let newFileLines: string[] = [];

    if(this.preDiff) {
      // If there is a prediff, unapply it to get the file the actual diff was used on
      const path = this.workingDirectory.getPath() + '/' + this.preDiff.newFile().path();
      newFileLines = await unapply(
        this.preDiff.isDeleted() ? [] : (await fs.readFile(path, "utf8")).split(/\r\n|\r|\n/g),
        this.preDiff
      );
    }
    else {
      const path = this.workingDirectory.getPath() + '/' + this.diff.newFile().path();
      newFileLines = this.diff.isDeleted() ? [] : (await fs.readFile(path, "utf8")).split(/\r\n|\r|\n/g);
    }

    if(newFileLines.length > 800) {
      logger.warn("We should not be showing full contents of files this large (" + newFileLines.length + " lines)");
    }

    // Line numbers start at 1
    let newFileEnd = 1;
    let oldFileEnd = 1;

    let contentLines: LineInfo[] = [];

    // Depending on whether the file is modified, deleted, or added, the default change assumption is different.
    let defaultType: ContentType = "same";
    if(this.diff.isAdded() || this.diff.isUntracked())
      defaultType = "added";
    else if(this.diff.isDeleted())
      defaultType = "removed";

    // Hunks are small bits of info that capture at least a section of changing lines (sometimes more)
    // This means a hunk will contain some links in both old and new, some lines that are old only, and some lines that are new only.
    // Note: There is no concept of 'partially modified' lines. They are either identical or separate.
    // Hunks only exist around changes, so the whole file might not be captured by hunks.
    const hunks = await this.diff.hunks();
    for(const hunk of hunks) {
      // Lines between previous hunk end and hunk start should be same
      // This assumption is not necessarily true in all cases, e.g. if the file is fully deleted there are no new lines.
      if(this.diff.isModified() &&
        (hunk.newStart() - newFileEnd !== hunk.oldStart() - oldFileEnd)) {
        throw new Error("Assumption error in hunks: line difference between previous hunk end and new hunk start: New "
          + newFileEnd + "-" + hunk.newStart() + " vs. " + oldFileEnd + "-" + hunk.oldStart());
      }

      // Add missing lines
      if(newFileEnd < hunk.newStart()) {
        contentLines = contentLines.concat( // Subtract 1 to get our actual file lines
          newFileLines.slice(newFileEnd - 1, hunk.newStart() - 1).map(text => ({text, type: defaultType}))
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

        contentLines.push({text: line.content(), type});
      });

      // Update ends
      newFileEnd = hunk.newStart() + hunk.newLines();
      oldFileEnd = hunk.oldStart() + hunk.oldLines();
    }

    // And go to past end of hunks
    contentLines = contentLines.concat( // Subtract 1 to get our actual file lines
      newFileLines.slice(newFileEnd - 1).map(text => ({text, type: defaultType}))
    );

    this.lines = contentLines;
  }

  /**
   * Adds the file to the index
   */
  async save() {
    this.workingDirectory.stage([
      this.diff.oldFile().path(),
      this.diff.newFile().path()]);
  }

  /**
   * Undoes every change this file represents,
   * then stages it (staging will at most undo a previous staging of the updates)
   */
  async discard() {
    if(this.preDiff !== null)
      logger.error("Cannot unapply staged diffs when there are unstaged diffs in the same file. Not implemented");

    const workDir = this.workingDirectory.getPath() + '/';
    const oldFile = workDir + this.diff.oldFile().path();
    const newFile = workDir + this.diff.newFile().path();

    logger.info("Discarding changes to " + newFile);

    if(this.diff.isAdded() || this.diff.isCopied()) {
      fs.unlink(newFile);
      return;
    }


    // Unapply diffs
    let contents = [];
    if(!this.diff.isDeleted())
      contents = await unapply((await fs.readFile(newFile, 'utf8')).split(EOL), this.diff);


    // delete new file if it exists, no longer need it
    if(oldFile !== newFile && !this.diff.isDeleted())
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
