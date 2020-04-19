const GitHub = require("github-api");
function GithubAPI(auth) {
  let repo;
  let filesToCommit = [];
  let currentBranch = {};
  let newCommit = {};
  let gh = new GitHub(auth);

  this.setRepo = function (userName, repoName) {
    repo = gh.getRepo(userName, repoName);
  };

  this.setBranch = function (branchName) {
    if (!repo) {
      throw "Repository is not initialized";
    }

    return repo.listBranches().then((branches) => {
      let branchExists = branches.data.find(
        (branch) => branch.name === branchName
      );

      if (!branchExists) {
        return repo.createBranch("master", branchName).then(() => {
          currentBranch.name = branchName;
        });
      } else {
        currentBranch.name = branchName;
      }
    });
  };

  this.pushFiles = function (message, files) {
    if (!repo) {
      throw "Repository is not initialized";
    }
    if (!currentBranch.hasOwnProperty("name")) {
      throw "Branch is not set";
    }
    console.log(message);
    return getCurrentCommitSHA()
      .then(getCurrentTreeSHA)
      .then(() => createFiles(files))
      .then(createTree)
      .then(() => createCommit(message))
      .then(updateHead)
      .catch((e) => {
        console.error(e);
      });
  };
  this.createpr = (options) => {
    return repo.createPullRequest(options).catch((err) => console.log(err));
  };

  function getCurrentCommitSHA() {
    return repo.getRef("heads/" + currentBranch.name).then((ref) => {
      currentBranch.commitSHA = ref.data.object.sha;
    });
  }

  function getCurrentTreeSHA() {
    return repo.getCommit(currentBranch.commitSHA).then((commit) => {
      currentBranch.treeSHA = commit.data.tree.sha;
    });
  }

  function createFiles(filesInfo) {
    let promises = [];
    let length = filesInfo.length;

    for (let i = 0; i < length; i++) {
      promises.push(createFile(filesInfo[i]));
    }

    return Promise.all(promises);
  }

  function createFile(fileInfo) {
    return repo.createBlob(fileInfo.content).then((blob) => {
      filesToCommit.push({
        sha: blob.data.sha,
        path: fileInfo.path,
        mode: "100644",
        type: "blob",
      });
    });
  }

  function createTree() {
    return repo
      .createTree(filesToCommit, currentBranch.treeSHA)
      .then((tree) => {
        newCommit.treeSHA = tree.data.sha;
      });
  }

  function createCommit(message) {
    return repo
      .commit(currentBranch.commitSHA, newCommit.treeSHA, message)
      .then((commit) => {
        newCommit.sha = commit.data.sha;
      });
  }

  function updateHead() {
    return repo.updateHead("heads/" + currentBranch.name, newCommit.sha);
  }
}
module.exports = GithubAPI;
