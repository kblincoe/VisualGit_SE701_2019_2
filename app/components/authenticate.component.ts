import { Component } from "@angular/core";


@Component({
  selector: "user-auth",
  template: `
  <div class="authenticate" id="authenticate">
  <nav class="navbar navbar-inverse" role="navigation">
    <div class="container-fluid">
      <button class="btn btn-inverse dropdown-toggle btn-sm navbar-btn" id="color-scheme" data-toggle="dropdown">
        color
        <span class="caret"></span>
      </button>
      <ul class="dropdown-menu" id="color-dropdown" role="menu" aria-labelledby="branch-name">
        <li class="white" onclick="changeColor('white')">white</li>
        <li class="pink" onclick="changeColor('pink')">pink</li>
        <li class="blue" onclick="changeColor('blue')">blue</li>
        <li class="navy" onclick="changeColor('navy')">navy</li>
        <li class="green" onclick="changeColor('green')">green</li>
        <li class="default" onclick="changeColor('default')">default</li>
      </ul>
    </div>
  </nav>
  <form role="form" style="text-align:center; margin-top:100px">
    <label>
      <h1>VisualGit</h1>
    </label>
    <br><br>
    <div class="input-group" style="width:280px;">
      <input id="username" type="text" class="form-control" placeholder="Username or Email" aria-describedby="basic-addon1">
    </div>
    <br>

    <div class="input-group" style="width:280px;">
      <input id="password" type="password" class="form-control" placeholder="password" aria-describedby="basic-addon1">
      <br>    
    </div>
    <br>
    <input id="rememberLogin" type="checkbox"> Remember Login<br/> 
    
    <br>
    <div>
      <button type="submit" style="width:280px;" class="btn btn-success" (click)="switchToMainPanel()">Sign In</button>
      <br>
    </div>
    
    <br>
    <button type="submit" style="width:280px;" class="btn btn-primary" onclick="useSaved()">Load Saved Credentials</button>
    <br>
    <br>
            
    <button style="width:280px;" class="btn btn-link" (click)="openGitHubPasswordResetPage()">Forgot your password?</button>
    
    <br>

    <button style="width:280px;" class="btn btn-link" (click)="createNewAccount()">Create New Account?</button>

    <br>
    <button type="submit" style="width:280px;" class="btn btn-primary" onclick="switchToAddRepositoryPanel()">Continue without sign in</button>
  </form>
</div>
  `
})

export class AuthenticateComponent {
  switchToMainPanel(): void {
    signInPage(switchToAddRepositoryPanel);
  }

  createNewAccount(): void {
    window.open("https://github.com/join?", "_blank");
  }
  openGitHubPasswordResetPage(): void {
    window.open("https://github.com/password_reset", "_blank");
  }

}
