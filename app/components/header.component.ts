import { Component } from "@angular/core";
import { RepositoryService } from "../services/repository.service";
import { GraphService } from "../services/graph.service";

@Component({
  selector: "app-header",
  template: `
    <nav class="navbar navbar-inverse" role="navigation">
      <div class="container-fluid row">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a href="#"><img src="./assets/AddRepositoryFolder.svg" onclick="switchToAddRepositoryPanel()" class="add-repository-button" title="Add Repository"></a>
        </div>
        <div class="collapse navbar-collapse" id="navbar">
          <ul class="nav navbar-nav col-md-5 hidden-xs">
            <li><img src="./assets/RightArrow.svg" class="right-arrow"></li>
            <li class="repo-name dropdown-toggle">
                <a href="#" id="repo-name" data-toggle="modal" data-target="#repo-modal">repository</a>
            </li>
            <li><img src="./assets/RightArrow.svg" class="right-arrow"></li>
            <li class="branch-name dropdown">
              <a href="#" class="dropdown-toggle" id="branch-name" data-toggle="dropdown" onclick="switchToMainPanel()">
                branch<span class="caret"></span>
              </a>
              <ul class="dropdown-menu" id="branch-dropdown" role="menu" aria-labelledby="branch-name">
                <li role="presentation" id="create-branch">
                  <div class="input-group menuitem">
                    <input type="text" id="branchName" class="form-control" placeholder="Search or create branch">
                    <span class="input-group-btn">
                      <button class="btn btn-default" type="button" onclick="createBranch()">OK</button>
                    </span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>

          <ul class="navbar-nav col-md-4 hidden-xs">
            <li class="upload"><i aria-hidden="true" style="color:white" onclick="pushToRemote()" title="Push"><img src= "./assets/push.png"></i></li>
            <li class="download"><i aria-hidden="true" style="color:white" onclick="pullFromRemote()" title="Pull"><img src= "./assets/pull.png"></i></li>
            <li class="clone"><a href="#"><i class="fa fa-clone fa-2x col-md-2" aria-hidden="true" onclick="cloneFromRemote()" title="Clone"></i></a></li>
            <a href="#"><img src="./assets/Clean-Dark.svg" height="48" width="48" onclick="cleanRepo()" class="add-repository-button" title="Clean"></a>
            <a href=#><img src="./assets/refresh-button.png" height="48" width="48" onClick="requestLinkModal()" class="add-repository-button" title="sync"></a>
           
          </ul>

          <ul class="navbar-nav navbar-right hidden-xs">
            <li>
              <label id="githubname" style="color:white"></label>
              <a class="btn btn-default btn-outline btn-circle"  id="avatar" data-toggle="collapse" href="#nav-collapse1" aria-expanded="false" aria-controls="nav-collapse1" onclick="signInOrOut()">Sign in</a>
            </li>
          </ul>
          <div class="collapse nav navbar-nav nav-collapse" id="nav-collapse1">
            <form class="navbar-form navbar-right form-inline" role="form">
              <div class="form-group">
                <label class="sr-only" for="Email">User name</label>
                <input type="text" class="form-control" id="Email1" placeholder="Username or Email" autofocus required style="width: 206px !important"/>
              </div>
              <div class="form-group">
                <label class="sr-only" for="Password">Password</label>
                <input type="password" class="form-control" id="Password1" placeholder="Password" required />
              </div>
              <button type="submit" class="btn btn-success" (click)="switchToMainPanel()">Sign in</button>
            </form>
          </div>

          <ul class="nav navbar-nav visible-xs">
            <li (click)="promptUserToAddRepository()"><a>&nbsp;&nbsp;add repository</a></li>
            <li class="dropdown">
              <a id="repo-name" data-toggle="modal" data-target="#repo-modal" href="#">
                &nbsp;&nbsp;repository
                <span class="caret"></span>
              </a>
            </li>
            <li class="dropdown">
              <a id="branch-name" data-toggle="dropdown" href="#">
                &nbsp;&nbsp;branch
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" id="branch-dropdown" role="menu" aria-labelledby="branch-name">
                <li role="presentation" id="create-branch">
                  <div class="input-group menuitem">
                    <input type="text" id="branchName" class="form-control" placeholder="Search or create branch">
                    <span class="input-group-btn">
                      <button class="btn btn-default" type="button" onclick="createBranch()">OK</button>
                    </span>
                  </div>
                </li>
              </ul>
            </li>
            <li class="dropdown">
              <a id="merge-name" onclick="getOtherBranches()" data-toggle="dropdown" href="#">
                &nbsp;&nbsp;update from
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" id="merge-dropdown" role="menu" >
              </ul>
            </li>
            <li class="upload" onclick="pushToRemote()"><a href="#">&nbsp;&nbsp;pull</a></li>
            <li class="download"onclick="pullFromRemote()"><a href="#">&nbsp;&nbsp;push</a></li>
            <li class="clone"onclick="cloneFromRemote()"><a href="#">&nbsp;&nbsp;clone</a></li>
            <li class="clean" onclick="cleanRepo()"><a href="#">&nbsp;&nbsp;clean</a></li>
            <li class="sync" onclick="requestLinkModal()"><a href="#">&nbsp;&nbsp;sync</a></li>
          </ul>
        </div>
      </div>
    </nav>



    <div id="modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Info</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            unset
          </div>
          <div class="modal-footer">
			<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <div id="modalW" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            You have changes that have not been committed or pushed. If you exit or reload now you will lose progress.
          </div>
          <div class="modal-footer">
			<button type="button" class="btn btn-primary" data-dismiss="modal"  onclick="Reload()"  >Reload</button>
			<button type="button" class="btn btn-primary" data-dismiss="modal"  onclick="Close()"  >Exit</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>


	<div id="modalW2" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">

            You have changes that have not been committed or pushed. If you log out now you will lose progress.
          </div>
          <div class="modal-footer">
			<button type="button" class="btn btn-primary" data-dismiss="modal"  (click)="WarningSignIn()">OK</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

	<div id="modalW3" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            You have changes that have not been committed or pushed. If you Pull now you will lose progress.
          </div>
          <div class="modal-footer">
			<button type="button" class="btn btn-primary" data-dismiss="modal"  (click)="pullFromRemote()">OK</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>


    <div id="modalW2" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">

            You have changes that have not been committed or pushed. If you log out now you will lose progress.
          </div>
          <div class="modal-footer">
      <button type="button" class="btn btn-primary" data-dismiss="modal"  (click)="WarningSignIn()">OK</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div id="modalW3" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            You have changes that have not been committed or pushed. If you Pull now you will lose progress.
          </div>
          <div class="modal-footer">
      <button type="button" class="btn btn-primary" data-dismiss="modal"  (click)="pullFromRemote()">OK</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div id="repo-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <ul class="list-group"id="repo-dropdown" role="menu" aria-labelledby="repo-name">
          </ul>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary disabled" id="cloneButton" onclick="cloneRepo()">Clone</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div>

    <div id="fetch-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content" style=" width: 602px !important">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title">Info</h4>
            </div>
            <div class="modal-body" id="modal-text-box">
              Please provide the HTTP path to the original repository:
              <input type="text" id="origin-path" style=" width: 554px !important" placeholder="https://github.com/ORIGINAL_OWNER/ORIGINAL_OWNER_REPOSITORY.git">
            </div>
            <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal" onClick="fetchFromOrigin()">Confirm</button>  
          <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
          </div>
        </div>
    </div>
  `,
  providers: [RepositoryService, GraphService]
})

export class HeaderComponent   {
  repoName: string = "Repo name";
  repoBranch: string = "Repo branch";
  repository: any;

  promptUserToAddRepository(): void {
    switchToAddRepositoryPanel();
  }

  switchToMainPanel(): void {
    signInHead(collpaseSignPanel);
  }

  WarningSignIn(): void {
    redirectToHomePage();
  }

}
