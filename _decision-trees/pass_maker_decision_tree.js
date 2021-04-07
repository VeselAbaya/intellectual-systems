const FL = "flag", PS = "pass", ST= "stop", SAY = "say"
const DT = {
  state: {
    next: 0,
    sequence: [
      {
        act: FL,
        fl: "fplc"
      },
      {
        act: PS,
        fl: "b"
      },
      {
        act: SAY,
        text: 'go',
      },
      {
        act: FL,
        fl: "fplc"
      },
      {
        act: ST
      }
    ],
    isGoal: false,
    teammateCoords:[],
    command: null
  },
  root: {
    exec(mgr, state) {
      state.action = state.sequence[state.next];
      state.command = null
    },
    next: "checkStop",
  },
  checkStop: {
    condition: (mgr,state) =>  state.action.act === ST,
    trueCond: "startOrStay",
    falseCond: "checkSay",
  },
  checkSay: {
    condition: (mgr,state) =>  state.action.act === SAY,
    trueCond: "say",
    falseCond: "goalVisible",
  },
  say: {
    exec(mgr, state) {
      state.command = {
        n: "say",
        v: state.action.text
      }
      state.next++
      state.action = state.sequence[state.next]
    },
    next: "sendCommand",
  },
  startOrStay: {
    condition: (mgr,state) =>  state.isGoal,
    trueCond: "goToStart",
    falseCond: "sendCommand",
  },
  goToStart: {
    exec(mgr, state) {
      state.command = {
        n: "move",
        v: "-20 15"
      }
    },
    next: "sendCommand",
  },
  goalVisible: {
    condition: (mgr, state) => mgr.getVisible(state.action.fl),
    trueCond: "rootNext",
    falseCond: "rotate",
  },
  rotate: {
    exec(mgr, state) {
      state.command = {
        n: "turn",
        v: "45"
      }
    },
    next: "sendCommand",
  },
  rootNext: {
    condition: (mgr, state) => state.action.act === FL,
    trueCond: "flagSeek",
    falseCond: "ballSeek",
  },
  flagSeek: {
    condition: (mgr, state) => mgr.getDistance(state.action.fl) !== null && 3 > mgr.getDistance(state.action.fl),
    trueCond: "closeFlag",
    falseCond: "farGoal",
  },
  closeFlag: {
    exec(mgr, state) {
      state.next++
      state.action = state.sequence[state.next]
    },
    next: "rootNext",
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
        v: mgr.getAngle(state.action.fl)
      }
    },
    next: "sendCommand",
  },
  runToGoal: {
    exec(mgr, state) {
      state.command = {
        n: "dash",
        v: 50
      }
    },
    next: "sendCommand",
  },
  ballSeek: {
    condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
    trueCond: "closeBall",
    falseCond: "farGoal",
  },
  closeBall: {
    condition: (mgr, state) => mgr.getVisible('p','"A"'),
    trueCond: "checkPlayerCoords",
    falseCond: "playerInvisible",
  },
  checkPlayerCoords: {
    condition: (mgr, state) => state.teammateCoords.length > 1,
    trueCond: "playerVisible",
    falseCond: "updateTeammateCoords",
  },
  updateTeammateCoords: {
    exec(mgr, state) {
      state.teammateCoords.push({
        pos: mgr.getPlayerPos("A"),
        angle: mgr.getAngle('p', "A")
      })
    },
    next: "sendCommand",
  },
  playerVisible: {
    exec(mgr, state) {
      state.command = {
        n: "kick",
        v: `70 ${mgr.getAngleToPass('A', state.teammateCoords)}`
      }
      state.teammateCoords = []
      state.next++
      state.action = state.sequence[state.next]
    },
    next: "sendCommand",
  },
  playerInvisible: {
    exec(mgr, state) {
      state.command = {
        n: "kick",
        v: "10 45"
      }
      state.teammateCoords = []
    },
    next: "sendCommand",
  },
  sendCommand: {
    command: (mgr, state) => state.command
  },
}
module.exports = DT
