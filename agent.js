const elparser = require("elparser");

class Agent {
  constructor(x, y, { debug, agentType } = { debug: false, agentType: '' }) {
    this._debug = debug;
    this._debugPrevAction = null;
    this.init;
    this.side = "l";
    this.run = false;
    this.act = null;
    this.controller = undefined;
    this.type = agentType || '';

    this.initPos = {
      x: x,
      y: y,
    };

    this.pos = Object.assign({}, this.initPos);

    this.acceleration = 0;
    this.orientation = 0;
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
    this.controller.analyzeEnv(cmd, params);
  }

  initAgent(p) {
    if (p[0] == "r") this.side = "r";
    if (p[1]) this.id = p[1];
  }

  sendAction(action) {
    if (JSON.stringify(this._debugPrevAction) !== JSON.stringify(action)) {
      this._log(action);
      this._debugPrevAction = action;
    }

    if (this.run && action) {
      this.socketSend(action.n, action.v);
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
