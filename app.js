const Agent = require("./agent");
const VERSION = 7;
const teamName = "teamA";
const agent = new Agent();
require("./socket")(agent, teamName, VERSION);

const [x, y] = process.argv.slice(2);

setTimeout(() => {
  agent.socketSend("move", `${x || -15} ${y || 0}`);
}, 100);
