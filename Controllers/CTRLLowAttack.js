const Taken = require('../Taken')
const CTRL_LOW = {
  execute(input, controllers, team, side, id) {
    const next = controllers[0] // Следующий уровень
    this.taken = Taken.setSee(input, team, side, id)
    this.taken.canKick = this.taken.ball && this.taken.ball.dist < 0.5;
    if (next) // Вызов следующего уровня
      return next.execute(this.taken, controllers.slice(1))
  }
}

module.exports = CTRL_LOW
