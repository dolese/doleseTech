You have now built a whole system: a web page, a database, a Python report and a C++ program. Imagine losing it — a stolen laptop, a flash drive with the shortcut virus from Chapter 7, or one bad edit that breaks everything the night before you show it to the head teacher. *Git* makes sure that never costs you more than a few minutes. It keeps every version of every file you choose to save, lets you try ideas without risk, and — with *GitHub* — keeps a copy online, lets others work with you, and can even put your results page on the internet for free.

By the end of this chapter you will be able to:

- install Git and tell it who you are;
- turn your project into a repository and save versions of it with commits;
- see exactly what changed, and undo changes you do not want;
- keep files that should never be saved — like passwords — out of Git;
- try ideas on a branch and merge them, including fixing a conflict;
- put your project on GitHub, and work on it from more than one computer;
- publish the results page as a real website with GitHub Pages.

## 8.1 What Git does

Without Git, most people keep versions like this:

```text
results-final.html
results-final-2.html
results-final-REALLY-final.html
results-old-dont-delete.html
```

Nobody remembers which is which, or what changed between them. Git replaces that with a single folder and a history. Each time you reach a good point, you make a *commit*: a saved snapshot of the whole project, with a message saying what changed and why. You can look back at any commit, compare any two, and return to any one.

| Word | Meaning |
|---|---|
| Repository ("repo") | A project folder whose history Git keeps. The history lives in a hidden `.git` folder inside it |
| Commit | One saved snapshot of the project, with a message, an author and a date |
| Staging | Choosing which changes go into the next commit |
| Branch | A separate line of work, so you can try something without touching the main version |
| Merge | Bringing the work from one branch into another |
| Remote | A copy of the repository somewhere else — usually on GitHub |
| Push / pull | Sending your commits to the remote / bringing others' commits from it |

Git runs on your own computer and needs no internet. GitHub is a website that stores Git repositories online. They are separate: you can use Git without GitHub, but not GitHub without Git.

## 8.2 Installing and setting up Git

