const CTRL_HIGH = {
  execute(input) {
    const immediate = this.immediateReaction(input)
    if (immediate) return immediate
    const defend = this.defendGoal(input)
    if (defend) return defend
    if (this.last == "defend")
      input.newAction = "return"
    this.last = "previous"
  },
  immediateReaction(input) { // Немедленная реакция
    if(input.canKick) {
      this.last = "kick"
      if (input.id < 8) { // центральные и нападющие
        if (input.playersListMy.length && input.id > 3) { // центральные
          input.newAction = "return"
          input.playersListMy.sort((p1, p2) => p1.p[1] - p2.p[1])
          if ((!input.goalOther || input.playersListMy[0].p[1] < input.goalOther.dist - 15)
              && input.playersListMy[0].p[1] > 4 && (!input.goalOwn || input.goalOwn.dist > 25))
            return {n: "kick", v: `${input.playersListMy[0].p[0]*3} ${input.playersListMy[0].p[1]}`}
        }
        if (input.goalOther) {
          if (input.goalOther.dist > 30)
            return {n: "kick", v: `20 ${input.goalOther.angle}`}
          return {n: "kick", v: `65 ${input.goalOther.angle}`}
        }
      } else { // защитники
        input.newAction = "return"
        const topOppositeFlag = (input.side === 'l') ? 'frt' : 'flt'
        const botOppositeFlag = (input.side === 'l') ? 'frb' : 'flb'
        if (input.goalOther) return {n: "kick", v: `100 ${input.goalOther.angle}`}
        else if (input.flags[topOppositeFlag]) return {n: "kick", v: `100 ${input.flags[topOppositeFlag].angle}`}
        else if (input.flags[botOppositeFlag]) return {n: "kick", v: `100 ${input.flags[botOppositeFlag].angle}`}

        const topFlag = input.side === 'l' ? 'flt' : 'frt'
        const botFlag = input.side === 'l' ? 'flb' : 'frb'
        const goalFlag = input.side === 'l' ? 'fl0' : 'fr0'
        if (input.flags[topFlag] && ((input.side === 'r' && input.id === 10) ||
                                     (input.side === 'l' && input.id === 8)) ||
            input.flags[botFlag] && ((input.side === 'r' && input.id === 8) ||
                                     (input.side === 'l' && input.id === 10)) ||
            input.flags[goalFlag] && input.id === 9) {
          return {n: 'kick', v: `100 180`}
        }
      }
      return {n: "kick", v: `15 ${input.side === 'l' ? 60 : -60}`}
    }
  },
  defendGoal(input) { // Защита ворот
    if(input.ball) {
      const close = input.closest(true)
      if((close[0] && close[0].dist > input.ball.dist)
          || !close[0] || (close[1] && close[1].dist > input.ball.dist)
          || !close[1]) {
        this.last = "defend"
        if (input.id < 4 && input.goalOwn && input.goalOwn.dist < 50) { // нападающие
          input.newAction = "return"
        } else if (input.id > 7 && input.goalOther && input.goalOther.dist < 50) { // защитники
          input.newAction = "return"
        } else if (input.id > 3 && input.id < 8 && input.goalOwn && input.goalOwn.dist < 25){ // защитники и центральные
          input.newAction = "return"
        }
        else {
          if (Math.abs(input.ball.angle) > 10)
            return {n: "turn", v: input.ball.angle}
          if (input.ball.dist > 1)
            return {n: "dash", v: 110}
          else
            return {n: "dash", v: 30}
        }
      }
    }
  },
}
module.exports = CTRL_HIGH
