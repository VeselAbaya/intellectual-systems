const { Flags, fieldBorders } = require("./constants");

const calcCoord = (x1, y1, d, px) => {
  const D = Math.sqrt(d ** 2 - (px - x1) ** 2);
  return [y1 + D, y1 - D];
};

const calcPlayerCoordsByFlags = (flagsSeeData) => {
  const playerCoords = {};

  const flags = flagsSeeData.slice(0, 3).map((f) => {
    const fCoords = Flags[f.name.join("")];
    fCoords.d = f.distance;
    fCoords.dir = f.direction;
    return fCoords;
  });

  const [f1, f2, f3] = flags;
  if (f1.x == f2.x) {
    playerCoords.py =
      (f2.y ** 2 - f1.y ** 2 + f1.d ** 2 - f2.d ** 2) / (2 * f2.y - f1.y);
    const [x1, x2] = calcCoord(f1.y, f1.x, f1.d, playerCoords.py);
    playerCoords.px =
      x1 <= fieldBorders.left && x1 >= fieldBorders.right ? x1 : x2;
    return playerCoords;
  }

  if (f1.y == f2.y) {
    playerCoords.px =
      (f2.x ** 2 - f1.x ** 2 + f1.d ** 2 - f2.d ** 2) / (2 * f2.x - f1.x);
    const [y1, y2] = calcCoord(f1.x, f1.y, f1.d, playerCoords.px);
    playerCoords.py =
      y1 <= fieldBorders.top && y1 >= fieldBorders.bottom ? y1 : y2;
    return playerCoords;
  }

  const x12Diff = f2.x - f1.x;
  const alpha1 = (f1.y - f2.y) / x12Diff;
  const beta1 =
    (f2.y ** 2 - f1.y ** 2 + f2.x ** 2 - f1.x ** 2 + f1.d ** 2 - f2.d ** 2) /
    (2 * x12Diff);
  const a = alpha1 ** 2 + 1;
  const b = -2 * (alpha1 * (f1.x - beta1) + f1.y);
  const c = (f1.x - beta1) ** 2 + f1.y ** 2 - f1.d ** 2;
  const d = Math.sqrt(b ** 2 - 4 * a * c);

  const y1 = (-b + d) / (2 * a);
  const y2 = (-b - d) / (2 * a);

  console.log(y1, y2);

  const [x1, x2] = calcCoord(f1.y, f1.x, f1.d, y1);
  const [x3, x4] = calcCoord(f1.y, f1.x, f1.d, y2);

  return {
    px: 0, // choose from x1, x2
    py: 0, // choose from y1, y2
  };
};

module.exports = {
  calcPlayerCoordsByFlags,
};
