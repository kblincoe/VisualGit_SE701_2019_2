# Contributing Guidelines

Navigate back to [README](../README.md).

#
### All project requirements specified in the Assignment 2 handout have been incorporated into this guide. Please aim to follow the workflow and best practices. Happy coding!

#

## Getting Started
We will be using the 'Fork and Pull' model for this project.

You only need to complete these steps once, at the beginning. Always run your command line tool as Administrator.

#### 1.	Create a fork:
Sign in to GitHub, navigate to [MLT3’s main repo](https://github.com/kblincoe/VisualGit_SE701_2019_2) and then create your own personal fork of the main repo by clicking ‘Fork’. 

#### 2.	Clone your fork:

Please ensure that the path to your development folder has no spaces in it before you clone to avoid errors.

Get the unique https or ssh address of your fork by clicking ‘Clone’ on your newly created GitHub fork page.
Using your fork address, run the command below in your Dev folder.
````
git clone YourUniqueForkAddressHere
````
*The clone command creates a local copy of your fork on your machine. It automatically creates a remote connection called origin pointing back to your fork so you can push changes.*

#### 3.	Set up an upstream remote connection:

*This is necessary in order to be able to keep your fork and local repo updated when the main repo changes.* 

````
cd VisualGit_SE701_2019_2
git remote add upstream https://github.com/kblincoe/VisualGit_SE701_2019_2.git
````

#### 4.	Set your username and email:

Run the following command to check that your username and email has been set.
````
git config --list
````

If you don't see it in the list, then...
````
git config --global user.name "Your username"
git config --global user.email "Your email"
````

#### 5.	Install Node.js and npm.

Download and install version 10.15.3 of [Node.js](https://nodejs.org/en/download/). It comes with npm version 6.4.1. Upgrade this to version 6.9.0 using the following command. 

Windows
````
npm install -g npm@6.9.0
````

MacOS
````
sudo npm install -g npm@6.9.0
````

Ubuntu
````
 sudo apt install npm
 sudo apt install nodejs-legacy
 sudo npm install -g n
 sudo n 10.15.3
 sudo npm install npm@6.9.0 -g
 ````

#### 6.	Install windows build tools (Windows users only).

If you are using Windows, type "$PSHome" in a PowerShell window to get your PowerShell path.
Add the PowerShell path to your PATH system environment variable.

then...

````
npm install windows-build-tools -g
````
#### 7. Install global and local packages

Windows
````
npm install -g electron node-pre-gyp
````

MacOS
````
sudo npm install -g electron node-pre-gyp
````

Ubuntu
````
 sudo npm install -g electron node-pre-gyp --unsafe-perm=true --allow-root
 sudo apt install libcurl4-gnutls-dev
 sudo chmod +777 -R $HOME/
 sudo npm cache verify
````

All 
````
npm install
````
After you run npm install once in the beginning, you only need to run it later on if you have made changes to the package.json file.

Note: If you encounter an 'electron-rebuild' error during installation, ensure that your local repository path doesn't have any spaces in it. If it does, delete your local repository, rename the path to one with no spaces, clone again and run 'npm install' again.

## Running the code
````
npm run test
npm run lint
npm run start
````
npm run test runs all tests. 

npm run lint runs the linter to check for style errors.

npm run start starts VisualGit.

You can log in to VisualGit using your GitHub credentials.

## Approving issues
- Before approving issues, which are bugs, you should ensure that the bug exists (if you can’t, ask the author for more details). 
- Before approving feature requests, you should ensure that the feature is appropriate for the product and the need for the feature has been well described (if not, ask the author for more details). 
- For all new issues, you must ensure that no duplicate issues exist, that the size estimate is appropriate, and dependencies to other issues are flagged appropriately. 
- If you approve of the issue, add a comment stating this.
- The third and final approver must also replace the ‘Unapproved’ label with ‘Approved.’

If you approve an issue, please update the [contribution tracking sheet](https://docs.google.com/spreadsheets/d/1LkejPCwIMmFTnO8fR4aW8SnhFZTEAMqyIu6_s4_wmC4/edit?usp=sharing).

## Updating your fork
- Always rebase before you create a new branch off master so that you can begin with the latest working version of the codebase and avoid generating too many merge conflicts later. 
- Never work directly in your fork’s master. You should be working in branches. 
- Remember: Never rebase a public branch. Your fork’s master is private as you should be the only one modifying it so it’s ok to rebase that branch.

Run the commands below:
````
git checkout master
git fetch upstream
git rebase upstream/master
````

If the rebase command results in conflicts, resolve them and then:
````
git rebase --continue
````

Once you have rebased your fork’s master, push to your remote fork.
````
git push origin master
````
or if that doesn't work...
````
git push --force-with-lease origin master
````
## Expected Contributions

[Assignment 2 handout](https://canvas.auckland.ac.nz/courses/39855/files/folder/Part%201/coursework?preview=2851856). The amount of contribution may vary depending on the complexity of selected issue per person. However, it is expected that each member performs at least one of each type of contribution mentioned below. 

### Types of Contributions

- Contribute code and documentation changes

- Create a new issue (report bug/feature request)

- Approving issues

- Code Review


### Individual Project Report

An individual project report must also be submitted on Canvas. The report should include the course number and name, the name of your group, your name,
UPI, and GitHub username, and the date. The report should contain a list of your contributions
(grouped by the type of contribution). Include the following for each contribution: a link to the
associated GitHub artifact (issue, pull request, etc.) and estimated size of the associated issue.
In addition to the list of contributions, you should include a very brief description of the top
three things you learned about working in a large team through this project. This should be in
bulleted format, and should be ½ a page or less. A single pdf file should be submitted. The file
should be named A2_UPI.pdf. 

## Making contributions to your fork

Before you can start contributing documentation or code for a feature or bug fix, you must:

#### 1.	Assign yourself to an existing, unclaimed, approved issue which directly relates to the contribution you wish to make. 
- Aim to select an issue from the Triage section of the [Kanban board](https://github.com/kblincoe/VisualGit_SE701_2019_2/projects/1) if available, however, you can also select one from the list of [all issues](https://github.com/kblincoe/VisualGit_SE701_2019_2/issues).
- Link the issue (if not done already) to project MLT3 so it can be automatically moved to the backlog of the Kanban board.
- Set yourself a completion deadline and add this to the issue. You must aim to complete your contribution and submit a pull request by this deadline.
- By looking at the other open issues, identify dependencies for this issue in comments e.g. "Depends on #123" or “Blocks #123”. If dependencies are found, you should coordinate your changes and document this coordination in the comments.

or

#### 2. Create a new issue for the contribution you wish to make (ensuring that there are no duplicates).
This new issue must:
-	Follow bug report guidelines if it is a bug.
-	Describe the new feature and why it would be useful if it is a feature request.
-	Have a size label (Very small, Small, Medium, Large, or Very large)
-	Initially have the ‘Unapproved’ label.
-	Be linked to project MLT3. This will automatically move the issue to the backlog of the [Kanban board](https://github.com/kblincoe/VisualGit_SE701_2019_2/projects/1).
-	Have a completion deadline. You must aim to complete your contribution and submit a pull request by this deadline.
-   Include dependencies on other issues if they exist e.g. "Depends on #123" or “Blocks #123”. If dependencies are found, you should coordinate your changes and document this coordination in the comments.
-	Be approved by 3 others who must leave a comment on the new issue saying they approve. The third approver must also replace the ‘Unapproved’ label with ‘Approved.’

If you have created an issue, please update the [contribution tracking sheet](https://docs.google.com/spreadsheets/d/1LkejPCwIMmFTnO8fR4aW8SnhFZTEAMqyIu6_s4_wmC4/edit?usp=sharing).

Once the issue is approved, assign yourself to it. Please note that you cannot claim more than one issue at a time.

On the [Kanban board](https://github.com/kblincoe/VisualGit_SE701_2019_2/projects/1), move the issue to ‘In progress’ once you begin working on it.

Create a new branch every time you start work on a new issue. If the change is large, consider using a feature flag and multiple pull requests.
Before you branch, ensure that you have updated your fork by following the instructions in [Updating your fork](##Updating-your-fork) above.
Pick a short descriptive branch name to describe the issue you plan to work on (Avoid using ‘#’ or a number as a prefix as it might lead to branch switching issues later). 

Then, run the following command to switch to master first (if you’re not already in it) and then branch from master and switch to your new branch.
````
git checkout master
git checkout -b NewBranch
````

Commit early and often.

All code additions should include associated tests. If you feel that your code change does not need a test, please discuss this with the TA to obtain approval.

Ensure that the code is working correctly and that all tests pass.

After you have made a non-trivial modification to your new branch in your local repo, you’ll need to stage changes if needed (use 'git add filename' command instead of the 'git add .' command below if you only want to stage specific files and use 'git rm' to stage file deletions). Then, commit your changes. 
````
git add .
git commit -m “This commit will add contributing guidelines to the README”
````

Ensuring that you’re in your local branch, rebase to update it with changes from upstream. Remember to rebase often.
````
git checkout NewBranch
git fetch upstream
git rebase upstream/master
````

If the rebase command results in conflicts, solve these and then:
````
git rebase --continue
````

Once you are done with your doc update, feature or bug fix, you must squash your commits if you have more than 1, before submitting a pull request. Replace n with the last number of commits you want to review.
````
git rebase -i HEAD~n
````

An interactive text editor will pop up. Leave the first commit as ‘pick’ and replace the ‘pick’ in the other commits with ‘squash.’ You can replace that first ‘pick’ with ‘reword’ if you need to edit the commit message that will be used. The commit message that will be used should make sense with the prefix "This commit will" and should describe the issue e.g. "This commit will update documentation” makes sense so the commit message should be "Update Documentation". Save and exit the editor.
If you select ‘reword’, you’ll be prompted to enter your new commit message in an editor. Save and close, and then close any rebase files that open after that to finish squashing.

After your commits have been squashed, push your changes to the remote fork.
````
git push origin NewBranch
````
or if that doesn't work...
````
git push --force-with-lease origin NewBranch
````


## Submitting a pull request
Once you have committed and pushed to your fork and are ready to have your code merged into the main repository’s master branch (the only branch which will be marked), you must submit a pull request. You can do this on GitHub.

You should see the branch that was just pushed. Click on ‘Compare and pull request’ next to it.

The pull request should:
-	Include a title summarizing the changes. 
-	Include more details about the changes made in the body.
-   Mention the OS used for development.
-   Be linked to project MLT3 so that it can be automatically moved to 'In Progress' on the [Kanban board](https://github.com/kblincoe/VisualGit_SE701_2019_2/projects/1).
-	Reference the number of the associated issue by using the 'Closes' keyword e.g."Closes #123" in the body. This automatically closes the issue once the pull request is approved and merged.

Submit your pull request for code review.

## Reviewing a pull request (Code Review) and merging it
Navigate to the main repo page and click ‘Pull requests.' 

Select someone else’s pull request to review. Please aim to choose a pull request with a development OS different to your own.

Assign yourself to the selected pull request.

The Code Review must include running the code and testing it to see that everything works as expected and that all tests pass. So, check out the pull request into a new local branch and switch to it.
````
git fetch upstream pull/pullrequestnumber/head:NewPullRequestReviewBranch
git checkout NewPullRequestReviewBranch
````
Run and test to ensure that everything works as expected.

To add a review, click on 'Add your review' in the pull request.

If the code doesn’t work:
- Have a look at it to suggest changes. To add a comment on specific lines of code, click on the blue '+' button that shows up when you hover over the line.
- Mention what doesn't work e.g. the error and your OS version.
- Don't forget to praise concise/readable/efficient/elegant code.
- Submit review without approval. Choose the 'Comment' option.

If it does work:
- Review the code to suggest any changes via comments. 
- If the commits in the pull request are not squashed, please request that the code author do this before you approve and merge.
- If there are merge conflicts, please request that the author resolve them.
- Don't forget to praise concise/readable/efficient/elegant code.
- If you would like the author to make changes before merging, choose the 'Request changes' option. Otherwise, choose 'Approve' and submit your review.

Once the author has made all required changes, resolved all existing conflicts, squashed commits and you have approved the pull request, navigate back to the issue and then, choose the 'Rebase and merge' option by clicking on the dropdown arrow next to the 'Merge pull request' button. This will merge the pull request into the master branch of the main repo.

Delete your local pull request review branch to keep things tidy. You shouldn't be pushing this to your remote fork.
````
git branch -d NewPullRequestReviewBranch
````
or if that complains...
````
git branch -D NewPullRequestReviewBranch
````

Once you have performed a code review, please update the [contribution tracking sheet](https://docs.google.com/spreadsheets/d/1LkejPCwIMmFTnO8fR4aW8SnhFZTEAMqyIu6_s4_wmC4/edit?usp=sharing).

## Tidying up after a pull request merge
After your pull request has been approved and merged, you can delete that feature branch to keep things tidy.
````
git branch -d NewBranch
````
or if that complains...

````
git branch -D NewBranch
````

Once you have resolved an issue, please update the [contribution tracking sheet](https://docs.google.com/spreadsheets/d/1LkejPCwIMmFTnO8fR4aW8SnhFZTEAMqyIu6_s4_wmC4/edit?usp=sharing).
