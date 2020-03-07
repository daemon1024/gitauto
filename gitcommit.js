const { Octokit } = require("@octokit/rest");
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;
const github = new Octokit({
  auth: GITHUB_API_TOKEN
});

export const push = options => {
  let data = {};
  return getReferenceCommit(options, data)
    .then(() => {
      return github.git
        .createBlob({
          owner: options.owner,
          repo: options.repo,
          content: options.file.content,
          encoding: "utf-8"
        })
        .then(blob => {
          console.log(blob);
          return {
            sha: blob.data.sha,
            path: options.file.path,
            mode: "100644",
            type: "blob"
          };
        });
    })
    .then(file => {
      console.log(file);
      return github.git.createTree(
        {
          owner: options.owner,
          repo: options.repo,
          tree: file,
          base_tree: data.referenceCommitSha
        },
        (err, res) => {
          if (err) {
            console.log(err);
          }
          return res;
        }
      );
    })
    .then(res => console.log(res));
};

const getReferenceCommit = (options, data) =>
  github.git
    .getRef(
      {
        owner: options.owner,
        repo: options.repo,
        ref: options.Ref
      },
      (err, res) => {
        if (err) {
          console.log(err);
        }
        return res;
      }
    )
    .then(sha => (data.referenceCommitSha = sha.data.object.sha));

const createCommit = (options, data) =>
  github.git
    .createCommit(
      {
        owner: options.owner,
        repo: options.repo,
        message: options.commitMessage,
        tree: data.newTreeSha,
        parents: [data.referenceCommitSha]
      },
      (err, res) => {
        if (err) {
          console.log(err);
        }
        return res.data.sha;
      }
    )
    .then(sha =>
      github.git.updateRef(
        {
          owner: options.owner,
          repo: options.repo,
          ref: options.Ref,
          sha: sha
        },
        (err, res) => {
          if (err) {
            console.log(err);
          }
          console.log(res);
        }
      )
    );
