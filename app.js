const socket = require('./socket')
const Agent = require('./agent')
const VERSION = 7

function createAgent(teamName, speed, x, y,goalie) {
  let agent = new Agent(speed, teamName)
  socket(agent, teamName, VERSION, goalie)
  setTimeout(() => {
    agent.socketSend("move", `${x} ${y}`)
  }, 20)
}

setTimeout(()=> {
  createAgent('A', 0, -10, 0)
},100)
setTimeout(()=> {
  createAgent('A', 0, -5, -25)
},100)
setTimeout(()=> {
  createAgent('A', 0, -5, 25)
},100)
setTimeout(()=> {
  createAgent('A', 0, -15, -15)
},100)
setTimeout(()=> {
  createAgent('A', 0, -15, 15)
},100)
setTimeout(()=> {
  createAgent('A', 0, -25, -15)
},100)
setTimeout(()=> {
  createAgent('A', 0, -25, 15)
},100)
setTimeout(()=> {
  createAgent('A', 0, -35, -25)
},100)
setTimeout(()=> {
  createAgent('A', 0, -35, 0)
},100)
setTimeout(()=> {
  createAgent('A', 0, -35, 25)
},100)
setTimeout(()=> {
  createAgent('A', 0, -50, 0, 'goalie')
},100)

setTimeout(()=> {
  createAgent('B', 0, -10, 0)
},100)
setTimeout(()=> {
  createAgent('B', 0, -5, -25)
},100)
setTimeout(()=> {
  createAgent('B', 0, -5, 25)
},100)
setTimeout(()=> {
  createAgent('B', 0, -15, -15)
},100)
setTimeout(()=> {
  createAgent('B', 0, -15, 15)
},100)
setTimeout(()=> {
  createAgent('B', 0, -25, -15)
},100)
setTimeout(()=> {
  createAgent('B', 0, -25, 15)
},100)
setTimeout(()=> {
  createAgent('B', 0, -35, -25)
},100)
setTimeout(()=> {
  createAgent('B', 0, -35, 0)
},100)
setTimeout(()=> {
  createAgent('B', 0, -35, 25)
},100)
setTimeout(()=> {
  createAgent('B', 0, -50, 0, "goalie")
},100)
