import { Calculator } from './calculator';

const MINUS = '–';

function repeat(fn: Function, count: number) {
  for (var i = 1; i <= count; i++) {
    fn();
  }
}

let calculator = new Calculator();

beforeEach(() => {
  calculator = new Calculator();
});

describe('Default', () => {
  it('Should show 0 by default', async () => {
    expect(calculator.displayValue).toBe('0');
  });
});

describe('Basic integer maths', () => {
  it('12 + 34 = 45', async () => {
    calculator.press('1');
    calculator.press('2');
    calculator.press('plus');
    calculator.press('3');
    calculator.press('4');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('46');
  });
  it('12 * 34 = 408', async () => {
    calculator.press('1');
    calculator.press('2');
    calculator.press('times');
    calculator.press('3');
    calculator.press('4');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('408');
  });
  it('69 / 23 = 3', async () => {
    calculator.press('6');
    calculator.press('9');
    calculator.press('divide');
    calculator.press('2');
    calculator.press('3');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('3');
  });
  it('69 - 23 = 46', async () => {
    calculator.press('6');
    calculator.press('9');
    calculator.press('minus');
    calculator.press('2');
    calculator.press('3');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('46');
  });
});
describe('Basic floating maths', () => {
  it('0.1 + 0.2 = 0.3', async () => {
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('1');
    calculator.press('plus');
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('2');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('0.3');
  });
  it('0.1 * 0.2 = 0.02', async () => {
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('1');
    calculator.press('times');
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('2');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('0.02');
  });
  it('0.01 / 0.3 = 0.03333333', async () => {
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('0');
    calculator.press('1');
    calculator.press('divide');
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('3');
    calculator.press('equals');

    expect(calculator.displayValue).toBe('0.03333333');
  });
  it('0.3 - 0.2 = 0.1', async () => {
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('3');
    calculator.press('minus');
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('2');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('0.1');
  });
});

describe('Character limits', () => {
  it('Should show commas in values > 999', async () => {
    calculator.press('1');
    calculator.press('2');
    calculator.press('3');
    calculator.press('4');
    calculator.press('5');
    calculator.press('6');
    calculator.press('7');
    calculator.press('8');
    calculator.press('9');
    expect(calculator.displayValue).toBe('123,456,789');
  });
  it('Should ignore values typed in after 9th number', async () => {
    calculator.press('1');
    calculator.press('2');
    calculator.press('3');
    calculator.press('4');
    calculator.press('5');
    calculator.press('6');
    calculator.press('7');
    calculator.press('8');
    calculator.press('9');
    calculator.press('8');
    calculator.press('7');
    expect(calculator.displayValue).toBe('123,456,789');
  });
  it('Should ignore values typed in after 9th number (even with decimal)', async () => {
    calculator.press('1');
    calculator.press('2');
    calculator.press('3');
    calculator.press('4');
    calculator.press('decimal');
    calculator.press('5');
    calculator.press('6');
    calculator.press('7');
    calculator.press('8');
    calculator.press('9');
    calculator.press('8');
    calculator.press('7');
    expect(calculator.displayValue).toBe('1,234.56789');
  });
  it('Should truncate values to 9 significant figures (rounded up)', async () => {
    calculator.press('1');
    calculator.press('0');
    calculator.press('0');
    calculator.press('0');
    calculator.press('0');
    calculator.press('divide');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('1,428.57143');
  });
  it('Should truncate values to 9 significant figures (even with commas and decimal) (rounded up)', async () => {
    calculator.press('1');
    calculator.press('0');
    calculator.press('0');
    calculator.press('0');
    calculator.press('0');
    calculator.press('divide');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('1,428.57143');
  });
  it('Should show max 7 sigdigs when number is positive and e9 (e should take up 1, exponent should take 1 of the 9 char slots)', async () => {
    calculator.press('1');
    repeat(() => calculator.press('0'), 8);

    calculator.press('divide');
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('0');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('1.428571e9');
  });
  it('Should show max 6 sigdigs when number is positive and e10-99 (e should take up 1, exponent should take 2 of the 9 char slots)', async () => {
    calculator.press('1');
    repeat(() => calculator.press('0'), 8);

    calculator.press('divide');
    calculator.press('0');
    calculator.press('decimal');
    calculator.press('0');
    calculator.press('0');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('1.42857e10');
  });
  // it('Should show max 5 sigdigs when number is positive and e100+ (e should take up 1, exponent should take 3 of the 9 char slots)', async () => {
  //   calculator.press('1');
  //   repeat(() => calculator.press('0'), 8);

  //   calculator.press('divide');
  //   calculator.press('0');
  //   calculator.press('decimal');
  //   calculator.press('7');
  //   calculator.press('equals');
  //   expect(calculator.displayValue).toBe('1.42857e10');
  // });
});

