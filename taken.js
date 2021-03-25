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
    this.goalOwn = {}; // {x: 0, y: 0.72, f: "gr", dist: 97.5, angle: 2}
  }

  setHear(input) {
    this.time = input.time;
    this.hear.push(input);
  }

  setSee(
    time,
    { flagsData, otherPlayers, gatesData, ballData },
    teamName,
    side
  ) {
    this.time = time;
    this.ballPrev = Object.assign({}, this.ball);
    this.ball.x = ballData.x;
    this.ball.y = ballData.y;
    this.ball.dist = ballData.distance;
    this.ball.angle = ballData.direction;

    const [team, teamOwn] = otherPlayers.reduce(
      ([team, teamOwn], p) => {
        if (p.name.includes(teamName)) {
          teamOwn.push(p);
        } else {
          team.push(p);
        }

        return [team, teamOwn];
      },
      [[], []]
    );
    this.team = team.map((p) => ({
      x: p.x,
      y: p.y,
      f: p.name.join(""),
      dist: p.distance,
      angle: p.direction,
    }));
    this.teamOwn = teamOwn.map((p) => ({
      x: p.x,
      y: p.y,
      f: p.name.join(""),
      dist: p.distance,
      angle: p.direction,
    }));

    if (side === "l") {
      this.goal = gatesData["gr"];
      this.goalOwn = gatesData["gl"];
    } else if (side === "r") {
      this.goal = gatesData["gl"];
      this.goalOwn = gatesData["gr"];
    }
  }
}

module.exports = { Taken };
