const { Flags, distanceLimits } = require("./constants");
const {
  calcObjectCoordsByFlags,
  calcCosTheorem,
  toDeg,
  kinematicAngularSeek,
} = require("./utils");
const Manager = require("./manager");

module.exports = class Controller {
  constructor() {
    this.agent = undefined;
    this.seenObjects = [];
    this.flagsData = [];
    this.gatesData = [];
    this.otherPlayers = [];
    this.ballData = [];
    this.manager = new Manager();
    this.decisionTree = null;

    this.senseBody = {};
  }

  setAgent(agent) {
    this.agent = agent;
  }

  setDecisionTree(decisionTree) {
    this.decisionTree = decisionTree;
  }

  restartAgentPosition() {
    this.agent.socketSend(
      "move",
      `${this.agent.initPos.x} ${this.agent.initPos.y}`
    );
    this.agent.pos = Object.assign({}, this.agent.initPos);
  }

  parseSeenObjects(seenObjects) {
    let flags = [];
    let otherPlayers = [];
    let gates = [];
    let ball = {};
    seenObjects.forEach((o) => {
      switch (o.name[0]) {
        case "f":
          const fCoords = Flags[o.name.join("")];
          o.x = fCoords.x;
          o.y = fCoords.y;
          flags.push(o);
          break;
        case "p":
          otherPlayers.push(o);
          break;
        case "b":
          ball = o;
          break;
        case "g":
          const gCoords = Flags[o.name.join("")];
          o.x = gCoords.x;
          o.y = gCoords.y;
          gates.push(o);
          break;
        default:
          break;
      }
    });

    return [flags, otherPlayers, gates, ball];
  }

  takeThreeFlags(flagsData) {
    const threeFlags = [];
    const coordsCount = new Set();

    //take 3 or less flags as base
    for (let f of flagsData) {
      if (threeFlags.length >= 3) break;
      if (!coordsCount.has(f.x) && !coordsCount.has(f.y)) {
        coordsCount.add(f.x);
        coordsCount.add(f.y);
        threeFlags.push(f);
      }
    }
    return threeFlags;
  }

  analyzeEnv(cmd, params) {
    const [time, ...info] = params;

    if (cmd == "init") {
      this.agent.initAgent(params);
      this.restartAgentPosition();
      return;
    } else if (cmd == "hear") {
      if (info[0] == "referee") {
        if (info[1] == "play_on") this.agent.run = true;
        else if (info[1].startsWith("goal")) {
          this.agent.run = false;
          setTimeout(() => this.restartAgentPosition(), 500);
        }
      } else {
        this.manager.setHearData({
          time: time,
          sender: info[0],
          msg: info[1],
        });
      }
      return;
    } else if (cmd == "see") {
      this.seenObjects = info.map(
        ([
          name,
          distance,
          direction,
          distChange,
          dirChange,
          bodyFacingDir,
          deadFacingDir,
        ]) => ({
          name,
          distance,
          direction,
          distChange,
          dirChange,
          bodyFacingDir,
          deadFacingDir,
        })
      );
    } else if (cmd == "sense_body") {
      const [
        [viewMode, ...viewArgs],
        [stamina, staminaEffort],
        [speed, ...speedArgs],
        [headAngle, hAngle],
        ...counters
      ] = info;

      this.senseBody = {
        viewMode: viewArgs,
        stamina: staminaEffort,
        speed: speedArgs,
        headAngle: hAngle,
        counters: counters,
      };
    }

    if (
      !this.senseBody ||
      Object.keys(this.senseBody).length === 0 ||
      !this.seenObjects ||
      this.seenObjects.length === 0
    ) {
      return;
    }

    const [
      flagsData,
      otherPlayers,
      gatesData,
      ballData,
    ] = this.parseSeenObjects(this.seenObjects);

    this.flagsData = flagsData;
    this.otherPlayers = otherPlayers;
    this.gatesData = gatesData;
    this.ballData = ballData;

    const threeFlags = this.takeThreeFlags(this.flagsData);
    this.agent.pos = calcObjectCoordsByFlags(threeFlags);
    this.otherPlayers.forEach((player) => {
      const otherPlayerPos = calcObjectCoordsByFlags([
        {
          x: this.agent.pos.x,
          y: this.agent.pos.y,
          distance: player.distance,
        },
        {
          x: threeFlags[0].x,
          y: threeFlags[0].y,
          distance: calcCosTheorem(
            threeFlags[0].direction,
            player.direction,
            threeFlags[0].distance,
            player.distance
          ),
        },
        threeFlags[1] && {
          x: threeFlags[1].x,
          y: threeFlags[1].y,
          distance: calcCosTheorem(
            threeFlags[1].direction,
            player.direction,
            threeFlags[1].distance,
            player.distance
          ),
        },
      ]);
      player.x = otherPlayerPos.x;
      player.y = otherPlayerPos.y;
    });
    const ballPos = calcObjectCoordsByFlags([
      {
        x: this.agent.pos.x,
        y: this.agent.pos.y,
        distance: ballData.distance,
      },
      {
        x: threeFlags[0].x,
        y: threeFlags[0].y,
        distance: calcCosTheorem(
          threeFlags[0].direction,
          ballData.direction,
          threeFlags[0].distance,
          ballData.distance
        ),
      },
      threeFlags[1] && {
        x: threeFlags[1].x,
        y: threeFlags[1].y,
        distance: calcCosTheorem(
          threeFlags[1].direction,
          ballData.direction,
          threeFlags[1].distance,
          ballData.distance
        ),
      },
    ]);
    this.ballData.x = ballPos.x;
    this.ballData.y = ballPos.y;

    this.manager.setSeenObjects({
      flagsData,
      otherPlayers,
      gatesData,
      ballData,
    });
    this.manager.myPos = this.agent.pos;

    if (this.decisionTree) {
      this.agent.act = this.manager.getAction(this.decisionTree);
    }
  }
};
