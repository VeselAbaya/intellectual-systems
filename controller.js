const { Flags } = require("./constants");
const { calcPlayerCoordsByFlags, calcOtherDistance2 } = require("./utils");

const TargetState = Object.freeze({ lookup: 1, seek: 2, done: 3 });

module.exports = class Controller {
  constructor(initPos = {}, targets = []) {
    this.targets = targets;
    this.targetIdx = 0;
    this.initPos = initPos;
    this.agent = undefined;
    this.seenObjects = [];
    this.speed = 5;
    this.reachDist = 3;
    this.targetState = TargetState.lookup;
  }

  setAgent(agent) {
    this.agent = agent;
  }

  restartAgentPosition() {
    this.agent.pos = this.initPos;
    this.agent.socketSend("move", `${this.agent.pos.x} ${this.agent.pos.y}`);
    this.targetIdx = 0;
  }

  calcCoords(seenObjects) {
    const flagsData = [];
    const otherPlayers = [];

    seenObjects.forEach((o) => {
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

    this.agent.pos = calcPlayerCoordsByFlags(baseFlags);
    this.agent._log(`px: ${this.agent.pos.x} py: ${this.agent.pos.y}`);

    //   this.otherPlayersCoords = [];
    //   otherPlayers.forEach((player) => {
    //     const otherPlayerPos = calcPlayerCoordsByFlags([
    //       {
    //         x: this.agent.pos.x,
    //         y: this.agent.pos.y,
    //         distance: player.distance,
    //       },
    //       {
    //         x: baseFlags[0].x,
    //         y: baseFlags[0].y,
    //         distance: calcOtherDistance2(
    //           baseFlags[0].direction,
    //           player.direction,
    //           baseFlags[0].distance,
    //           player.distance
    //         ),
    //       },
    //       {
    //         x: baseFlags[1].x,
    //         y: baseFlags[1].y,
    //         distance: calcOtherDistance2(
    //           baseFlags[1].direction,
    //           player.direction,
    //           baseFlags[1].distance,
    //           player.distance
    //         ),
    //       },
    //     ]);

    // otherPlayerPos.name = player.name.join("");
    // this.otherPlayersCoords.push(otherPlayerPos);
    //   });
    //   this.agent._log(this.otherPlayersCoords);
  }

  analyzeEnv(cmd, params) {
    const [time, ...info] = params;
    if (cmd == "hear" && info[0] == "referee") {
      if (info[1] == "play_on") this.agent.run = true;
      else if (info[1].startsWith("goal")) {
        this.agent.run = false;
        setTimeout(() => {
          this.restartAgentPosition();
        }, 500);
      }
      return;
    }

    if (cmd == "see") {
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
      this.calcCoords(this.seenObjects);
    }
    if (!this.targets || this.targetIdx >= this.targets.length) return;

    const currentTarget = this.targets[this.targetIdx];
    const targetData = this.seenObjects.find((o) =>
      o.name.join("").startsWith(currentTarget.name)
    );

    this.agent.act = this.chaseTarget(targetData);
  }

  chaseTarget(target) {
    let action = undefined;
    switch (this.targetState) {
      case TargetState.lookup:
        if (!target) {
          action = {
            n: "turn",
            v: 8,
          };
        } else if (Math.abs(target.direction) >= 2) {
          action = {
            n: "turn",
            v: target.direction / 4,
          };
        } else {
          this.targetState = TargetState.seek;
        }
        break;
      case TargetState.seek:
        if (target.distance >= this.reachDist) {
          action = {
            n: "dash",
            v: 100,
          };
        } else {
          this.targetState = TargetState.done;
        }
        break;
      case TargetState.done:
        this.targetIdx++;
        this.targetState = TargetState.lookup;
        break;
    }
    return action;
  }
};
