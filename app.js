const Agent = require("./agent");
const Controller = require("./controller");
const initAgent = require("./socket");
const {
  goalieStateMachine,
  playerStateMachine,
} = require("./state-machine-lab5");
const VERSION = 7;

const [x, y] = process.argv.slice(2);

const agent1 = new Agent(x, y, { debug: false });
const agent2 = new Agent(-40, 0, { debug: true, agentType: "(goalie)" });

// const targets = [
//   { act: "flag", name: "frb" },
//   { act: "flag", name: "gl" },
//   { act: "flag", name: "fc" },
//   { act: "kick", name: "b", goal: "gl" },
// ];

const controller1 = new Controller();
controller1.setStateMachine(playerStateMachine);
agent1.setController(controller1);

const controller2 = new Controller();
controller2.setStateMachine(goalieStateMachine);
agent2.setController(controller2);

setTimeout(() => {
  initAgent(agent1, "teama", VERSION);
}, 0);

setTimeout(() => {
  initAgent(agent2, "teamb", VERSION);
}, 1000);
