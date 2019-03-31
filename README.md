# Welcome

VisualGit is an easy-to-use, visually-oriented desktop client for Git aimed at helping students learn the standard Git workflow.

# Project team
Team MLT3

# Origins
VisualGit was brought to life by Elliot Whiley and Harvey Rendell. For a summary of their project, refer to their [cool poster](https://github.com/ElliotWhiley/VisualGit/raw/resources/visualgit-poster.pdf). You can find their original repo [here](https://github.com/ElliotWhiley/VisualGit).

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

### Setup

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
npm start
````

You can log in to VisualGit using your GitHub credentials.


# Development

### TypeScript
[TypeScript](https://www.typescriptlang.org/) is a statically-typed superset of JavaScript that compiles into JavaScript. Most of our source files are written in TypeScript (.ts files), therefore you will need to run a TypeScript compiler to compile the source code to JavaScript (.js files) as you make changes, e.g. [typescript-compiler](https://www.npmjs.com/package/typescript-compiler) for Node.

### Sass
[Sass](http://sass-lang.com/) (Syntactically Awesome Style Sheets) is a CSS preprocessor with some handy extra features. All of our Style Sheets are written in Sass (.scss files), which compile into CSS (.css files). Therefore, you will need to a run a Sass-compiler to compile your .scss files into .css files as you make changes, e.g. [node-sass](https://www.npmjs.com/package/node-sass) for Node.

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


# Contributing
Please read the contributing guidelines [here](docs/ContributingGuidelines.md).

# Project Management Decisions

#### In Project Coordination Meeting 1
- Tim chosen as leader to speak on behalf of the team if required at any point.
- Decided to be a self-managing team.
- Kanban Project Management methodology chosen (because of its flexibility and suitability for the team) to visualise and manage work using GitHub project boards with automation.
- Decided to remain in 1 large team as sub-teams would unnecessarily complicate management. 
- Issues should have completion deadlines. 
- 3 approvers required per issue.
- 1 code reviewer required per pull request.

#### On Facebook group poll
Majority voted to switch from restrictive and stress-inducing round robin selection of issue approvers and code reviewers to more flexible option where everyone approves issues/performs code reviews in their own time and gives everyone else a chance to meet the minimum contribution requirements via contribution tracking in [Google spreadsheet](https://docs.google.com/spreadsheets/d/1LkejPCwIMmFTnO8fR4aW8SnhFZTEAMqyIu6_s4_wmC4/edit?usp=sharing). If an urgent issue approval or code review is required, the team will be prompted so that someone who is available volunteers.

#### In Project Coordination Meeting 2
- To ensure that the codebase in master is functional across MacOS and Windows (the 2 OSs used by our team for development), everyone will aim to perform code reviews for pull requests where code is developed on an OS different to their own. Noting the development OS will be a requirement for a new pull request.
- Decided to hold a moratorium in the last 3 days before the assignment due date to ban any new features being added. The focus during this period will be bug fixes and general improvements. 

# Help
Visualgit utilises a range of libraries and frameworks, more information on them can be found below:

 - [Electron](http://electron.atom.io/)
 - [Node.js](https://nodejs.org/en/about/)
 - [AngularJS](https://angular.io/)
 - [nodegit](http://www.nodegit.org/)
 - [Vis.js](http://visjs.org/docs/network/)
 - [TypeScript](https://www.typescriptlang.org/)
 - [Sass](http://sass-lang.com/)
