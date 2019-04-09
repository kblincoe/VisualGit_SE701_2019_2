import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RepositoryService } from 'services/repository';
import { Subscription } from 'rxjs';
import { logger } from 'logger';
import * as nodegit from 'nodegit';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Repository } from 'model/repository';
import Commit from 'model/repository/commit';

@Component({
  selector: 'app-header-tags',
  templateUrl: './tags.component.html',
  styleUrls: ["./tags.component.scss"]
})
export class TagsComponent implements OnInit {
  constructor(private modalService: NgbModal, private repositoryService: RepositoryService) {
    this.addTagForm = new FormGroup({
      tagName: new FormControl(null, [
        Validators.required
      ]),
      commitList: new FormControl(null, [
        Validators.required
      ])
    });
    this.removeTagForm = new FormGroup({
      commitList: new FormControl(null),
      tagName: new FormControl(null, [
        Validators.required
      ])
    });
  }

  open() {
    this.modalService.open(this.content);
    this.updateTagMap();
  }

  public ngOnInit() {
    this.subscription = this.repositoryService.repository.subscribe(repo => {
      if (repo === null) {
        logger.error("Should not be on the repo page if the repo is null");
      }
      else {
        this.repo = repo;
        this.repo.history.commits.subscribe(commits => {
          this.commits = [];
          for (const commit of commits) {
            this.commits.push(this.repo.getCommit(commit));
          }
          this.updateTagMap();
        });

        // Resets the 'tag name' field in the 'Remove Tag' tab when a new commit is set
        this.removeTagForm.get('commitList').valueChanges.subscribe(() => {
          this.removeTagForm.get('tagName').reset();
        })
      }
    });
  }

  public addTag() {
    const commit: Commit = this.addTagForm.get('commitList').value;
    commit.addTag(this.addTagForm.get('tagName').value, '').then(() => {
      this.updateTagMap();
      this.addTagForm.get('commitList').reset();
      this.addTagForm.get('tagName').reset();
    });

  }

  public removeTag() {
    const commit: Commit = this.removeTagForm.get('commitList').value;
    commit.removeTag(this.removeTagForm.get('tagName').value).then(() => {
      this.updateTagMap();
      this.removeTagForm.get('commitList').reset();
      this.removeTagForm.get('tagName').reset();
    });
  }

  /**
   * Updates map between a commit and its tags
   */
  private updateTagMap() {
    this.tagMap = new Map<Commit, string[]>();
    for (const commit of this.commits) {
      commit.getTags().then((tags) => {
        this.tagMap.set(commit, tags);
      });
    }
  }

  @ViewChild('content') content: ElementRef;

  private subscription = new Subscription();
  private addTagForm: FormGroup;
  private removeTagForm: FormGroup;
  private repo: Repository;
  private commits: Commit[];
  private tagMap: Map<Commit, string[]>;


}