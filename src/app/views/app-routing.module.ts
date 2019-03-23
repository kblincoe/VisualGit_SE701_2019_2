import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/component';
import { SelectRepositoryComponent } from './select/component';
import { RepositoryComponent } from './repository/component';

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: 'full' },
  { path: "login", component: LoginComponent },
  { path: "select", component: SelectRepositoryComponent },
  { path: "repo", component: RepositoryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
