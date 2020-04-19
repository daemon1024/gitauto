const axios = require("axios");
let newrow = "\n|TBA|TBA|TBA|TBA|TBA|";
const editMarkdown = async (meetupData) => {
  console.log(meetupData);
  md = await axios.get(
    "https://raw.githubusercontent.com/daemon1024/meetups/master/README.md"
  );
  md = md.data.replace(/TBA/, meetupData.date);
  md = md.replace(/TBA/, meetupData.topic);
  md = md.replace(/TBA/, meetupData.details);
  md = md.replace(/TBA/, meetupData.speaker);
  md = md.replace(/TBA/, "uploaded soon" + newrow);
  return md;
};
module.exports = editMarkdown;
