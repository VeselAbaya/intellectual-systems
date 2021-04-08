const getCoords = require('./getCoords')
const Taken = {
  setSee(input, team, side, id) {
    console.log(team, id)
    const filteredInput = input.filter(obj => obj.cmd)

    const ballObj = filteredInput.find(obj => obj.cmd.p[0] === 'b')
    const ball = ballObj ? {
      dist: ballObj.p[0],
      angle: ballObj.p[1]
    } : null

    const playersListAll = filteredInput.filter(obj => obj.cmd.p[0] === 'p')
    const playersListMy = filteredInput.filter(obj => obj.cmd.p[0] === 'p' && obj.cmd.p[1] === `"${team}"`)

    const flagsList = filteredInput.filter(obj => ['f', 'g'].includes(obj.cmd.p[0]))
    let flags = filteredInput.reduce((flags, obj) => {
      flags[obj.cmd.p.join('')] = {dist: obj.p[0], angle: obj.p[1]}
      return flags;
    }, {})

    let myPos = null
    if (flagsList.length === 2) {
      myPos = getCoords.getAnswerForTwoFlags(flagsList, getCoords.FlagsCoords)
    } else if (flagsList.length > 2) {
      myPos = getCoords.getAnswerForThreeFlags(flagsList, getCoords.FlagsCoords)
    }

    const goalOwnTeam = filteredInput.find(obj => obj.cmd.p.join('') === `g${side}`)
    let goalOwn = goalOwnTeam ? {
      dist: goalOwnTeam.p[0],
      angle: goalOwnTeam.p[1]
    } : null

    const goalOtherTeam = filteredInput.find(obj => obj.cmd.p.join('') === `g${side === 'r' ? 'l' : 'r'}`)
    let goalOther = goalOtherTeam ? {
      dist: goalOtherTeam.p[0],
      angle: goalOtherTeam.p[1]
    } : null

    return {
      ball,
      flags,
      id,
      myPos,
      team,
      playersListMy,
      goalOther,
      goalOwn,
      side,
      closest(myTeam) {
        if (ball && flagsList.length >= 2) {
          const distanceList = []
          let playersList = myTeam ? playersListMy : playersListAll
          playersList.forEach(p => {
            const newFlags = getCoords.getDistanceForOtherPlayer(p, flagsList)
            const playerCoords = getCoords.getAnswerForThreeFlags(newFlags, getCoords.FlagsCoords)
            if (playerCoords) {
              distanceList.push({
                coords: playerCoords,
                dist: Math.sqrt(ballObj.p[0]**2 + p.p[0]**2 - 2*ballObj.p[0]*p.p[0]*Math.cos((p.p[1] - ballObj.p[1])*Math.PI/ 180))
              })
            }
          })
          return distanceList.sort((dist1, dist2) => dist1.dist - dist2.dist)
        }
        return []
      }
    }
  }
}
module.exports = Taken
