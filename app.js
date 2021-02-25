const Agent = require("./agent");
const initAgent = require("./socket");
const VERSION = 7;

const agent1 = new Agent({ debug: true });
const agent2 = new Agent();

const [teamName, x, y, turnAngle] = process.argv.slice(2);

initAgent(agent1, teamName, VERSION);
initAgent(agent2, teamName, VERSION);

setTimeout(() => {
  agent1.socketSend("move", `${x || -15} ${y || 0}`);
  agent1.setAction("turn", turnAngle || 5);
  agent2.socketSend("move", `-10 -10`);
}, 100);
