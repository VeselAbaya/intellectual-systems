const Taken = require('../Taken')
const CTRL_LOW = {
  execute(input, controllers, team, side) {
    const next = controllers[0] // Следующий уровень
    this.taken = Taken.setSee(input, team, side)
    this.taken.canKick = this.taken.ball && this.taken.ball.dist < 0.5;
    this.taken.canCatch =
      this.taken.ball && this.taken.ball.dist < 1.2 &&
      this.taken.myPos && Math.abs(this.taken.myPos.x) > 36.6 && Math.abs(this.taken.myPos.y) < 20;

    if (next) // Вызов следующего уровня
      return next.execute(this.taken, controllers.slice(1))
  }
}

module.exports = CTRL_LOW
