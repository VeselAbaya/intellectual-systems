const Msg = require("./msg");
const Manager = require("./manager");

class Agent {
  constructor(playerType, x = 0, y = 0, ta) {
    this.position = "l";
    this.run = false;
    this.isMoved = false;
    this.turnSpeed = -5;
    this.coord = { x, y };
    this.isLock = false;
    this.angle = 0;
    this.speed = 0;
    this.playerType = playerType;
    this.act = null;
    this.taManager = new Manager();
    this.ta = ta;

    if (!this.run && !this.isMoved) {
      this.isMoved = true;
      setTimeout(() => this.socketSend("move", x + " " + y), 1000);

      if (this.playerType === "g") {
        this.teamName = "goalieTeam";
      } else {
        this.teamName = "teamA";
      }
    }
  }

  msgGot(msg) {

    let data = msg.toString("utf8");
    this.processMsg(data);
  }

  setSocket(socket) {
    this.socket = socket;
  }

  socketSend(cmd, value) {
    this.socket.sendMsg(`(${cmd} ${value})`);
  }

  processMsg(msg) {
    let data = Msg.parseMsg(msg);
    if (!data) throw new Error("Parse error \n" + msg);
    if (data.cmd === "hear" && data.msg.includes("play_on")) {
      this.run = true;
    }

    if (data.cmd === "hear" && data.msg.includes("goal")) {
      this.run = false;
    }

    if (data.cmd === "init") this.initAgent(data.p);
    this.analyzeEnv(data.msg, data.cmd, data.p);
  }

  initAgent(p) {
    if (p[0] === "r") this.position = "r";
    if (p[1]) this.id = p[1];
  }

  analyzeEnv(msg, cmd, p) {
    if (cmd === "see" && this.run && this.isMoved) {
      var action = this.taManager.getAction(
        p,
        this.ta,
        this.teamName,
        this.position
      );
      if (action !== undefined) {
        this.socketSend(action.n, action.v);
      }
    }
  }
}

module.exports = Agent;
