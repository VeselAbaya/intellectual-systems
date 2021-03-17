const flagDecisionTree = {
  state: {
    next: 0,
    sequence: [
      // {act: "flag", flag: "frb"},
      // {act: "flag", flag: "gl"},
      { act: "kick", flag: "b", goal: "gr" },
    ],
    command: null,
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "goalVisible",
  },
  goalVisible: {
    condition: (mgr, state) => mgr.getVisibleFlag(state.action.flag),
    trueCond: "rootNext",
    falseCond: "rotate",
  },
  rotate: {
    exec(mgr, state) {
      state.command = { n: "turn", v: 15 };
    },
    next: "sendCommand",
  },
  rootNext: {
    condition: (mgr, state) => state.action.act === "flag",
    trueCond: "flagSeek",
    falseCond: "ballSeek",
  },
  flagSeek: {
    condition: (mgr, state) => mgr.getDistance(state.action.flag) < 4,
    trueCond: "closeFlag",
    falseCond: "farGoal",
  },
  closeFlag: {
    exec(mgr, state) {
      state.next++;
      state.action = state.sequence[state.next];
    },
    next: "rootNext",
  },
  farGoal: {
    condition: (mgr, state) => Math.abs(mgr.getAngle(state.action.flag)) > 4,
    trueCond: "rotateToGoal",
    falseCond: "runToGoal",
  },
  rotateToGoal: {
    exec(mgr, state) {
      state.command = {
        n: "turn",
        v: mgr.getAngle(state.action.flag) / 4,
      };
    },
    next: "sendCommand",
  },
  runToGoal: {
    exec(mgr, state) {
      state.command = { n: "dash", v: 45 };
    },
    next: "sendCommand",
  },
  sendCommand: {
    command: (mgr, state) => state.command,
  },
  ballSeek: {
    condition: (mgr, state) => mgr.getDistance(state.action.flag) <= 0.5,
    trueCond: "closeBall",
    falseCond: "farGoal",
  },
  closeBall: {
    condition: (mgr, state) => mgr.getVisibleFlag(state.action.goal),
    trueCond: "ballGoalVisible",
    falseCond: "ballGoalInvisible",
  },
  ballGoalVisible: {
    exec(mgr, state) {
      state.command = {
        n: "kick",
        v: `100 ${mgr.getAngle(state.action.goal)}`,
      };
    },
    next: "sendCommand",
  },
  ballGoalInvisible: {
    exec(mgr, state) {
      state.command = {
        n: "kick",
        v: "5 65",
      };
    },
    next: "sendCommand",
  },
};

const twoPlayersDecisionTree = (team) => ({
  ...flagDecisionTree,
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "teammateVisible",
  },
  teammateVisible: {
    condition: (mgr, state) => mgr.getVisiblePlayerFromTeam(team),
    trueCond: "closeTeammate",
    falseCond: "goalVisible",
  },
  closeTeammate: {
    condition: (mgr, state) => {
      const { distance, direction } = mgr.getVisiblePlayerFromTeam(team);
      return distance < 2 && Math.abs(direction) < 25;
    },
    trueCond: "rotateFromTeammate",
    falseCond: "farTeammate",
  },
  farTeammate: {
    condition: (mgr, state) => mgr.getVisiblePlayerFromTeam(team).distance > 10,
    trueCond: "lookingDirectlyToTeammate",
    falseCond: "lookingApproximatelyToTeammate",
  },
  lookingDirectlyToTeammate: {
    condition: (mgr, state) =>
      Math.abs(mgr.getVisiblePlayerFromTeam(team).direction) > 5,
    trueCond: "turnToTeammate",
    falseCond: "dashToTeammate",
  },
  lookingApproximatelyToTeammate: {
    condition: (mgr, state) => {
      const direction = Math.abs(mgr.getVisiblePlayerFromTeam(team).direction);
      return direction < 25 || direction > 40;
    },
    trueCond: "stayLeftToTeammate",
    falseCond: "stayNearToTeammate",
  },
  turnToTeammate: {
    exec: (mgr, state) =>
      (state.command = {
        n: "turn",
        v: mgr.getVisiblePlayerFromTeam(team).direction / 3,
      }),
    next: "sendCommand",
  },
  stayLeftToTeammate: {
    exec: (mgr, state) =>
      (state.command = {
        n: "turn",
        v: mgr.getVisiblePlayerFromTeam(team).direction - 15,
      }),
    next: "sendCommand",
  },
  dashToTeammate: {
    exec: (mgr, state) => (state.command = { n: "dash", v: 90 }),
    next: "sendCommand",
  },
  rotateFromTeammate: {
    exec: (mgr, state) => (state.command = { n: "turn", v: 40 }),
    next: "sendCommand",
  },
  stayNearToTeammate: {
    exec: (mgr, state) =>
      (state.command = {
        n: "dash",
        v: mgr.getVisiblePlayerFromTeam(team).distance < 7 ? 20 : 40,
      }),
    next: "sendCommand",
  },
});

