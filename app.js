const Agent = require("./agent");
const VERSION = 7;
const teamName = "teamA";

const agent1 = new Agent();
// const agent2 = new Agent();

require("./socket")(agent1, teamName, VERSION);
// require("./socket")(agent2, teamName, VERSION);

const [x, y, turnAngle] = process.argv.slice(2);

setTimeout(() => {
  agent1.socketSend("move", `${x || -15} ${y || 0}`);
  agent1.setAction("turn", turnAngle);
}, 100);
