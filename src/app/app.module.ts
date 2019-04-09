import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './views/app-routing.module';

import { SelectRepositoryComponent } from './views/select/component';

import { AppComponent } from './views/app.component';
import { LoginComponent } from './views/login/component';
import { DiffPanelComponent } from './views/repository/diff.component';
import { FooterComponent } from './views/footer/component';
import { RepositoryComponent } from './views/repository/component';
import { FilePanelComponent } from './views/repository/file.component';
import { GraphPanelComponent } from './views/repository/graph.component';
import { HeaderComponent } from './views/header/component';
import { ProgressbarComponent } from "views/select/progressbar.component";
import { ErrorContentComponent } from './services/error.service';
import { TagsComponent } from 'views/header/tags.component';
import { IFrameComponent } from "views/issuePage/component";
import { NewIssueComponent } from "views/issuePage/createIssuePage/component";
import { CommentIssueComponent } from "views/issuePage/commentIssuePanel/component";

@NgModule({
  declarations: [
    SelectRepositoryComponent,
    ProgressbarComponent,
    IFrameComponent,
    NewIssueComponent,
    CommentIssueComponent,
    AppComponent,
    LoginComponent,
    RepositoryComponent,
    DiffPanelComponent,
    FilePanelComponent,
    FooterComponent,
    GraphPanelComponent,
    HeaderComponent,
    ErrorContentComponent,
    TagsComponent
  ],
  entryComponents: [ErrorContentComponent, TagsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
