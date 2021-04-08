const Msg = require('./msg')
const CtrlHighPlayer = require('./Controllers/CTRLHighAttack')
const CtrlMiddlePlayer = require('./Controllers/CTRLMiddleAttack')
const CtrlLowPlayer = require('./Controllers/CTRLLowAttack')
const CtrlHighGoalie = require('./Controllers/CTRLHighDefault')
const CtrlMiddleGoalie = require('./Controllers/CTRLMiddleDefault')
const CtrlLowGoalie = require('./Controllers/CTRLLowDefault')
const Positions = require('./positions')

class Agent {
  constructor(teamName) {
    this.position = "l" // По умолчанию - левая половина поля
    this.run = false // Игра начата
    this.teamName = teamName
  }

  msgGot(msg) { // Получение сообщения
    let data = msg.toString('utf8') // Приведение к строке
    this.processMsg(data) // Разбор сообщения
    this.sendCmd() // Отправка команды
  }

  setSocket(socket) { // Настройка сокета
    this.socket = socket
  }

  socketSend(cmd, value) { // Отправка команды
    this.socket.sendMsg(`(${cmd} ${value})`)
  }

  processMsg(msg) { // Обработка сообщения
    let data = Msg.parseMsg(msg) // Разбор сообщения
    if (!data) throw new Error("Parse error\n" + msg)
    // Первое (hear) - начало игры
    if (data.cmd == "hear") {
      if (data.msg.includes('play_on') || data.msg.includes('kick_off_'))
        this.run = true
    }
    if (data.cmd == "init") this.initAgent(data.p) //Инициализация
    this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
  }

  initAgent(p) {
    if (p[0] == "r") this.position = "r" // Правая половина поля
    this.id = p[1] // id игрока
  }

  analyzeEnv(msg, cmd, p) {
    if (cmd === 'hear' && (p[2].includes('goal_l_') || p[2].includes('goal_r_'))) {
      this.act = {n: "move", v: Positions[this.id]}
    }
    if (cmd === 'see' && this.run) {
      if (this.id < 11) {
        this.act = CtrlLowPlayer.execute(p, [CtrlMiddlePlayer, CtrlHighPlayer], this.teamName, this.position, this.id)
      } else {
        this.act = CtrlLowGoalie.execute(p, [CtrlMiddleGoalie, CtrlHighGoalie], this.teamName, this.position, this.id)
      }
    }
  }

  sendCmd() {
    if (this.run) {
      if (this.act) {
        this.socketSend(this.act.n, this.act.v)
        this.run = this.act.n !== "move";
      }
      this.act = null
    }
  }
}

module.exports = Agent
