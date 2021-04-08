const socket = require('./socket')
const Agent = require('./agent')
const Positions = require('./positions');
const VERSION = 7

function createAgent(teamName, positionStr, goalie = null) {
  let agent = new Agent(teamName, goalie)
  socket(agent, teamName, VERSION, goalie)
  setTimeout(() => {
    agent.socketSend("move", positionStr)
  }, 20)
}

const delay = 15;
setTimeout(()=> {
  createAgent('A', Positions[1])
},100 + delay)
setTimeout(()=> {
  createAgent('A', Positions[2])
},100 + 2 * delay)
setTimeout(()=> {
  createAgent('A', Positions[3])
},100 + 3 * delay)
setTimeout(()=> {
  createAgent('A', Positions[4])
},100 + 4 * delay)
setTimeout(()=> {
  createAgent('A', Positions[5])
},100 + 5 * delay)
setTimeout(()=> {
  createAgent('A', Positions[6])
},100 + 6 * delay)
setTimeout(()=> {
  createAgent('A', Positions[7])
},100 + 7 * delay)
setTimeout(()=> {
  createAgent('A', Positions[8])
},100 + 8 * delay)
setTimeout(()=> {
  createAgent('A', Positions[9])
},100 + 9 * delay)
setTimeout(()=> {
  createAgent('A', Positions[10])
},100 + 10 * delay)
setTimeout(()=> {
  createAgent('A', Positions[11], 'goalie')
},100 + 11 * delay)

setTimeout(()=> {
  createAgent('B', Positions[1])
},100 + 12 * delay)
setTimeout(()=> {
  createAgent('B', Positions[2])
},100 + 13 * delay)
setTimeout(()=> {
  createAgent('B', Positions[3])
},100 + 14 * delay)
setTimeout(()=> {
  createAgent('B', Positions[4])
},100 + 15 * delay)
setTimeout(()=> {
  createAgent('B', Positions[5])
},100 + 16 * delay)
setTimeout(()=> {
  createAgent('B', Positions[6])
},100 + 17 * delay)
setTimeout(()=> {
  createAgent('B', Positions[7])
},100 + 18 * delay)
setTimeout(()=> {
  createAgent('B', Positions[8])
},100 + 19 * delay)
setTimeout(()=> {
  createAgent('B', Positions[9])
},100 + 20 * delay)
setTimeout(()=> {
  createAgent('B', Positions[10])
},100 + 21 * delay)
setTimeout(()=> {
  createAgent('B', Positions[11], 'goalie')
},100 + 22 * delay)
