const Msg = require('./msg')
const CtrlHighPlayer = require('./controllers/highAttack')
const CtrlMiddlePlayer = require('./controllers/middleAttack')
const CtrlLowPlayer = require('./controllers/lowAttack')
const CtrlHighGoalie = require('./controllers/highDefend')
const CtrlMiddleGoalie = require('./controllers/middleDefend')
const CtrlLowGoalie = require('./controllers/lowDefend')
const Positions = require('./positions')

class Agent {
  constructor(teamName, goalie = false) {
    this.position = "l" // По умолчанию - левая половина поля
    this.run = false // Игра начата
    this.teamName = teamName
    this.goalie = goalie
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
    if (data.cmd == "hear" && data.msg.includes('play_on') || data.msg.includes('kick_off_')) {
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
    if (cmd === 'hear' && (p[2].includes('goal_l_') ||
                           p[2].includes('goal_r_') ||
                           p[2].includes('before_kick_off'))) {
      this.act = {n: "move", v: Positions[this.id]}
    }
    if (cmd === 'hear' && this.goalie &&
        (p[2].includes('fault') ||
         p[2].includes('kink_in') ||
         p[2].includes('corner'))) {
      this.act = {n: "move", v: Positions[this.id]}
    }
    if (cmd === 'see' && this.run) {
      this.act = this.id < 11
        ? CtrlLowPlayer.execute(p, [CtrlMiddlePlayer, CtrlHighPlayer], this.teamName, this.position, this.id)
        : CtrlLowGoalie.execute(p, [CtrlMiddleGoalie, CtrlHighGoalie], this.teamName, this.position, this.id);
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
