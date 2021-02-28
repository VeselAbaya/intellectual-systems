const elparser = require("elparser");
const { Flags } = require("./constants");
const Controller = require("./controller");
const { calcPlayerCoordsByFlags, calcOtherDistance2 } = require("./utils");
// const readline = require("readline");

class Agent {
  constructor({ debug } = { debug: false }) {
    this._debug = debug;
    this.side = "l";
    this.run = false;
    this.act = null;
    this.pos = {
      x: undefined,
      y: undefined,
    };
    // this.rl = readline.createInterface({
    //   // Чтение консоли
    //   input: process.stdin,
    //   output: process.stdout,
    // });
    // this.rl.on("line", (input) => {
    //   if (this.run) {
    //     // Если игра начата
    //     // Движения вперед, вправо, влево, удар по мячу
    //     if ("w" == input) this.act = { n: "dash", v: 100 };
    //     if ("d" == input) this.act = { n: "turn", v: 20 };
    //     if ("a" == input) this.act = { n: "turn", v: -20 };
    //     if ("s" == input) this.act = { n: "kick", v: 100 };
    //   }
    // });
  }

  setController(controller) {
    this.controller = controller;
    this.controller.setAgent(this);
  }

  msgGot(msg) {
    let data = msg.toString("utf8");
    this.processMsg(data);
    this.sendAction(this.act);
  }

  setSocket(socket) {
    this.socket = socket;
  }

  socketSend(cmd, value) {
    this.socket.sendMsg(`(${cmd} ${value})`);
  }

  processMsg(msg) {
    const parsedMsg = elparser.parse1(msg.replace("\0", "").trim()).toJS();
    const [cmd, ...params] = parsedMsg;

    if (cmd == "init") this.initAgent(params);
    this.controller.analyzeEnv(cmd, params);
  }

  initAgent(p) {
    if (p[0] == "r") this.side = "r";
    if (p[1]) this.id = p[1];
  }

  // setAction(name, params) {
  //   this.act = {
  //     n: name,
  //     v: params,
  //   };
  // }

  sendAction(action) {
    if (this.run && action) {
      if (action.n === "kick") this.socketSend(action.n, action.v + " 0");
      else this.socketSend(action.n, action.v);
    }
  }

  doNothing() {
    this.act = null;
  }

  _log(...args) {
    this._debug && console.log(...args);
  }
}

module.exports = Agent;
