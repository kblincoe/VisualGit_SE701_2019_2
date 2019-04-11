# Welcome

VisualGit is an easy-to-use, visually-oriented desktop client for Git aimed at helping students learn the standard Git workflow.

#
## Project team
Team MLT3

#

# Table of Contents

## 1. [ Installation ](#Installation)
## 2. [ Setup ](#Setup)
## 3. [Start VisualGit](#Start-VisualGit)
## 4. [ Development](#Development)
## 5. [Features](#Features)
## 6. [Contributing](#Contributing)
## 7. [Project Management Decisions](#Project-Management-Decisions)
## 8. [Credits](#Credits)
## 9. [Help](#Help)

#
<br />

# Installation

### Prerequisites

npm (Node Package Manager) is used to manage VisualGit's dependencies, therefore it is required to install and run VisualGit.
Follow the installation instructions below:

#### Centos-based systems
````
sudo yum install npm
````

#### Debian-based systems
````
sudo apt-get install npm
````

#### Mac
If you have homebrew installed:
````
brew install npm
````
Otherwise download and install version 10.15.3 of [Node.js](https://nodejs.org/en/download/). It comes with npm version 6.4.1. Upgrade this to npm 6.9.0 and install important global packages by running the commands below:
````
sudo npm install -g npm@6.9.0
sudo npm install -g electron node-pre-gyp
````

#### Windows
Download and install the latest version 10.15.3 of [Node.js](https://nodejs.org/en/download/). It comes with npm version 6.4.1. Upgrade this to npm 6.9.0 and install important global packages by running the commands below:
````
npm install -g npm@6.9.0
npm install -g electron node-pre-gyp
````
Type "$PSHome" in a PowerShell window to get your PowerShell path. Add the PowerShell path to your PATH system environment variable.

then...

````
npm install windows-build-tools -g
````

#### Ubuntu
Install npm and node
````
 sudo apt install npm
 sudo apt install nodejs-legacy
````
Upgrade node to 10.15.3 and npm to 6.9.0
````
 sudo npm install -g n
 sudo n 10.15.3
 sudo npm install npm@6.9.0 -g
 ````
 Install important global packages
 ````
 sudo npm install -g electron node-pre-gyp --unsafe-perm=true --allow-root
 sudo apt install libcurl4-gnutls-dev
 ````
 change the permission and verify cache
 ````
 sudo chmod +777 -R $HOME/
 sudo npm cache verify
````

<br />

# Setup

Please ensure that the path to your repository folder has no spaces in it before you clone to avoid errors.

Clone with either HTTPS or SSH:

#### HTTPS
````
git clone https://github.com/kblincoe/VisualGit_SE701_2019_2.git
````

#### SSH
````
git clone git@github.com:kblincoe/VisualGit_SE701_2019_2.git
````
then...

````
cd VisualGit_SE701_2019_2
npm install
````


<br />

# Start VisualGit

Run the command below to start VisualGit.

````
npm start
````

You can log in to VisualGit using your GitHub credentials.


<br />

# Development

### TypeScript
[TypeScript](https://www.typescriptlang.org/) is a statically-typed superset of JavaScript that compiles into JavaScript. Most of our source files are written in TypeScript (.ts files), therefore you will need to run a TypeScript compiler to compile the source code to JavaScript (.js files) as you make changes, e.g. [typescript-compiler](https://www.npmjs.com/package/typescript-compiler) for Node.

### Sass
[Sass](http://sass-lang.com/) (Syntactically Awesome Style Sheets) is a CSS preprocessor with some handy extra features. All of our Style Sheets are written in Sass (.scss files), which compile into CSS (.css files). Therefore, you will need to a run a Sass-compiler to compile your .scss files into .css files as you make changes, e.g. [node-sass](https://www.npmjs.com/package/node-sass) for Node.

<br />

# Features

### Opening / Cloning repositories
Repositories can be added by two methods; either by cloning the remotely hosted repository or opening it from the local file system. This is achieved using the add repository button in the top left which will update the screen to the add repository view.

#### Clone
Cloning with SSH is recommended as there is not yet any method for entering user credentials in VisualGit. This means that if you clone using HTTPS, you will still be able to see local changes and commit locally but not push.

#### Open local repository
Currently, when you clone a repository, it is saved to a directory under `./VisualGit/`. This means that when you open a repository which is saved locally, you can simply enter the name of the directory relative to the VisualGit directory. Other save locations are not currently supported but it is planned in future work.

### Adding & Committing
When changes are made in a repository which is open, the interface will update by showing each file which has uncommitted changes. These changes will be displayed as a traffic light scheme:
 - Green: Added file
 - Orange: Modified file
 - Red: Deleted file

This is used to allow users to see the different types of changes easily and once they click on the files, the file differences will be shown. The file differences are shown line by line with green lines representing added lines and red representing deleted lines. Any other parts of the file are unchanged.

### Pushing & Pulling from remote
The pulling and pushing currently works for changes which are made on master and origin/master by syncing these up. When the pull button is clicked, any changes on the remote repository will be added to the local repository and the graph will be updated. When pushing, the same process applies. The changes on master will be pushed to the remote repository.

<br />

# Contributing
Please read the contributing guidelines [here](docs/ContributingGuidelines.md).

<br />

# Project Management Decisions

#### In Project Coordination Meeting 1
- Tim chosen as leader to speak on behalf of the team if required at any point.
- Decided to be a self-managing team.
- Kanban Project Management methodology chosen because of its flexibility and suitability for the team.
- Decided to use [GitHub project board](https://github.com/kblincoe/VisualGit_SE701_2019_2/projects/1) with automation to visualise and manage work broken down into issues.
- Decided to remain in 1 large team as sub-teams would unnecessarily complicate management. 
- Issues should have completion deadlines. 
- 3 approvers required per issue.
- 1 code reviewer required per pull request.
- Round-robin selection of issue approvers and code reviewers.
- Decided that updating VisualGit to Angular7 would be the highest priority.

#### On Facebook group poll
Before we could commence work on the project, the majority voted to switch from the restrictive and stress-inducing round robin selection of issue approvers and code reviewers to a more flexible option where everyone approves issues/performs code reviews in their own time, while giving everyone else a chance to meet the minimum contribution requirements via contribution tracking in this [Google spreadsheet](https://docs.google.com/spreadsheets/d/1LkejPCwIMmFTnO8fR4aW8SnhFZTEAMqyIu6_s4_wmC4/edit?usp=sharing). If an urgent issue approval or code review is required, the team will be prompted so that someone who is available volunteers.

#### In Project Coordination Meeting 2
- To ensure that the codebase in master is functional across MacOS and Windows (the 2 OSs used by our team for development), everyone will aim to perform code reviews for pull requests where code is developed on an OS different to their own. Noting the development OS will be a requirement for a new pull request.
- Decided to hold a moratorium in the last 3 days before the assignment due date to ban any new features being added. The focus during this period will be bug fixes and general improvements. 

#### In Project Coordination Meeting 3
- Decided that work estimates(hours) for new issues will now be recommended while completion deadlines for issues will be completely optional. If anyone wishes to add a completion deadline, they can do so after the issue is approved, once they've assigned themselves to it.
- Decided to break up the very large automated testing task into smaller manageable issues. However, before these sub-issues can be created and before anyone can start adding tests to their contributions, the testing setup and a single unit test should be working so that we can ensure that we are all using the same configuration as well as the same testing framework and library. In the meantime, everyone should include manual testing steps in their pull requests. 
- Decided to cancel the code moratorium (with its accompanying restrictions) in favor of a final product with more functionality.

<br />

# Credits
VisualGit was originally developed by Elliot Whiley and Harvey Rendell. For a summary of their project, refer to their [cool poster](https://github.com/ElliotWhiley/VisualGit/raw/resources/visualgit-poster.pdf). You can find their original repo [here](https://github.com/ElliotWhiley/VisualGit).

<br />

# Help
Visualgit utilises a range of libraries and frameworks, more information on them can be found below:

 - [Electron](http://electron.atom.io/)
 - [Node.js](https://nodejs.org/en/about/)
 - [AngularJS](https://angular.io/)
 - [nodegit](http://www.nodegit.org/)
 - [Vis.js](http://visjs.org/docs/network/)
 - [TypeScript](https://www.typescriptlang.org/)
 - [Sass](http://sass-lang.com/)
