const Agent = require("./agent");
const Controller = require("./controller");
const initAgent = require("./socket");
const VERSION = 7;

const [teamName, x, y] = process.argv.slice(2);

const agent1 = new Agent({ debug: true });

const initPos = {
  x: x || -15,
  y: y || 0,
};

const targets = [
  { act: "flag", name: "frb" },
  { act: "flag", name: "gl" },
  { act: "flag", name: "fc" },
  { act: "kick", name: "b", goal: "gr" },
];

const controller = new Controller(initPos, targets);
agent1.setController(controller);
initAgent(agent1, teamName || "a", VERSION);

setTimeout(() => {
  controller.restartAgentPosition();
}, 500);