describe('Clear button', () => {
  it('Should clear value when C button is pressed', async () => {
    calculator.press('1');
    expect(calculator.displayValue).toBe('1');
    calculator.press('c');
    expect(calculator.displayValue).toBe('0');
  });
});

describe('Inversion', () => {
  it('Should invert input when inputting', async () => {
    calculator.press('1');
    expect(calculator.displayValue).toBe('1');
    calculator.press('sign');
    expect(calculator.displayValue).toBe(`${MINUS}1`);
  });
  it('Should invert ans when see ans', async () => {
    calculator.press('1');
    calculator.press('plus');
    calculator.press('1');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('2');
    calculator.press('sign');
    expect(calculator.displayValue).toBe(`${MINUS}2`);
  });
  it('Should invert inversion if clicked again', async () => {
    calculator.press('1');
    calculator.press('minus');
    calculator.press('3');
    calculator.press('equals');
    expect(calculator.displayValue).toBe(`${MINUS}2`);
    calculator.press('sign');
    expect(calculator.displayValue).toBe('2');
  });
});

describe('Chaining', () => {
  it('Should run last operation (divide) twice when equals is double-clicked', async () => {
    calculator.press('1');
    calculator.press('divide');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('0.14285714');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('0.02040816');
  });
  it('Should run last operation (plus) twice when equals is double-clicked', async () => {
    calculator.press('1');
    calculator.press('plus');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('8');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('15');
  });
  it('Should run last operation (times) twice when equals is double-clicked', async () => {
    calculator.press('1');
    calculator.press('times');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('49');
  });
  it('Should run last operation (minus) twice when equals is double-clicked', async () => {
    calculator.press('1');
    calculator.press('minus');
    calculator.press('7');
    calculator.press('equals');
    expect(calculator.displayValue).toBe(`${MINUS}6`);
    calculator.press('equals');
    expect(calculator.displayValue).toBe(`${MINUS}13`);
  });

  describe('Back-to-back operations', () => {
    it('4 + 5 + 6 = 15', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('5');
      calculator.press('plus');
      calculator.press('6');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('15');
    });
    it('4 + 5 - 6 = 3', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('5');
      calculator.press('minus');
      calculator.press('6');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('3');
    });
    it('4 + 5 x 6 = 34', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('5');
      calculator.press('times');
      calculator.press('6');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('34');
    });
    it('4 + 6 / 3 = 6', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('6');
      calculator.press('divide');
      calculator.press('3');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('6');
    });
  });
  describe('"Dangling" operation', () => {
    it('4 + 5 + = 18', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('5');
      calculator.press('plus');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('18');
    });
    it('4 + 5 - = 0', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('5');
      calculator.press('minus');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('0');
    });
    it('4 + 5 x = 29', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('5');
      calculator.press('times');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('29');
    });
    it('4 + 5 / = 5', async () => {
      calculator.press('4');
      calculator.press('plus');
      calculator.press('5');
      calculator.press('divide');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('5');
    });
  });
});

