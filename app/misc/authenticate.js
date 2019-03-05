var Git = require("nodegit");
var repo;
var github = require("octonode");
var aid, atoken;
var client;
var avaterImg;
var repoList = {};
var url;
var signed = 0;
var changes = 0;
function CommitNoPush() {
    if (CommitButNoPush == 1) {
        $("#modalW2").modal();
    }
}
function signInHead(callback) {
    encryptTemp(document.getElementById("Email1").value, document.getElementById("Password1").value);
    if (signed == 1) {
        if ((changes == 1) || (CommitButNoPush == 1)) {
            $("#modalW2").modal();
        }
        else {
            getUserInfo(callback);
        }
    }
    else {
        getUserInfo(callback);
    }
}
function LogInAfterConfirm(callback) {
    encryptTemp(document.getElementById("Email1").value, document.getElementById("Password1").value);
    getUserInfo(callback);
}
function ModalSignIn(callback) {
    encryptTemp(document.getElementById("Email1").value, document.getElementById("Password1").value);
    getUserInfo(callback);
}
function signInPage(callback) {
    if (rememberLogin.checked == true) {
        encrypt(username, password);
    }
    getUserInfo(callback);
}
function loginWithSaved(callback) {
    document.getElementById("username").value = getUsername();
    document.getElementById("password").value = getPassword();
}
function getUserInfo(callback) {
    encryptTemp(document.getElementById("username").value, document.getElementById("password").value);
    cred = Git.Cred.userpassPlaintextNew(getUsernameTemp(), getPasswordTemp());
    client = github.client({
        username: getUsernameTemp(),
        password: getPasswordTemp()
    });
    var ghme = client.me();
    ghme.info(function (err, data, head) {
        if (err) {
            displayModal(err);
        }
        else {
            avaterImg = Object.values(data)[2];
            var docGitUser = document.getElementById("githubname");
            var doc = document.getElementById("avatar");
            signed = 1;
            callback();
        }
    });
    ghme.repos(function (err, data, head) {
        if (err) {
            return;
        }
        else {
            console.log(data.length);
            for (var i = 0; i < data.length; i++) {
                var rep = Object.values(data)[i];
                console.log(rep['html_url']);
                displayBranch(rep['full_name'], "repo-dropdown", "selectRepo(this)");
                repoList[rep['full_name']] = rep['html_url'];
            }
        }
    });
}
function selectRepo(ele) {
    url = repoList[ele.innerHTML];
    var butt = document.getElementById("cloneButton");
    butt.innerHTML = 'Clone ' + ele.innerHTML;
    butt.setAttribute('class', 'btn btn-primary');
    console.log(url + 'JJJJJJJJ' + ele.innerHTML);
}
function cloneRepo() {
    if (url === null) {
        updateModalText("Web URL for repo could not be found. Try cloning by providing the repo's web URL directly in the 'Add repository' window");
        return;
    }
    console.log("cloneRepo().url = " + url);
    var splitUrl = url.split("/");
    var local;
    if (splitUrl.length >= 2) {
        local = splitUrl[splitUrl.length - 1];
    }
    console.log("cloneRepo().local = " + local);
    if (local == null) {
        updateModalText("Error: could not define name of repo");
        return;
    }
    downloadFunc(url, local);
    url = null;
    $('#repo-modal').modal('hide');
}
function signInOrOut() {
    var doc = document.getElementById("avatar");
    if (doc.innerHTML == 'Sign out') {
        $('#avatar').removeAttr('data-toggle');
        if ((changes == 1) || (CommitButNoPush == 1)) {
            $("#modalW2").modal();
        }
        else {
            redirectToHomePage();
        }
    }
}
function redirectToHomePage() {
    window.onbeforeunload = Confirmed;
    window.location.href = "index.html";
    signed = 0;
    changes = 0;
    CommitButNoPush = 0;
}
