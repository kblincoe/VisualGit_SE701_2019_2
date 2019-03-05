"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AuthenticateComponent = (function () {
    function AuthenticateComponent() {
    }
    AuthenticateComponent.prototype.switchToMainPanel = function () {
        signInPage(switchToAddRepositoryPanel);
    };
    AuthenticateComponent.prototype.createNewAccount = function () {
        window.open("https://github.com/join?", "_blank");
    };
    AuthenticateComponent = __decorate([
        core_1.Component({
            selector: "user-auth",
            template: "\n  <div class=\"authenticate\" id=\"authenticate\">\n  <nav class=\"navbar navbar-inverse\" role=\"navigation\">\n  </nav>\n  <form role=\"form\" style=\"text-align:center; margin-top:100px\">\n    <label>\n      <h1>VisualGit</h1>\n    </label>\n    <br><br>\n    <div class=\"input-group\" style=\"width:280px;\">\n      <input id=\"username\" type=\"text\" class=\"form-control\" placeholder=\"username\" aria-describedby=\"basic-addon1\">\n    </div>\n    <br>\n\n    <div class=\"input-group\" style=\"width:280px;\">\n      <input id=\"password\" type=\"password\" class=\"form-control\" placeholder=\"password\" aria-describedby=\"basic-addon1\">\n      <br>    \n    </div>\n    <br>\n    <input id=\"rememberLogin\" type=\"checkbox\"> Remember Login<br/> \n    \n    <br>\n    <div>\n      <button type=\"submit\" style=\"width:280px;\" class=\"btn btn-success\" (click)=\"switchToMainPanel()\">Sign In</button>\n      <br>\n      \n    </div>\n    \n    <br>\n    <button type=\"submit\" style=\"width:280px;\" class=\"btn btn-primary\" onclick=\"useSaved()\">Load Saved Credentials</button>\n    <br>\n    <br>\n            \n    <button style=\"width:280px;\" class=\"btn btn-link\" (click)=\"openGitHubPasswordResetPage()\">Forgot your password?</button>\n    \n    <br>\n  \n\n    <button style=\"width:280px;\" class=\"btn btn-link\" (click)=\"createNewAccount()\">Create New Account?</button>\n\n   <br>\n    <button type=\"submit\" style=\"width:280px;\" class=\"btn btn-primary\" onclick=\"switchToAddRepositoryPanel()\">Continue without sign in</button>\n  </form>\n</div>\n  "
        })
    ], AuthenticateComponent);
    return AuthenticateComponent;
}());

exports.AuthenticateComponent = AuthenticateComponent;
