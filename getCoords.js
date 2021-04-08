function getDistanceForOtherPlayer(player, flags) {
  const newFlags = []
  newFlags.push(player)
  flags.forEach(flag => {
    const distanceBetweenFlagAndPlayer = Math.sqrt(Math.abs(
      square(flag.p[0]) + square(player.p[0]) - 2*player.p[0]*flag.p[0]*Math.cos(Math.abs(flag.p[1] - player.p[1]) * Math.PI/180)
    ))
    newFlags.push(flag)
    newFlags[newFlags.length - 1].p[0] = distanceBetweenFlagAndPlayer
  })
  return newFlags
}
function getAnswerForTwoFlags(p, Flags) {
  let coords = []
  let distance = []
  p.forEach(q => {
    if (q.cmd) {
      coords.push(Flags[q.cmd.p.join('')])
      distance.push(q.p[0])
    }
  })
  let answer = null
  if (coords[0]) {
    if (coords[0].x === coords[1].x) {
      answer = this.coordsForSeemX(coords, distance, 0, 1)
    } else if (coords[0].y === coords[1].y) {
      answer = this.coordsForSeemY(coords, distance, 0, 1)
    } else {
      const alpha = (coords[0].y - coords[1].y) / (coords[1].x - coords[0].x)
      const beta = (
        square(coords[1].y) - square(coords[0].y) +
        square(coords[1].x) - square(coords[0].x) +
        square(distance[0]) - square(distance[1])
      ) / (2 * (coords[1].x - coords[0].x))
      const a = square(alpha) + 1
      const b = -2 * (alpha * (coords[0].x - beta) + coords[0].y)
      const c = square(coords[0].x - beta) + square(coords[0].y) - square(distance[0])
      const ys = [
        (-b + Math.sqrt(square(b) - 4 * a * c)) / (2 * a),
        (-b - Math.sqrt(square(b) - 4 * a * c)) / (2 * a)
      ]
      const xs = [
        coords[0].x + Math.sqrt(square(distance[0]) - square(ys[0] - coords[0].y)),
        coords[0].x - Math.sqrt(square(distance[0]) - square(ys[0] - coords[0].y)),
        coords[0].x + Math.sqrt(square(distance[0]) - square(ys[1] - coords[0].y)),
        coords[0].x - Math.sqrt(square(distance[0]) - square(ys[1] - coords[0].y))
      ]
      answer = this.checkAnswersForTwoFlags(xs, ys)
    }
    return answer
  } else {
    return null
  }
}
function checkAnswersForTwoFlags(xs, ys) {
  let answerX = null
  let answerY = null
  xs.forEach((x, index) => {
    const ind = (index < 2) ? 0 : 1
    if (Math.abs(x) <= 54 && Math.abs(ys[ind]) <= 32) {
      answerX = x
      answerY = ys[ind]
    }
  })
  return { x: answerX, y: answerY }
}
function coordsForSeemX(coords, distance, q0, q1, q2) {
  const y = (
    square(coords[q1].y) - square(coords[q0].y) +
    square(distance[q0]) - square(distance[q1])
  ) / (2 * (coords[q1].y - coords[q0].y))
  const xs = [
    coords[q0].x + Math.sqrt(Math.abs(square(distance[q0]) - square(y - coords[q0].y))),
    coords[q0].x - Math.sqrt(Math.abs(square(distance[q0]) - square(y - coords[q0].y)))
  ]
  let answer
  if (q2) {
    const forX1 = Math.abs(square(xs[0] - coords[q2].x) + square(y - coords[q2].y) - square(distance[q2]))
    const forX2 = Math.abs(square(xs[1] - coords[q2].x) + square(y - coords[q2].y) - square(distance[q2]))
    answer = forX1 - forX2 > 0
      ? {x: xs[1], y}
      : {x: xs[0], y}
  } else {
    answer = Math.abs(xs[0]) <= 54
      ? {x: xs[0], y}
      : {x: xs[1], y}
  }
  return answer
}
function coordsForSeemY(coords, distance, q0, q1, q2) {
  const x = (
    square(coords[q1].x) - square(coords[q0].x) +
    square(distance[q0]) - square(distance[q1])
  ) / (2*(coords[q1].x - coords[q0].x))
  const ys = [
    coords[q0].y + Math.sqrt(Math.abs(square(distance[q0]) - square(x - coords[q0].x))),
    coords[q0].y - Math.sqrt(Math.abs(square(distance[q0]) - square(x - coords[q0].x)))
  ]
  let answer
  if (q2) {
    const forY1 = Math.abs(square(x - coords[q2].x) + square(ys[0] - coords[q2].y) - square(distance[q2]))
    const forY2 = Math.abs(square(x - coords[q2].x) + square(ys[1] - coords[q2].y) - square(distance[q2]))
    answer = forY1 - forY2 > 0
      ? {x, y: ys[1]}
      : {x, y: ys[0]}
  } else {
    answer = Math.abs(ys[0]) <= 32
      ? {x, y: ys[0]}
      : {x, y: ys[1]}
  }
  return answer
}
function getAnswerForThreeFlags(p, Flags) {
  let coords = []
  let distance = []
  p.forEach(q => {
    if (q.cmd && coords.length < 3 &&
        q.cmd.p && Flags[q.cmd.p.join('')] &&
        coords.filter((c) => c.x === Flags[q.cmd.p.join('')].x).length < 2 &&
        coords.filter((c) => c.y === Flags[q.cmd.p.join('')].y).length < 2) {
      coords.push(Flags[q.cmd.p.join('')])
      distance.push(q.p[0])
    }
  })
  if (coords.length < 3) {
    return this.getAnswerForTwoFlags(p, Flags)
  } else {
    let answer
    if (coords[0].x === coords[1].x) {
      answer = this.coordsForSeemX(coords, distance, 0, 1, 2)
    } else if (coords[0].x === coords[2].x) {
      answer = this.coordsForSeemX(coords, distance, 0, 2, 1)
    } else if (coords[1].x === coords[2].x) {
      answer = this.coordsForSeemX(coords, distance, 1, 2, 0)
    } else if (coords[0].y === coords[1].y) {
      answer = this.coordsForSeemY(coords, distance, 0, 1, 2)
    } else if (coords[0].y === coords[2].y) {
      answer = this.coordsForSeemY(coords, distance, 0, 2, 1)
    } else if (coords[1].y === coords[2].y) {
      answer = this.coordsForSeemY(coords, distance, 1, 2, 0)
    } else {
      const alpha1 = (coords[0].y - coords[1].y) / (coords[1].x - coords[0].x)
      const beta1 = (
        square(coords[1].y) - square(coords[0].y) +
        square(coords[1].x) - square(coords[0].x) +
        square(distance[0]) - square(distance[1])
      ) / (2 * (coords[1].x - coords[0].x))
      const alpha2 = (coords[0].y - coords[2].y) / (coords[2].x - coords[0].x)
      const beta2 = (
        square(coords[2].y) - square(coords[0].y) +
        square(coords[2].x) - square(coords[0].x) +
        square(distance[0]) - square(distance[2])
      ) / (2 * (coords[2].x - coords[0].x))
      answer = {
        x: alpha1 * (beta1 - beta2) / (alpha2 - alpha1) + beta1,
        y: (beta1 - beta2) / (alpha2 - alpha1)
      }
    }
    return answer
  }
}

