const Agent = require("./agent");
const Controller = require("./controller");
const initAgent = require("./socket");
const VERSION = 7;

const [teamName, x, y] = process.argv.slice(2);

const agent1 = new Agent(x, y, { debug: true });

const targets = [
  { act: "flag", name: "frb" },
  { act: "flag", name: "gl" },
  { act: "flag", name: "fc" },
  { act: "kick", name: "b", goal: "gl" },
];

const controller = new Controller(targets);
agent1.setController(controller);

setTimeout(() => {
  initAgent(agent1, teamName || "a", VERSION);
}, 100);
