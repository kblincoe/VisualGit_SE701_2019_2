"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AddRepositoryComponent = (function () {
    function AddRepositoryComponent() {
    }
    AddRepositoryComponent.prototype.addRepository = function () {
        downloadRepository();
        switchToMainPanel();
    };
    AddRepositoryComponent.prototype.selectSave = function () {
        if (document.getElementById("repoSave").value == null || document.getElementById("repoSave").value == "") {
            document.getElementById("dirPickerSaveNew").click();
        }
        else {
            this.addRepository();
        }
    };
    AddRepositoryComponent.prototype.selectDirectory = function () {
        if (document.getElementById("repoOpen").value == null || document.getElementById("repoOpen").value == "") {
            document.getElementById("dirPickerOpenLocal").click();
        }
        else {
            this.openRepository();
        }
    };
    AddRepositoryComponent.prototype.openRepository = function () {
        openRepository();
        switchToMainPanel();
    };
    AddRepositoryComponent.prototype.returnToMainPanel = function () {
        switchToMainPanel();
    };
    AddRepositoryComponent = __decorate([
        core_1.Component({
            selector: "add-repository-panel",          
			template: "\n    <div class=\"add-repository-panel\" id=\"add-repository-panel\">\n      <img src=\"./assets/Back.svg\" (click)=\"returnToMainPanel()\" class=\"back-button\">\n\n      <div class=\"add-repository-body\">\n        <div class=\"title\">\n          <h1 class=\"clone-title\">Clone from Internet</h1>\n        </div>\n\n        <div class=\"block\">\n          <div class=\"left\">\n            <p>URL to clone from</p>\n          </div>\n          <div class=\"right\">\n          <input type=\"text\" oninput=\"updateLocalPath()\" name=\"repositoryRemote\" size=\"50\" id=\"repoClone\" placeholder=\"https://github.com/user/repository.git\"/>\n     <button type=\"button\" class=\"button-clone\" id=\"cloneButton\" onclick=\"selectSave()\">Clone</button>     </div>\n     <input type=\"file\" id=\"dirPickerSaveNew\" name=\"dirListSave\" (change)=\"addRepository();\" style=\"display: none;\" webkitdirectory />\n        </div>\n\n        <div class=\"block\">\n             <div class=\"left\">\n            <p>File location to save to</p>\n          </div>\n          <div class=\"right\">\n            <input type=\"text\" name=\"repositoryLocal\" size=\"50\" id=\"repoSave\"/>\n            <button class=\"button-clone\" (click)=\"selectSave()\">Save</button>\n            <input type=\"file\" id=\"dirPickerSaveNew\" name=\"dirListSave\" (change)=\"addRepository();\" style=\"display: none;\" webkitdirectory />\n          </div>\n        </div>\n\n\n        <div class=\"title\">\n          <h1 class=\"open-local-repo\">Open Local Repository</h1>\n        </div>\n\n        <div class=\"block\">\n          <div class=\"left\">\n            <p>Location of existing repository</p>\n          </div>\n          <div class=\"right\">\n            <input type=\"text\" name=\"repositoryLocal\" size=\"50\" id=\"repoOpen\"/>\n            <button class=\"button-open\" (click)=\"selectDirectory()\">Open</button>\n            <input type=\"file\" id=\"dirPickerOpenLocal\" name=\"dirList\" (change)=\"openRepository()\" style=\"display: none;\" webkitdirectory />\n         </div>\n        </div>\n      </div>\n    </div>\n  "
        })
    ], AddRepositoryComponent);
    return AddRepositoryComponent;
}());
exports.AddRepositoryComponent = AddRepositoryComponent;