describe('Scientific notation', () => {
  it('Should switch to scientific notation when values go above 999,999,999', async () => {
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    expect(calculator.displayValue).toBe('999,999,999');
    calculator.press('plus');
    calculator.press('1');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('1e9');
  });
  it('Should round off values more than 9 significant figures in (e.g. show 1,000,000,100 as 1e9)', async () => {
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    expect(calculator.displayValue).toBe('999,999,999');
    calculator.press('plus');
    calculator.press('1');
    calculator.press('0');
    calculator.press('1');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('1e9');
  });
  it('Should not round off values 8 significant figures in (e.g. show 1,000,000,500 as 1.000000e9)', async () => {
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    calculator.press('9');
    expect(calculator.displayValue).toBe('999,999,999');
    calculator.press('plus');
    calculator.press('1');
    calculator.press('0');
    calculator.press('1');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('1e9');
  });
});

describe('Error values', () => {
  it('Should show "Error" when dividing by zero', async () => {
    calculator.press('1');
    calculator.press('divide');
    calculator.press('0');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('Error');
  });
  it('Should show "Error" when dividing by negative zero', async () => {
    calculator.press('1');
    calculator.press('divide');
    calculator.press('sign');
    calculator.press('0');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('Error');
  });
  // TODO - Cannot recover error by multiplying by 0
});
describe('Ignoring certain values', () => {
  it('Should ignore 0s when value is 0', async () => {
    expect(calculator.displayValue).toBe('0');
    calculator.press('0');
    expect(calculator.displayValue).toBe('0');
    calculator.press('0');
    calculator.press('0');
    expect(calculator.displayValue).toBe('0');
  });
  it('Should only allow one decimal point', async () => {
    expect(calculator.displayValue).toBe('0');
    calculator.press('decimal');
    expect(calculator.displayValue).toBe('0.');
    calculator.press('decimal');
    expect(calculator.displayValue).toBe('0.');
    calculator.press('1');
    expect(calculator.displayValue).toBe('0.1');
    calculator.press('decimal');
    expect(calculator.displayValue).toBe('0.1');
  });
});

// test significant figure on comp[lex  numebrs]
// hitting equals twice runs last operation again
// 0 error
// E value
// do the font size
// copy and paste

// dangling operation
// // plus/minus => plus/minus => show ans
// // plus/minus => times/divide => show input
// // times/divide => plus/minus => show ans
// // times/divide => times/divide => show ans

// 2 + 3 x 5 / => show 15
// 2 + 3 x 5 x => show 15
// 2 + 3 x 5 + => show 17
// 2 + 3 x 5 - => show 17
// 2 + 3 x 5 / = 3    // 2 + 3 x 5 / == 2 + ((3 x 5) / "(3 x 5)") = 3
// 2 + 3 x 5 x = 227  // 2 + 3 x 5 x == 2 + ((3 x 5) x "(3 x 5)") = 227
// 2 + 3 x 5 + = 34   // 2 + 3 x 5 + == (2 + (3 x 5)) + "(2 + (3 x 5))" = 34
// 2 + 3 x 5 - = 0    // 2 + 3 x 5 - == (2 + (3 x 5)) - "(2 + (3 x 5))" = 0

// 1 + 2 - 5 x 9 / 4 + 3 - 6 / 9 * 2
// 1 + 2 - (5 x (9 / 4)) + 3 - ((6 / 9) * 2)
// 3 - 11.25 + 3 - 1.3333333
// -5.5833333333
// WRONG
// I got -6.58333333 = (-6.25 + 0.33333333333)

//
// 1 + 2 % = 0.02
// 2 + 3 % = 0.06
// 2 * 3 % = 0.03
// 2 / 3 % = 0.03
// 2 / 3 % = 0.03
// 2 - 3 % = 0.06
// 4 / 5 % = 0.05
// 4 * 5 % = 0.05
// 4 + 5 % = 0.2
// 4 - 5 % = 0.2
// 4 + 5 + 6 % = 0.06
// 4 - 5 - 6 % = -0.06
//
// 12 +3 = (15) 5 = 8
