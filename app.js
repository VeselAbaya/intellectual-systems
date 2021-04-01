const Agent = require("./agent");
const socket = require("./socket");
const kickerSM = require("./kicker.state-machine");
const goalkeeperSM = require("./goalkeeper.state-machine");
const VERSION = 7;
const [team, playerType, x, y] = process.argv.slice(2);

let agent = new Agent(playerType, parseInt(x), parseInt(y), playerType === 'k' ? kickerSM : goalkeeperSM);
socket(agent, team, VERSION);
