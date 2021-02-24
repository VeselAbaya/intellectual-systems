const elparser = require("elparser");
const { Flags } = require("./constants");
const { calcPlayerCoordsByFlags, calcOtherDistance2 } = require("./utils");

// const readline = require("readline");
class Agent {
  constructor() {
    this.position = "l";
    this.run = false;
    this.act = null;
    this.pos = {
      px: undefined,
      py: undefined,
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
    this.analyzeEnv(cmd, params);
  }

  initAgent(p) {
    if (p[0] == "r") this.position = "r";
    if (p[1]) this.id = p[1];
  }

  setAction(cmd, value) {
    this.act = {
      n: cmd,
      v: value,
    };
  }

  getAction() {
    this.analyzeEnv();
    return this.act || null;
  }

  analyzeEnv(cmd, params) {
    const [time, ...info] = params;
    if (cmd == "hear" && info[0] == "referee" && info[1] == "kick_off_l") {
      this.run = true;
    } else if (cmd == "see") {
      let objects = info.map(
        ([
          name,
          distance,
          direction,
          distChange,
          dirChange,
          bodyFacingDir,
          deadFacingDir,
        ]) => {
          return {
            name: name,
            distance: distance,
            direction: direction,
            distChange: distChange,
            dirChange: dirChange,
            bodyFacingDir: bodyFacingDir,
            deadFacingDir: deadFacingDir,
          };
        }
      );

      let flagsData = [];
      let otherPlayers = [];

      objects.forEach((o) => {
        switch (o.name[0]) {
          case "f":
            const fCoords = Flags[o.name.join("")];
            fCoords.distance = o.distance;
            fCoords.direction = o.direction;
            flagsData.push(fCoords);
            break;
          case "p":
            otherPlayers.push(o);
            break;
          default:
            break;
        }
      });

      const baseFlags = [];
      const coordsCount = new Set();

      //take 3 or less flags as base
      for (let f of flagsData) {
        if (baseFlags.length >= 3) break;
        if (!coordsCount.has(f.x) && !coordsCount.has(f.y)) {
          coordsCount.add(f.x);
          coordsCount.add(f.y);
          baseFlags.push(f);
        }
      }
      this.pos = calcPlayerCoordsByFlags(baseFlags);
      console.log(`px: ${this.pos.px} py: ${this.pos.py}`);
    }
  }

  sendAction(action) {
    if (this.run && action) {
      if (action.n === "kick") this.socketSend(action.n, action.v + " 0");
      else this.socketSend(action.n, action.v);
    }
  }
}

module.exports = Agent;
