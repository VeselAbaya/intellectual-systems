const {Actions} = require('./constants');

module.exports = class Manager {
  constructor() {
    this.flagsData = [];
    this.otherPlayers = [];
    this.gatesData = [];
    this.ballData = [];
    this.myPos = {}
  }

  getAction(decisionTree) {
    const execute = (dt, title) => {
      const action = dt[title];
      if (typeof action.exec == "function") {
        action.exec(this, dt.state);
        return execute(dt, action.next);
      }
      if (typeof action.condition == "function") {
        const cond = action.condition(this, dt.state);
        return execute(dt, cond ? action.trueCond : action.falseCond);
      }
      if (typeof action.command == "function") {
        return action.command(this, dt.state);
      }
      throw new Error(`Unexpected node in DT: ${title}`)
    }

    return execute(decisionTree, "root")
  }

  getMyPos() {
    return this.myPos;
  }

  setSeenObjects({flagsData, otherPlayers, gatesData, ballData}) {
    this.flagsData = flagsData;
    this.otherPlayers = otherPlayers;
    this.gatesData = gatesData;
    this.ballData = ballData;
  }

  getVisibleFlag(flagName) {
    return this._findFlag(flagName);
  }

  getVisiblePlayerFromTeam(teamName) {
    return this._findPlayerFromTeam(teamName);
  }

  getDistance(flagName) {
    const flag = this._findFlag(flagName);
    return flag ? flag.distance : NaN;
  }

  getAngle(flagName) {
    const flag = this._findFlag(flagName);
    return flag ? flag.direction : NaN;
  }

  _findFlag(flagName) {
    return [...this.flagsData, ...this.gatesData, this.ballData].find(({name}) => name && (flagName === name.join('')));
  }

  _findPlayerFromTeam(teamName) {
    return this.otherPlayers.find(({name}) => name.includes(teamName));
  }
}