1. Download Git for Windows from **git-scm.com** and run the installer. The default choices are fine; click **Next** until it finishes.
2. Open a new terminal in VS Code (``Ctrl + ` ``) and check:

```text
git --version
```

3. Tell Git who you are. Every commit records this name and email, so use your real name and an email you check:

```text
git config --global user.name "Grace Mushi"
git config --global user.email "grace@example.com"
git config --global init.defaultBranch main
```

The last line names the first branch of every new repository `main`, which is what GitHub expects. `--global` means these settings apply to every repository on this computer, so you only do this once.

## 8.3 Your first commit

Move into your project folder and turn it into a repository:

```text
cd Documents\Projects\results-system
git init
```

```output
Initialized empty Git repository in C:/Users/Grace/Documents/Projects/results-system/.git/
```

The path will be your own. Now ask Git what it sees — the command you will type more than any other:

```text
git status
```

```output
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	cpp/
	database/
	python/
	web/

nothing added to commit but untracked files present (use "git add" to track)
```

*Untracked* means Git can see the files but is not keeping their history yet.

### What not to save

Some files should never go into Git:

- **Files your programs make**, such as `results.csv` from Chapter 5, Python's `__pycache__` folder and the `results.exe` that the C++ compiler builds. They can always be made again, and saving them only creates noise.
- **Secrets** — passwords, API keys, the settings file that holds them. Chapter 5 kept the database password out of the code; this keeps it out of Git.

List them in a file called `.gitignore` (with the dot) in the project's top folder:

```text
# Made by the programs: build them again, never edit them by hand
python/results.csv
python/__pycache__/
cpp/results.exe

# Secrets never go in Git
.env
```

Each line is a file or folder for Git to ignore; lines starting with `#` are comments. `git status --short` shows the result in one line per item:

```text
git status --short
```

```output
?? .gitignore
?? cpp/
?? database/
?? python/
?? web/
```

`??` means untracked.

### Stage and commit

Saving a commit takes two steps. `git add` *stages* changes — puts them in the next snapshot. `git commit` saves the snapshot with a message:

```text
git add .
git commit -m "Results page, database, Python report and C++ program"
```

```output
[main (root-commit) b63706d] Results page, database, Python report and C++ program
 18 files changed, 1112 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 cpp/grades.cpp
 create mode 100644 cpp/grades.h
 create mode 100644 cpp/main.cpp
 create mode 100644 cpp/person.h
 create mode 100644 cpp/student.cpp
 create mode 100644 cpp/student.h
 create mode 100644 database/data.sql
 create mode 100644 database/results.sql
 create mode 100644 database/schema.sql
 create mode 100644 python/class_list.csv
 create mode 100644 python/grades.py
 create mode 100644 python/report.py
 create mode 100644 python/save_to_db.py
 create mode 100644 python/test_grades.py
 create mode 100644 web/results.html
 create mode 100644 web/results.js
 create mode 100644 web/style.css
```

The dot in `git add .` means "everything in this folder". Notice what is *not* in the list: `results.csv`, `__pycache__` and `results.exe` were ignored, exactly as `.gitignore` asked.

`b63706d` is the start of the commit's *ID*, a long code that Git calculates from the commit's contents. Yours will be different — every commit in the world has its own. You can refer to a commit by these first seven characters.

`git log --oneline` lists the history, newest first:

```output
b63706d Results page, database, Python report and C++ program
```

### Writing good messages

A commit message is a note to the future — often to yourself in six months. Say *what* changed and, when it is not obvious, *why*:

| Poor message | Better message |
|---|---|
| `update` | `Show the summary numbers in blue` |
| `fixed it` | `Refuse marks above 100 in the entry form` |
| `changes` | `Count Elia's missed paper as absent, not zero` |

## 8.4 The everyday cycle

Change something: in `web/style.css`, make the three summary numbers blue instead of green. Then ask Git:

```text
git status
```

```output
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   web/style.css

no changes added to commit (use "git add" and/or "git commit -a")
```

`git diff` shows exactly what changed, line by line:

```text
git diff
```

```output
diff --git a/web/style.css b/web/style.css
index 03d455c..1fcf263 100644
--- a/web/style.css
+++ b/web/style.css
@@ -74,7 +74,7 @@ h2 {
   display: block;
   font-size: 1.5rem;
   font-weight: bold;
-  color: #2e8b2a;
+  color: #1e6fb8;
 }
 
 /* Results table */
```

A line starting with `-` was removed and a line starting with `+` was added. The lines around them, with no sign, are there to show where the change is. `@@ -74,7 +74,7 @@` says the change is near line 74. Read the diff before every commit: it is the last chance to notice a change you did not mean to make.

Stage and commit it:

```text
git add web/style.css
git commit -m "Show the summary numbers in blue"
```

```output
[main 8173a1c] Show the summary numbers in blue
 1 file changed, 1 insertion(+), 1 deletion(-)
```

That is the whole everyday cycle: **change, `status`, `diff`, `add`, `commit`.** Commit whenever you reach a point that works — several times a day is normal. Small commits with clear messages are easy to understand and easy to undo.

> **Tip:** VS Code has Git built in. Open the **Source Control** panel (`Ctrl + Shift + G`) to see changed files, click one to see its diff side by side, type a message and press **Commit**. It runs the same commands for you. Learn the commands first, so you understand what the buttons do.

### Undoing a change

You edited a file, it went wrong, and you want it back exactly as it was at the last commit:

```text
git restore web/results.html
```

The file returns to its last committed version. This cannot be undone — the edits since the last commit are gone — so check `git diff` first to be sure.

To look at an old version without changing anything, `git show 8173a1c` displays that commit and its diff. Git has many more ways to undo, but restoring a file and making a new commit to fix a mistake cover nearly every situation a beginner meets.

## 8.5 Branches

A *branch* is a separate line of work. You create one to try something — a new feature, a risky change — while `main` stays safe. If the idea works, you *merge* it back; if not, you delete the branch and nothing is lost.

Create a branch and move onto it in one step:

```text
git switch -c test-zero-mark
```

```output
Switched to a new branch 'test-zero-mark'
```

Add a test to `python/test_grades.py` checking that a mark of 0 gets an F, and commit it. `git commit -am` stages every changed file that Git already tracks and commits it, in one command:

```text
git commit -am "Test that a mark of 0 is an F"
```

```output
[test-zero-mark bea4dd2] Test that a mark of 0 is an F
 1 file changed, 1 insertion(+)
```

The test passes, so bring the work into `main`. Switch back, then merge:

```text
git switch main
git merge test-zero-mark
```

```output
Updating 8173a1c..bea4dd2
Fast-forward
 python/test_grades.py | 1 +
 1 file changed, 1 insertion(+)
```

*Fast-forward* means `main` had not changed since the branch began, so Git simply moved `main` forward to include the new commit. The branch has done its job; delete it:

```text
git branch -d test-zero-mark
```

```output
Deleted branch test-zero-mark (was bea4dd2).
```

### When two changes meet: conflicts

Usually Git merges changes by itself, even when both branches changed the same file. It only needs help when both changed **the same lines** in different ways. Suppose a branch called `add-country` changed the school's address line to add "Tanzania", while on `main` someone changed the post office box. Merging gives:

```text
git merge add-country
```

```output
Auto-merging web/results.html
CONFLICT (content): Merge conflict in web/results.html
Automatic merge failed; fix conflicts and then commit the result.
```

Nothing is lost. Git has written both versions into the file, between markers:

```text
<<<<<<< HEAD
      <p>P.O. Box 5678, Dodoma</p>
=======
      <p>P.O. Box 1234, Dodoma, Tanzania</p>
>>>>>>> add-country
```

Above `=======` is the version on the branch you are on (`HEAD`, here `main`); below it is the version from `add-country`. Your job is to decide what the line should be — here, both changes are right, so keep the new box number *and* the country — and delete the three marker lines:

```text
      <p>P.O. Box 5678, Dodoma, Tanzania</p>
```

Then stage the file to mark the conflict as resolved, and commit:

```text
git add web/results.html
git commit -m "Merge the new address and the country"
```

`git log --oneline --graph` draws the history, showing the two lines of work and where they joined:

```output
*   6461290 Merge the new address and the country
|\  
| * 41734b2 Add the country to the address
* | 9d250be New post office box
|/  
* bea4dd2 Test that a mark of 0 is an F
* 8173a1c Show the summary numbers in blue
* b63706d Results page, database, Python report and C++ program
```

> **Remember:** A conflict is not an error. It is Git asking a person to make a decision it cannot make for you. VS Code highlights conflicts and offers buttons such as **Accept Both Changes** — but always read the result before you commit it.

## 8.6 GitHub

So far, the history lives only on your computer. GitHub keeps a copy online: a backup, a way to work from several computers, and a place to work with others.

### Create an account and a repository

1. Sign up at **github.com**. Choose a username you would be happy to show an employer — many developers' GitHub pages are part of their CV.
2. Turn on **two-step verification** when GitHub asks (Chapter 7 explained why). GitHub requires it for anyone who publishes code.
3. Click **New** (or the **+** at the top right → **New repository**). Name it `results-system`. Choose **Private** for now: only you can see it. Do **not** tick "Add a README file" — your repository already has a history to send.
4. Click **Create repository**. GitHub shows the address of the new repository, ending in `results-system.git`.

### Push

Tell your local repository about the one on GitHub. The remote is usually called `origin`:

```text
git remote add origin https://github.com/YOUR-USERNAME/results-system.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. The first time, Git for Windows opens a window to sign in to GitHub in your browser; after that it remembers. When the push finishes, refresh the repository's page on GitHub: every file and every commit is there.

`-u` links your `main` to GitHub's `main`, so from now on `git push` and `git pull`, with nothing after them, know where to go. The everyday cycle gains one step at the end:

```text
git add .
git commit -m "Describe the change"
git push
```

### Working from another computer

On a second computer — at school, say — get a full copy of the repository, with its whole history:

```text
git clone https://github.com/YOUR-USERNAME/results-system.git
```

Before starting work there, and every time you return to a computer, bring in what was pushed from elsewhere:

```text
git pull
```

**Pull before you start, push when you stop.** That habit prevents almost all conflicts when you work in more than one place.

### Working with others

On a team, nobody pushes untested changes straight to `main`. Each person works on a branch, pushes it, and opens a *pull request* on GitHub: a page that shows the branch's changes and asks for them to be merged. Teammates read the diff, comment on lines, and approve it; then it is merged on GitHub. This is how almost all professional software is built, including the projects this book is based on.

> **Warning:** Never commit a password, an API key or a `.env` file — not even to a private repository. If one slips in, deleting the file is not enough: it is still in the history, and anyone with a copy can find it. **Change the password or key at once**, then remove the file. Likewise, never put real students' names and marks in a public repository; the data in this book is invented for exactly that reason.

## 8.7 Your results page on the internet

GitHub can host a website for free with *GitHub Pages*, straight from your repository. Your results page from Chapter 3 is pure HTML, CSS and JavaScript, so it works as it is.

On a free GitHub account, Pages works only for **public** repositories, so first make sure the repository contains nothing private: the invented class from this book is fine, real marks are not. Then:

1. On the repository's page, open **Settings → General**, scroll to the **Danger Zone**, and choose **Change visibility → Make public**.
2. Open **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. GitHub suggests workflows. Find **Static HTML** and click **Configure**.
4. A file called `static.yml` opens in GitHub's editor. Find the line `path: '.'` and change it to `path: './web'`, so that only the `web` folder is published.
5. Click **Commit changes**.

GitHub builds the site in about a minute; the **Actions** tab shows the progress. Your page is then at:

```text
https://YOUR-USERNAME.github.io/results-system/results.html
```

Open it on your phone. Everything from Chapters 2 and 3 works: the table, the grade badges, entering marks, and the marks being remembered in that browser. Every time you push a change to the `web` folder, the site updates by itself.

The commit GitHub just made lives on GitHub, not on your computer yet. Run `git pull` before your next change to bring it down.

> **Tip:** Rename `results.html` to `index.html`, and the page opens at the shorter address `https://YOUR-USERNAME.github.io/results-system/` — web servers show `index.html` when no file name is given. Remember to update anything that links to the old name.

## 8.8 When something goes wrong

| Git says | What it means |
|---|---|
| `fatal: not a git repository` | The terminal is not inside your project folder. Use `cd` to move into it |
| `nothing to commit, working tree clean` | Every change is already committed. Good news |
| `Author identity unknown` | Git does not know your name: run the `git config` commands in section 8.2 |
| `error: failed to push some refs` … `Updates were rejected` | GitHub has commits you do not have yet. Run `git pull`, fix any conflicts, then push again |
| `CONFLICT (content): Merge conflict in …` | Two changes touched the same lines. Edit the file as in section 8.5, then `add` and `commit` |
| `error: Your local changes … would be overwritten` | You have uncommitted changes that a `switch` or `pull` would lose. Commit them first |
| `Permission denied` or a 403 error when pushing | You are signed in as someone else, or the address is wrong. Check it with `git remote -v` |

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Version control | Udhibiti wa matoleo | Keeping a history of every saved version of your files |
| Repository | Hazina | A project whose history Git keeps |
| Commit | Kuhifadhi toleo | One saved snapshot of the project, with a message |
| Branch | Tawi | A separate line of work |
| Merge | Kuunganisha | Bringing one branch's work into another |
| Conflict | Mgongano | Two changes to the same lines, which a person must decide between |
| Remote | Hazina ya mbali | A copy of the repository on another computer, such as GitHub |
| Push | Kusukuma | Sending your commits to the remote |
| Pull | Kuvuta | Bringing others' commits from the remote |
| Clone | Kunakili | Making a full copy of a repository, with its history |
| Pull request | Ombi la kuunganisha | A request on GitHub to review and merge a branch |

## Check your understanding

1. What is the difference between Git and GitHub?
2. Why do `results.csv` and `results.exe` belong in `.gitignore`?
3. What do `git add` and `git commit` each do, and why are they separate steps?
4. In a `git diff`, what do lines beginning with `-` and `+` mean?
5. You edited `style.css`, the page now looks wrong, and you have not committed. How do you get the last committed version back, and what should you check first?
6. Why make a branch instead of trying an idea directly on `main`?
7. When does Git need your help to merge, and what do the lines `<<<<<<<`, `=======` and `>>>>>>>` mean?
8. You committed a file containing the database password and pushed it to GitHub. You delete the file and push again. Are you safe? What must you do?
9. Why must the repository be public before using GitHub Pages on a free account, and what must you check before making it public?
10. You work on the project at home and at school. What two habits stop your two copies from getting out of step?

### Answers

1. Git is a program on your computer that keeps the history of your files. GitHub is a website that stores Git repositories online and adds tools for working together.
2. They are made by your programs and can always be made again. Saving them in Git only adds noise and makes changes harder to read.
3. `git add` chooses which changes go into the next snapshot; `git commit` saves that snapshot with a message. Keeping them separate lets you commit some changes and leave others for a later commit.
4. A `-` line was removed; a `+` line was added. Unmarked lines are unchanged and show where the change is.
5. `git restore web/style.css`. Check `git diff` first, because the uncommitted changes will be lost for good.
6. So that `main` always works. If the idea fails, you delete the branch and nothing is lost; if it works, you merge it.
7. When two branches changed the same lines in different ways. The part above `=======` is your current branch's version, the part below is the other branch's version, and the markers show where the conflict starts and ends.
8. No. The password is still in the history, where anyone with a copy can find it. Change the password immediately, then remove the file.
9. Free accounts can only publish Pages from public repositories, and a public repository can be read by anyone in the world. Check that it contains no passwords, keys or real personal data — such as real students' names and marks.
10. Pull before you start work, and push when you stop.
