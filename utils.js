const { Flags, fieldBorders } = require("./constants");

const calcPlayerCoordsByFlags = (flagsSeeData) => {
  const flagsData = flagsSeeData.map((f) => {
    const fCoords = Flags[f.name.join("")];
    fCoords.d = f.distance;
    fCoords.dir = f.direction;
    return fCoords;
  });

  const flags = [];
  const coordsCount = new Set();

  for (f of flagsData) {
    if (flags.length >= 3) break;
    if (!coordsCount.has(f.x) && !coordsCount.has(f.y)) {
      coordsCount.add(f.x);
      coordsCount.add(f.y);
      flags.push(f);
    }
  }

  if (flags.length < 2) {
    return {};
  }

  const [f1, f2, f3] = flags;

  const alpha1 = (f1.x - f2.x) / (f2.y - f1.y);
  const beta1 =
    (f2.x ** 2 - f1.x ** 2 + f2.y ** 2 - f1.y ** 2 + f1.d ** 2 - f2.d ** 2) /
    (2 * (f2.y - f1.y));

  if (f3 !== undefined) {
    // by 3 flags
    const alpha2 = (f1.x - f3.x) / (f3.y - f1.y);
    const beta2 =
      (f3.x ** 2 - f1.x ** 2 + f3.y ** 2 - f1.y ** 2 + f1.d ** 2 - f3.d ** 2) /
      (2 * (f3.y - f1.y));

    const px = (beta2 - beta1) / (alpha1 - alpha2);
    return {
      px: px,
      py: -1 * (alpha1 * px + beta1),
    };
  }
  // by 2 flags
  const a = alpha1 ** 2 + 1;
  const b = -2 * (alpha1 * (f1.y - beta1) + f1.x);
  const c = (f1.y - beta1) ** 2 + f1.x ** 2 - f1.d ** 2;
  const d = Math.sqrt(b ** 2 - 4 * a * c);
  const [x1, x2] = [(-b + d) / (2 * a), (-b - d) / (2 * a)];

  const t1 = Math.sqrt(f1.d ** 2 - (x1 - f1.x) ** 2);
  const [y11, y12] = [f1.y + t1, f1.y - t1];

  const t2 = Math.sqrt(f1.d ** 2 - (x2 - f1.x) ** 2);
  const [y21, y22] = [f1.y + t2, f1.y - t2];

  for ([x, y] of [
    [x1, y11],
    [x1, y12],
    [x2, y21],
    [x2, y22],
  ]) {
    if (
      x >= fieldBorders.left &&
      x <= fieldBorders.right &&
      y >= fieldBorders.bottom &&
      y <= fieldBorders.top
    ) {
      return {
        px: x,
        py: -y,
      };
    }
  }

  return {
    px: undefined,
    py: undefined,
  };
};

module.exports = {
  calcPlayerCoordsByFlags,
};
