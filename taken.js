class Taken {
  constructor() {
    this.time = 0;
    this.pos = {}; // {x: 0, y: 0}
    this.hear = []; // {time: 100, who: "referee", msg: "play_on"}
    this.ballPrev = {}; // {x: -44, y: -0.7, f: "b", dist: 0.7, angle: 6}
    this.ball = {}; // {x: -44.3, y: -0.6, f: "b", dist: 0.5, angle: 8}
    this.teamOwn = [];
    this.team = []; // {x: -27.2, y: -5.5, f: "p\"teamA\"1", dist: 18.2, angle: 17}
    this.goal = {}; // {x: 0, y: 0.72, f: "gr", dist: 97.5, angle: 2}
  }

  setHear(input) {
    this.hear.push(input);
  }

  setSee(input, team, side) {

  }
}

module.exports = {Taken};
