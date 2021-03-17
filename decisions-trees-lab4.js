const { flagDecisionTree } = require("./decisions-trees-lab3");

firstPlayerTree = (team) => ({
  ...flagDecisionTree,
  // дает пас
  state: {
    next: 0,
    sequence: [
      { act: "flag", flag: "fplc" },
      { act: "kick", flag: "b", goal: "p" },
      { act: "say" },
      { act: "stay" },
    ],
    command: null,
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "checkStay",
  },
  checkStay: {
    condition: (mgr, state) => {
      return state.action.act == "stay";
    },
    trueCond: "doNothing",
    falseCond: "checkSay",
  },
  checkSay: {
    condition: (mgr, state) => {
      return state.action.act == "say";
    },
    trueCond: "sayGo",
    falseCond: "goalVisible",
  },
  sayGo: {
    exec(mgr, state) {
      state.command = {
        n: "say",
        v: "go",
      };
    },
    next: "sendCommand",
  },
  doNothing: {
    exec(mgr, state) {
      state.command = {};
    },
    next: "sendCommand",
  },
  closeBall: {
    condition: (mgr, state) => {
      return mgr.getVisiblePlayerFromTeam(team);
    },
    trueCond: "ballGoalVisible",
    falseCond: "ballGoalInvisible",
  },
  ballGoalVisible: {
    exec(mgr, state) {
      player = mgr.getVisiblePlayerFromTeam(team);
      direction = player.direction;
      speed = Math.min(95, player.distance * 2);
      state.command = {
        n: "kick",
        v: `${speed} ${direction}`,
      };
      setTimeout(
        () =>
          (state.next = Math.min(state.next + 1, state.sequence.length - 1)),
        100
      );
    },
    next: "sendCommand",
  },
});

secondPlayerTree = (team) => ({
  ...flagDecisionTree,
  // дает пас
  state: {
    next: 0,
    sequence: [
      { act: "flag", flag: "fplc" },
      { act: "kick", flag: "b", goal: "p" },
      { act: "stay" },
    ],
    command: null,
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null;
    },
    next: "checkStay",
  },
  checkStay: {
    condition: (mgr, state) => {
      return state.action.act == "stay";
    },
    trueCond: "doNothing",
    falseCond: "goalVisible",
  },
  doNothing: {
    exec(mgr, state) {
      state.command = {};
    },
    next: "sendCommand",
  },
  closeBall: {
    condition: (mgr, state) => {
      return mgr.getVisiblePlayerFromTeam(team);
    },
    trueCond: "ballGoalVisible",
    falseCond: "ballGoalInvisible",
  },
  ballGoalVisible: {
    exec(mgr, state) {
      player = mgr.getVisiblePlayerFromTeam(team);
      direction = player.direction;
      speed = Math.min(95, player.distance * 2);
      state.command = {
        n: "kick",
        v: `${speed} ${direction}`,
      };
      setTimeout(
        () =>
          (state.next = Math.min(state.next + 1, state.sequence.length - 1)),
        100
      );
    },
    next: "sendCommand",
  },
});

module.exports = {
  firstPlayerTree,
  secondPlayerTree,
};
