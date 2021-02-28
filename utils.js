const { fieldBorders } = require("./constants");

const toRad = (angle) => (angle * Math.PI) / 180;

const calcPlayerCoordsByFlags = (baseFlags) => {
  if (baseFlags.length < 2) {
    return {};
  }

  const [f1, f2, f3] = baseFlags;

  const alpha1 = (f1.x - f2.x) / (f2.y - f1.y);
  const beta1 =
    (f2.x ** 2 -
      f1.x ** 2 +
      f2.y ** 2 -
      f1.y ** 2 +
      f1.distance ** 2 -
      f2.distance ** 2) /
    (2 * (f2.y - f1.y));

  if (f3 !== undefined) {
    // by 3 flags
    const alpha2 = (f1.x - f3.x) / (f3.y - f1.y);
    const beta2 =
      (f3.x ** 2 -
        f1.x ** 2 +
        f3.y ** 2 -
        f1.y ** 2 +
        f1.distance ** 2 -
        f3.distance ** 2) /
      (2 * (f3.y - f1.y));

    const px = (beta2 - beta1) / (alpha1 - alpha2);
    return {
      x: px,
      y: -1 * (alpha1 * px + beta1),
    };
  }
  // by 2 flags
  const a = alpha1 ** 2 + 1;
  const b = -2 * (alpha1 * (f1.y - beta1) + f1.x);
  const c = (f1.y - beta1) ** 2 + f1.x ** 2 - f1.distance ** 2;
  const d = Math.sqrt(b ** 2 - 4 * a * c);
  const [x1, x2] = [(-b + d) / (2 * a), (-b - d) / (2 * a)];

  const t1 = Math.sqrt(f1.distance ** 2 - (x1 - f1.x) ** 2);
  const [y11, y12] = [f1.y + t1, f1.y - t1];

  const t2 = Math.sqrt(f1.distance ** 2 - (x2 - f1.x) ** 2);
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
        x: x,
        y: -y,
      };
    }
  }

  return {
    x: undefined,
    y: undefined,
  };
};

const calcOtherDistance2 = (angleA, angleB, distA, distB) => {
  // if player sees A and B, calc distance from A to B
  return Math.sqrt(
    distA ** 2 +
      distB ** 2 -
      2 * distA * distB * Math.cos(Math.abs(toRad(angleA) - toRad(angleB)))
  );
};

module.exports = {
  calcPlayerCoordsByFlags,
  calcOtherDistance2,
};
