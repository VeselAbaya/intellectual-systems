const Agent = require("./agent");
const VERSION = 7;

const agent1 = new Agent({debug: true});
const agent2 = new Agent();

require("./socket")(agent1, "teamA", VERSION);
require("./socket")(agent2, "teamS", VERSION);


setTimeout(() => {
  const [x, y, turnAngle] = process.argv.slice(2);
  agent1.socketSend("move", `${x || -15} ${y || 0}`);
  agent1.setAction("turn", turnAngle);
  agent2.socketSend("move", "-25 6")
}, 100);
