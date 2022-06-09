function getlowestfraction(x0: number): IFraction {
  var eps = 1.0e-15;
  var h, h1, h2, k, k1, k2, a, x;

  x = x0;
  a = Math.floor(x);
  h1 = 1;
  k1 = 0;
  h = a;
  k = 1;

  while (x - a > eps * k * k) {
    x = 1 / (x - a);
    a = Math.floor(x);
    h2 = h1;
    h1 = h;
    k2 = k1;
    k1 = k;
    h = h2 + a * h1;
    k = k2 + a * k1;
  }

  return { top: h, bottom: k };
}

interface IFraction {
  top: number;
  bottom: number;
}

type Fractionable = number | IFraction;

export class Fraction {
  top: number;

  bottom: number;

  constructor(val: Fractionable) {
    if (typeof val === 'number') {
      const { top, bottom } = getlowestfraction(val);
      this.top = top;
      this.bottom = bottom;
    } else {
      this.top = val.top;
      this.bottom = val.bottom;
    }
  }

  toNumber() {
    return this.top / this.bottom;
  }

  static plus(left: Fractionable, right: Fractionable): Fraction {
    // a/b + c/d === ad/bd + bc/bd === (ad + bc)/bd
    const { top: a, bottom: b } = new Fraction(left);
    const { top: c, bottom: d } = new Fraction(right);
    return new Fraction({ top: a * d + b * c, bottom: b * d });
  }

  static minus(left: Fractionable, right: Fractionable): Fraction {
    // a/b - c/d === ad/bd - bc/bd === (ad - bc)/bd
    const { top: a, bottom: b } = new Fraction(left);
    const { top: c, bottom: d } = new Fraction(right);
    return new Fraction({ top: a * d - b * c, bottom: b * d });
  }

  static times(left: Fractionable, right: Fractionable): Fraction {
    // a/b * c/d === ac/bd
    const { top: a, bottom: b } = new Fraction(left);
    const { top: c, bottom: d } = new Fraction(right);
    return new Fraction({ top: a * c, bottom: b * d });
  }

  static divide(left: Fractionable, right: Fractionable): Fraction {
    // a/b / c/d === a/b * d/c === ad/bc
    const { top: a, bottom: b } = new Fraction(left);
    const { top: c, bottom: d } = new Fraction(right);
    return new Fraction({ top: a * d, bottom: b * c });
  }
}