const goalKeeperDecisionTree = {
  state: {
    next: 0,
    sequence: [
      { act: "flag", fl: "gr", maxDistance: 3, minDistance: 1 },
      { act: "kick", fl: "b", goal: "gl", minDistance: 0.5 },
    ],
    command: null,
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "goalVisible",
  },
  goalVisible: {
    condition: (mgr, state) => mgr.getVisibleFlag(state.action.fl),
    trueCond: "rootNext",
    falseCond: "rotate",
  },
  rotate: {
    exec(mgr, state) {
      state.command = {
        n: "turn",
        v: "15",
      };
    },
    next: "sendCommand",
  },
  rootNext: {
    condition: (mgr, state) => state.action.act === "flag",
    trueCond: "flagSeek",
    falseCond: "rotateToBall",
  },
  flagSeek: {
    condition: (mgr, state) =>
      mgr.getDistance(state.action.fl) < state.action.maxDistance,
    trueCond: "checkMinDistance",
    falseCond: "farGoal",
  },
  checkMinDistance: {
    condition: (mgr, state) =>
      state.action.minDistance &&
      mgr.getDistance(state.action.fl) <= state.action.minDistance,
    trueCond: "tooCloseGoal",
    falseCond: "closeFlag",
  },
  closeFlag: {
    exec(mgr, state) {
      state.next++;
      state.action = state.sequence[state.next];
    },
    next: "rootNext",
  },
  tooCloseGoal: {
    condition: (mgr, state) => mgr.getAngle(state.action.fl) > 4,
    trueCond: "rotateToGoal",
    falseCond: "runFromGoal",
  },
  runFromGoal: {
    exec(mgr, state) {
      state.command = {
        n: "dash",
        v: -100,
      };
    },
    next: "sendCommand",
  },
  farGoal: {
    condition: (mgr, state) => mgr.getAngle(state.action.fl) > 4,
    trueCond: "rotateToGoal",
    falseCond: "runToGoal",
  },
  rotateToGoal: {
    exec(mgr, state) {
      state.command = {
        n: "turn",
        v: mgr.getAngle(state.action.fl) / 4,
      };
    },
    next: "sendCommand",
  },
  runToGoal: {
    exec(mgr, state) {
      state.command = {
        n: "dash",
        v: mgr.getDistance(state.action.fl) > 3 ? 100 : 30,
      };
    },
    next: "sendCommand",
  },
  rotateToBall: {
    condition: (mgr, state) => mgr.getAngle(state.action.fl) > 4,
    trueCond: "rotateToGoal",
    falseCond: "checkMaxDistanceToBall",
  },
  checkMinDistanceToBall: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) > 1.5,
    trueCond: "farGoal",
    falseCond: "checkDistanceForKickAndCatch",
  },
  checkMaxDistanceToBall: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) < 28,
    trueCond: "checkMinDistanceToBall",
    falseCond: "rotateToGoal",
  },
  checkDistanceForKickAndCatch: {
    condition: (mgr, state) => {
      let myPos = mgr.getMyPos();
      return myPos ? myPos.x > 40 && Math.abs(myPos.y) < 10 : true;
    },
    trueCond: "doCatch",
    falseCond: "checkDistanceForKick",
  },
  checkDistanceForKick: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) <= 0.5,
    trueCond: "doKick",
    falseCond: "farGoal",
  },
  doCatch: {
    exec(mgr, state) {
      state.command = {
        n: "catch",
        v: String(mgr.getAngle(state.action.fl)),
      };
    },
    next: "sendCommand",
  },
  doKick: {
    condition: (mgr, state) => mgr.getVisibleFlag(state.action.goal),
    trueCond: "ballGoalVisible",
    falseCond: "ballGoalInvisible",
  },
  ballGoalVisible: {
    exec(mgr, state) {
      state.command = {
        n: "kick",
        v: `100 ${mgr.getAngle(state.action.goal)}`,
      };
      setTimeout(() => state.next = 0, 100);
    },
    next: "sendCommand",
  },
  ballGoalInvisible: {
    exec(mgr, state) {
      state.command = {
        n: "kick",
        v: "10 45",
      };
    },
    next: "sendCommand",
  },
  sendCommand: {
    command: (mgr, state) => state.command,
  },
};

module.exports = {
  flagDecisionTree,
  twoPlayersDecisionTree,
  goalKeeperDecisionTree,
};
