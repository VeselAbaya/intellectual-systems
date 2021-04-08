const CTRL_HIGH = {
  execute(input) {
    if (this.last === "catch") return this.afterCatch(input)
    const immediate = this.immediateReaction(input)
    if (immediate) return immediate
    const defend = this.defendGoal(input)
    if (defend) return defend
    if (this.last === "defend")
      input.newAction = "return"
    this.last = "previous"
  },
  afterCatch(input) {
    if (input.goalOther) {
      this.last = "kick"
      return {n: "kick", v: `110 ${input.goalOther.angle}`}
    } else {
      return {n: "turn", v: '60'}
    }
  },
  immediateReaction(input) { // Немедленная реакция
    if (input.canCatch) {
      this.last = "catch"
      return {n: "catch", v: input.ball.angle}
    }
    if (input.canKick) {
      this.last = "kick"
      if (input.goalOther) {
        if (input.goalOther.dist > 40)
          return {n: "kick", v: `30 ${input.goalOther.angle}`}
        return {n: "kick", v: `110 ${input.goalOther.angle}`}
      }
      const close = input.closest(true)
      const flag = input.flags[`fp${input.side === 'l' ? 'r' : 'l'}${Math.round(Math.random() * 10) % 2 ? 't' : 'b'}`];
      if (flag || close[0]) {
        return {n: "kick", v: `100 ${(flag || close[0]).angle}`}
      }
      if (input.goalOwn.dist > 25) {
        this.last = "defend"
        return {n: "rotate", v: '45'}
      }
      return {n: "kick", v: `20 45`}
    }
  },
  defendGoal(input) { // Защита ворот
    if (input.ball) {
      const close = input.closest(true) // из моей команды
      if ((close[0] && close[0].dist + 3 > input.ball.dist) ||
          (input.ball.dist < 20 && input.ball.dist > 1.2)) {
        this.last = "defend"
        if (input.goalOther && input.goalOther.dist <= 80 ||
            input.goalOwn && input.goalOwn.dist >= 20) {
          input.newAction = "return"
        }
        if (Math.abs(input.ball.angle) > 10)
          return {n: "turn", v: input.ball.angle}
        else if (input.ball.dist > 1)
          return {n: "dash", v: 110}
        else
          return {n: "dash", v: 40}
      }
    }
  },
}
module.exports = CTRL_HIGH
