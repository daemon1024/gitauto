const fs = require("fs");
const { push } = require("./gitcommit");

push({
  owner: "daemon1024",
  repo: "daemon1024.github.io",
  file: {
    path: "README.md",
    content: fs.readFileSync(__dirname + "/README.md", "utf-8")
  },
  Ref: "heads/master",
  commitMessage: "Check 1"
});
