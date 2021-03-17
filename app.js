const Agent = require("./agent");
const Controller = require("./controller");
const initAgent = require("./socket");
const { firstPlayerTree } = require("./decisions-trees-lab4");
const VERSION = 7;

const [teamName, x, y] = process.argv.slice(2);

const agent1 = new Agent(x, y, { debug: false });
const agent2 = new Agent(x - 15, y - 7, { debug: false });
// const agent3 = new Agent(-45, 0, { debug: true, agentType: "(goalie)" });

// const targets = [
//   { act: "flag", name: "frb" },
//   { act: "flag", name: "gl" },
//   { act: "flag", name: "fc" },
//   { act: "kick", name: "b", goal: "gl" },
// ];

const controller1 = new Controller();
controller1.setDecisionTree(firstPlayerTree(teamName));
agent1.setController(controller1);

const controller2 = new Controller();
agent2.setController(controller2);

// const controller3 = new Controller(targets);
// controller3.setDecisionTree(goalKeeperDecisionTree);
// agent3.setController(controller3);

setTimeout(() => {
  initAgent(agent1, teamName, VERSION);
}, 100);

setTimeout(() => {
  initAgent(agent2, teamName, VERSION);
}, 100);
