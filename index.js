const GithubAPI = require("./gitcommitpr");
const editMarkdown = require("./editmarkdown");
require("dotenv").config();

async function index() {
  let meetupData = {
    date: "2020-01-01",
    topic: "Dk",
    details: "Doesn't matter",
    speaker: "someone on earth",
  };
  let readmecontent = await editMarkdown(meetupData);
  console.log("Markdown fetched and edited");
  let api = new GithubAPI({
    token: process.env.GITHUB_TOKEN,
  });
  api.setRepo("daemon1024", "meetups");
  console.log("repo set to daemon1024/meetups");
  api
    .setBranch("test")
    .then(() => {
      console.log("pushing files");
      api.pushFiles("Testing ENV", [
        { content: readmecontent, path: "README.md" },
      ]);
    })
    .then(function () {
      console.log("Files committed!");
    })
    .then(() => {
      api
        .createpr({
          title: "Amazing new feature",
          body: "Please pull these awesome changes in!",
          head: "test",
          base: "master",
        })
        .then(() => console.log("made a pr"));
    });
}
index();
