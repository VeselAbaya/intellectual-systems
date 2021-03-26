class Taken {
  constructor() {
    this.time = 0;
    this.pos = {}; // {x: 0, y: 0}
    this.hear = []; // {time: 100, who: "referee", msg: "play_on"}
    this.ballPrev = undefined; // {x: -44, y: -0.7, f: "b", dist: 0.7, angle: 6}
    this.ball = undefined; // {x: -44.3, y: -0.6, f: "b", dist: 0.5, angle: 8}
    this.team = [];
    this.rivalTeam = []; // {x: -27.2, y: -5.5, f: "p\"rivatTeamA\"1", dist: 18.2, angle: 17}
    this.goal = {}; // {x: 0, y: 0.72, f: "gr", dist: 97.5, angle: 2}
    this.goalOwn = {}; // {x: 0, y: 0.72, f: "gr", dist: 97.5, angle: 2}
  }

  setHear(input) {
    // this.time = input.time;
    // this.hear.push(input);
  }

  parseObject(object) {
    if (!object) return undefined;

    return {
      x: object.x,
      y: object.y,
      f: object.name.join(""),
      dist: object.distance,
      angle: object.direction,
    };
  }

  setSee(
    time,
    { flagsData, otherPlayers, gatesData, ballData },
    teamName,
    side
  ) {
    this.time = time;

    this.ballPrev = Object.assign({}, this.ball);
    this.ball = this.parseObject(ballData);

    const [team, rivalTeam] = otherPlayers.reduce(
      ([team, rivalTeam], p) => {
        if (p.name.includes(teamName)) {
          team.push(p);
        } else {
          rivalTeam.push(p);
        }

        return [team, rivalTeam];
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
    this.rivalTeam = rivalTeam.map((p) => ({
      x: p.x,
      y: p.y,
      f: p.name.join(""),
      dist: p.distance,
      angle: p.direction,
    }));

    if (side === "l") {
      this.goal = this.parseObject(
        gatesData.find((f) => f.name.join("") === "gr")
      );
      this.goalOwn = this.parseObject(
        gatesData.find((f) => f.name.join("") === "gl")
      );
    } else if (side === "r") {
      this.goal = this.parseObject(
        gatesData.find((f) => f.name.join("") === "gl")
      );

      this.goalOwn = this.parseObject(
        gatesData.find((f) => f.name.join("") === "gr")
      );
    }

    this.lookAroundFlags = {
      fprb: this.parseObject(flagsData.find((f) => f.name.join("") === "fprb")),
      fprc: this.parseObject(flagsData.find((f) => f.name.join("") === "fprc")),
      fprt: this.parseObject(flagsData.find((f) => f.name.join("") === "fprt")),
    };
  }
}

module.exports = { Taken };
