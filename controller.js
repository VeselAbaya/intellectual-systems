const Victor = require("victor");
const { Flags, distanceLimits } = require("./constants");
const {
  calcObjectCoordsByFlags,
  calcСosTheorem,
  toDeg,
  kinematicAngularSeek,
} = require("./utils");

const TargetState = Object.freeze({ find: 1, adjust: 2, seek: 3, done: 5 });

module.exports = class Controller {
  constructor(targets = []) {
    this.targets = targets;
    this.targetIdx = 0;
    this.initTargetsLen = targets.length;
    this.agent = undefined;
    this.seenObjects = [];
    this.flagsData = [];
    this.gatesData = [];
    this.otherPlayers = [];
    this.ballData = [];

    this.senseBody = {};

    this.targetState = TargetState.lookup;
  }

  setAgent(agent) {
    this.agent = agent;
  }

  restartAgentPosition() {
    this.agent.socketSend(
      "move",
      `${this.agent.initPos.x} ${this.agent.initPos.y}`
    );
    this.agent.pos = Object.assign({}, this.agent.initPos);
    this.targetIdx = 0;
    this.targets = this.targets.slice(0, this.initTargetsLen);
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
    } else if (cmd == "hear" && info[0] == "referee") {
      if (info[1] == "play_on") this.agent.run = true;
      else if (info[1].startsWith("goal")) {
        this.agent.run = false;
        setTimeout(() => this.restartAgentPosition(), 500);
      }
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
      // const [speedValue, angle] = speedArgs;
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
    // this.otherPlayers = [];
    // otherPlayers.forEach((player) => {
    //   const otherPlayerPos = calcObjectCoordsByFlags([
    //     {
    //       x: this.agent.pos.x,
    //       y: this.agent.pos.y,
    //       distance: player.distance,
    //     },
    //     {
    //       x: threeFlags[0].x,
    //       y: threeFlags[0].y,
    //       distance: calcСosTheorem(
    //         threeFlags[0].direction,
    //         player.direction,
    //         threeFlags[0].distance,
    //         player.distance
    //       ),
    //     },
    //     {
    //       x: threeFlags[1].x,
    //       y: threeFlags[1].y,
    //       distance: calcСosTheorem(
    //         threeFlags[1].direction,
    //         player.direction,
    //         threeFlags[1].distance,
    //         player.distance
    //       ),
    //     },
    //   ]);
    //   otherPlayerPos.name = player.name.join("");
    //   this.otherPlayers.push(otherPlayerPos);
    // });
    // const ballPos = calcObjectCoordsByFlags([
    //   {
    //     x: this.agent.pos.x,
    //     y: this.agent.pos.y,
    //     distance: ballData.distance,
    //   },
    //   {
    //     x: threeFlags[2].x,
    //     y: threeFlags[2].y,
    //     distance: calcСosTheorem(
    //       threeFlags[2].direction,
    //       ballData.direction,
    //       threeFlags[2].distance,
    //       ballData.distance
    //     ),
    //   },
    //   {
    //     x: threeFlags[1].x,
    //     y: threeFlags[1].y,
    //     distance: calcСosTheorem(
    //       threeFlags[1].direction,
    //       ballData.direction,
    //       threeFlags[1].distance,
    //       ballData.distance
    //     ),
    //   },
    // ]);
    if (this.targetIdx >= this.targets.length) return;
    const targetInfo = this.targets[this.targetIdx];
    let targetData = this.seenObjects.find((o) =>
      o.name.join("").startsWith(targetInfo.name)
    );
    this.seekTarget(targetData, targetInfo);
  }

  getTargetState(targetData, targetInfo) {
    if (!targetData) {
      return TargetState.find;
    } else if (Math.abs(targetData.direction) >= 1.5) {
      return TargetState.adjust;
    } else if (targetData.distance >= distanceLimits[targetInfo.act]) {
      return TargetState.seek;
    } else {
      return TargetState.done;
    }
  }

  seekTarget(targetData, targetInfo) {
    const state = this.getTargetState(targetData, targetInfo);
    switch (state) {
      case TargetState.find:
        this.agent.act = {
          n: "turn",
          v: 5,
        };
        break;
      case TargetState.adjust:
        this.agent.act = {
          n: "turn",
          v: targetData.direction / 2,
        };
        break;
      case TargetState.seek:
        if (targetData.distance >= distanceLimits.slowdown) {
          this.agent.acceleration += 5;
          this.agent.acceleration = Math.min(this.agent.acceleration, 90);
          this.agent.act = {
            n: "dash",
            v: this.agent.acceleration,
          };
        } else {
          this.agent.acceleration -= 5;
          this.agent.acceleration = Math.max(40, this.agent.acceleration);
          this.agent.act = {
            n: "dash",
            v: this.agent.acceleration,
          };
        }
        break;

      case TargetState.done:
        if (targetInfo.act == "kick") {
          const targetGates = this.gatesData.find((g) =>
            g.name.join("").startsWith(targetInfo.goal)
          );
          // console.log(this.gatesData, targetGatesName, targetGates);
          if (!targetGates) {
            this.agent.act = {
              n: "kick",
              v: `8 65`,
            };
          } else {
            this.agent.act = {
              n: "kick",
              v: `80 ${targetGates.direction}`,
            };
          }
          this.targets.push({
            act: "kick",
            name: "b",
            goal: targetInfo.goal,
          });
        }
        this.targetIdx += 1;
        break;

      default:
        this.agent.doNothing();
        break;
    }
  }
};
