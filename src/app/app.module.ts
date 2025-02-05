import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './views/app-routing.module';
import { SelectRepositoryComponent } from './views/select/component';
import { AppComponent } from './views/app.component';
import { LoginComponent } from './views/login/component';
import { DiffPanelComponent } from './views/repository/diff.component';
import { FooterComponent } from './views/footer/component';
import { RepositoryComponent } from './views/repository/component';
import { FilePanelComponent } from './views/repository/file.component';
import { GraphPanelComponent } from './views/repository/graph.component';
import { GraphTooltipComponent } from 'views/repository/graph.tooltip.component';
import { HeaderComponent } from './views/header/component';
import { ProgressbarComponent } from "views/select/progressbar.component";
import { ErrorContentComponent } from './services/error.service';
import { TagsComponent } from 'views/header/tags.component';
import { IFrameComponent } from "views/issuePage/component";
import { NewIssueComponent } from "views/issuePage/createIssuePage/component";
import { CommentIssueComponent } from "views/issuePage/commentIssuePanel/component";
import { BranchComponent } from 'views/header/branch.component';
import { StashComponent } from 'views/header/stash.component';
import { TwoFactorContentComponent } from 'services/twofactorconfirm.service';
import { MergeComponent } from 'views/header/merge.component';
import { LabelComponent } from "views/issuePage/labelPanel/component";
import { DropdownComponent } from "views/issuePage/labelPanel/dropdown.component";

import { NotifierModule } from 'angular-notifier';
import {customNotifierOptions} from 'notification-config';
import { ConfirmContentComponent } from 'services/confirmation.service';
import { AssigneeIssueComponent } from 'views/issuePage/assigneePanel/assignee.component';
import { AssigneeManagementComponent } from 'views/issuePage/assigneeManagement/assigneeManagement.component';

@NgModule({
  declarations: [
    SelectRepositoryComponent,
    ProgressbarComponent,
    IFrameComponent,
    NewIssueComponent,
    CommentIssueComponent,
    LabelComponent,
    DropdownComponent,
    AppComponent,
    LoginComponent,
    RepositoryComponent,
    DiffPanelComponent,
    FilePanelComponent,
    GraphPanelComponent,
    GraphTooltipComponent,
    ErrorContentComponent,
    TwoFactorContentComponent,
    ConfirmContentComponent,
    TagsComponent,
    BranchComponent,
    MergeComponent,
    StashComponent,
    FooterComponent,
    HeaderComponent,
    AssigneeIssueComponent,
    AssigneeManagementComponent
  ],
  entryComponents: [ErrorContentComponent, ConfirmContentComponent, TwoFactorContentComponent, TagsComponent, BranchComponent, MergeComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NotifierModule.withConfig(customNotifierOptions),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
