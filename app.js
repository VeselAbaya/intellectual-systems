const Agent = require("./agent");
const Controller = require("./controller");
const initAgent = require("./socket");
const {TA} = require("./state-machine-lab5");
const VERSION = 7;

const [teamName, x, y] = process.argv.slice(2);

const agent1 = new Agent(x, y, { debug: false });
const agent2 = new Agent(x - 15, y - 7, { debug: true });
const agent3 = new Agent(-45, 0, { agentType: "(goalie)" });
const agent4 = new Agent(-49, 15, { });

// const targets = [
//   { act: "flag", name: "frb" },
//   { act: "flag", name: "gl" },
//   { act: "flag", name: "fc" },
//   { act: "kick", name: "b", goal: "gl" },
// ];

const controller1 = new Controller();
// controller1.setDecisionTree(firstPlayerTree(teamName));
agent1.setController(controller1);

const controller2 = new Controller();
// controller2.setDecisionTree(secondPlayerTree(teamName));
agent2.setController(controller2);

const controller3 = new Controller();
controller3.setStateMachine(TA);
agent3.setController(controller3);

const controller4 = new Controller();
agent4.setController(controller4);

setTimeout(() => {
  initAgent(agent1, teamName, VERSION);
}, 100);

setTimeout(() => {
  initAgent(agent2, teamName, VERSION);
}, 100);

setTimeout(() => {
  initAgent(agent3, 'VVVSASESFeFE', VERSION);
}, 100);

setTimeout(() => {
  initAgent(agent4, 'VVVSASESFeFE', VERSION);
}, 100);