function square(val) {
  return val * val
}

const FlagsCoords = {
  ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
  ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
  ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
  ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
  ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
  ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
  fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
  fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
  fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
  fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
  fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
  flt30: {x:-57.5, y: 30}, flt20: {x:-57.5, y: 20},
  flt10: {x:-57.5, y: 10}, fl0: {x:-57.5, y: 0},
  flb10: {x:-57.5, y: -10}, flb20: {x:-57.5, y: -20},
  flb30: {x:-57.5, y: -30}, frt30: {x: 57.5, y: 30},
  frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
  fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
  frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
  fglt: {x:-52.5, y: 7.01}, fglb: {x:-52.5, y:-7.01},
  gl: {x:-52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
  fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
  fplb: {x: -36, y:-20.15}, fgrt: {x: 52.5, y: 7.01},
  fgrb: {x: 52.5, y:-7.01}, fprt: {x: 36, y: 20.15},
  fprc: {x: 36, y: 0}, fprb: {x: 36, y:-20.15},
  flt: {x:-52.5, y: 34}, fct: {x: 0, y: 34},
  frt: {x: 52.5, y: 34}, flb: {x:-52.5, y: -34},
  fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
  distance(p1, p2) {
    return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
  },
}

function isNearToFlag(flagStr, point) {
  return point &&
         Math.abs(FlagsCoords[flagStr].x - point.x) <= 2 &&
         Math.abs(FlagsCoords[flagStr].y - point.y) <= 2
}

module.exports = {getDistanceForOtherPlayer, getAnswerForTwoFlags, checkAnswersForTwoFlags,
  coordsForSeemX, coordsForSeemY, getAnswerForThreeFlags, getPow2: square, FlagsCoords, isNearToFlag}
