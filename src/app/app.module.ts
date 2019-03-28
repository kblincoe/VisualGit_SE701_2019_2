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
import { HeaderComponent } from './views/header/component';

@NgModule({
  declarations: [
    SelectRepositoryComponent,
    AppComponent,
    LoginComponent,
    RepositoryComponent,
    DiffPanelComponent,
    FilePanelComponent,
    FooterComponent,
    GraphPanelComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
