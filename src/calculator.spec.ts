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
  it('Should ignore values typed in after 9th number (even with minus)', async () => {
    calculator.press('sign');
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
    expect(calculator.displayValue).toBe(`${MINUS}1,234.56789`);
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
  describe("'AC'", () => {
    describe('Should remove history so far', () => {
      it('1 + 3 (AC) 4 = 4', async () => {
        calculator.press('1');
        calculator.press('plus');
        calculator.press('3');
        calculator.press('ac');
        calculator.press('4');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('4');
      });
    });
    it('Should turn current value into 0', async () => {
      calculator.press('1');
      calculator.press('plus');
      calculator.press('3');
      calculator.press('ac');
      expect(calculator.displayValue).toBe('0');
    });
    describe('Should remove ability to remember last operation when doing "double-equals"', () => {
      it('1 + 3 = (4) (AC) = (0) = (0)', async () => {
        calculator.press('1');
        calculator.press('plus');
        calculator.press('3');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('4');
        calculator.press('ac');
        expect(calculator.displayValue).toBe('0');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('0');
      });
    });
  });
  describe("'C'", () => {
    it('Should reactivate last op', async () => {
      calculator.press('1');
      calculator.press('plus');
      expect(calculator.activeOpButton).toBe('plus');
      calculator.press('2');
      expect(calculator.activeOpButton).toBe(null);
      calculator.press('c');
      expect(calculator.activeOpButton).toBe('plus');
    });
    describe('Should start typing next number if operation is dangling', () => {
      it('1 + 3 + (C) = 4', async () => {
        calculator.press('1');
        calculator.press('plus');
        calculator.press('3');
        calculator.press('plus');
        calculator.press('c');
        expect(calculator.displayValue).toBe('0');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('4');
      });
      it('1 + 3 * (C) = 1', async () => {
        calculator.press('1');
        calculator.press('plus');
        calculator.press('3');
        calculator.press('times');
        calculator.press('c');
        expect(calculator.displayValue).toBe('0');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('1');
      });
    });
    describe('Should turn current value into 0', () => {
      it('1 + 3 (C) 4 = 5', async () => {
        calculator.press('1');
        calculator.press('plus');
        calculator.press('3');
        calculator.press('c');
        expect(calculator.displayValue).toBe('0');
        calculator.press('4');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('5');
      });
      it('1 + 3 * 2 (C) 4 = 13', async () => {
        calculator.press('1');
        calculator.press('plus');
        calculator.press('3');
        calculator.press('times');
        calculator.press('2');
        calculator.press('c');
        expect(calculator.displayValue).toBe('0');
        calculator.press('4');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('13');
      });
      it('1 + 3 = (4) (C) = (0) = (3)', async () => {
        calculator.press('1');
        calculator.press('plus');
        calculator.press('3');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('4');
        calculator.press('c');
        expect(calculator.displayValue).toBe('0');
        calculator.press('equals');
        expect(calculator.displayValue).toBe('3');
      });
    });
  });
  it("Should show 'AC' by default", async () => {
    expect(calculator.showC).toBe(false);
  });
  it("Should still show 'AC' after inversion", async () => {
    calculator.press('sign');
    expect(calculator.showC).toBe(false);
  });
  it("Should still show 'AC' after clicking an op button", async () => {
    calculator.press('sign');
    expect(calculator.showC).toBe(false);
  });
  it("Should still show 'AC' after clicking percent button", async () => {
    calculator.press('percent');
    expect(calculator.showC).toBe(false);
  });
  it("Should start showing 'C' after a number is clicked", async () => {
    calculator.press('1');
    expect(calculator.showC).toBe(true);
  });
  it("Should start showing 'C' after decimal is clicked", async () => {
    calculator.press('decimal');
    expect(calculator.showC).toBe(true);
  });
  it("Should show 'AC' again after 'C' is clicked", async () => {
    calculator.press('decimal');
    expect(calculator.showC).toBe(true);
    calculator.press('c');
    expect(calculator.showC).toBe(false);
  });
});

describe('Percentage sign', () => {
  // keep op sign highlighted
  // 1 + 2 * 3 % = ?
  // 1+%+1 = 2
  // dangling values
  it('1 % = 0.01', async () => {
    calculator.press('1');
    calculator.press('percent');
    expect(calculator.displayValue).toBe('0.01');
    calculator.press('equals');
    expect(calculator.displayValue).toBe('0.01');
  });
  describe('Should wipe out percentaged display value when numbers are typed again', () => {
    it('1 % 2 = 2', async () => {
      calculator.press('1');
      calculator.press('percent');
      calculator.press('2');
      expect(calculator.displayValue).toBe('2');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('2');
    });
  });
  describe('Should calculate "dangling" value', () => {
    it('1 + 2 + % = 3.06', async () => {
      calculator.press('1');
      expect(calculator.displayValue).toBe('1');
      calculator.press('plus');
      expect(calculator.displayValue).toBe('1');
      calculator.press('2');
      expect(calculator.displayValue).toBe('2');
      calculator.press('plus');
      expect(calculator.displayValue).toBe('3');
      calculator.press('percent');
      expect(calculator.displayValue).toBe('0.06');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('3.03');
    });
    it('1 + 2 * % = 1.04', async () => {
      calculator.press('1');
      expect(calculator.displayValue).toBe('1');
      calculator.press('plus');
      expect(calculator.displayValue).toBe('1');
      calculator.press('2');
      expect(calculator.displayValue).toBe('2');
      calculator.press('times');
      expect(calculator.displayValue).toBe('2');
      calculator.press('percent');
      expect(calculator.displayValue).toBe('0.04');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('1.04');
    });
    it('1 + 2 * 3 / % = 101', async () => {
      calculator.press('1');
      expect(calculator.displayValue).toBe('1');
      calculator.press('plus');
      expect(calculator.displayValue).toBe('1');
      calculator.press('2');
      expect(calculator.displayValue).toBe('2');
      calculator.press('times');
      expect(calculator.displayValue).toBe('2');
      calculator.press('3');
      expect(calculator.displayValue).toBe('3');
      calculator.press('divide');
      expect(calculator.displayValue).toBe('6');
      calculator.press('percent');
      expect(calculator.displayValue).toBe('0.06');
      calculator.press('equals');
      expect(calculator.displayValue).toBe('101');
    });
  });
  describe('Op sign should stay highlighted', () => {
    it('1 + % = 1.01', async () => {
      calculator.press('1');
      calculator.press('plus');
      expect(calculator.activeOpButton).toBe('plus');
      calculator.press('percent');
      expect(calculator.activeOpButton).toBe('plus');
    });
  });

  // rememebr from  last equation
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
  it('Should invert inversion of ans if clicked again', async () => {
    calculator.press('1');
    calculator.press('minus');
    calculator.press('3');
    calculator.press('equals');
    expect(calculator.displayValue).toBe(`${MINUS}2`);
    calculator.press('sign');
    expect(calculator.displayValue).toBe('2');
    calculator.press('sign');
    expect(calculator.displayValue).toBe(`${MINUS}2`);
  });
  it('Should start typing next number (defaults to zero) when op is dangling and ± is pressed', async () => {
    calculator.press('1');
    calculator.press('plus');
    calculator.press('3');
    calculator.press('plus');
    calculator.press('sign');
    expect(calculator.displayValue).toBe(`${MINUS}0`);
  });
});

describe('Chaining', () => {
  describe('Double-equals', () => {
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
  });

  describe('Carrying forward values from last equation', () => {
    describe('Equation > Equals > Number > Equals', () => {
      describe('Should run last op on new number', () => {
        it('1 + 3 = 7 = => 10', async () => {
          calculator.press('1');
          calculator.press('plus');
          calculator.press('3');
          calculator.press('equals');
          calculator.press('7');
          calculator.press('equals');
          expect(calculator.displayValue).toBe('10');
        });
      });
      describe('Should run last op on new number, even if last op was nested within a bodmas tree', () => {
        it('12 + 3 / 3 = 15 = => 5', async () => {
          calculator.press('1');
          calculator.press('2');
          calculator.press('plus');
          calculator.press('3');
          calculator.press('divide');
          calculator.press('3');
          calculator.press('equals');
          calculator.press('1');
          calculator.press('5');
          calculator.press('equals');
          expect(calculator.displayValue).toBe('5');
        });
      });
    });
    describe('Equation > Equals > Number > Op > Equals', () => {
      describe('Should ignore all previous equation values if a new number was typed then an operation', () => {
        it('1 + 3 = 5 + = => 10', async () => {
          calculator.press('1');
          calculator.press('plus');
          calculator.press('3');
          calculator.press('equals');
          calculator.press('5');
          calculator.press('plus');
          calculator.press('equals');
          expect(calculator.displayValue).toBe('10');
        });
      });
    });
    describe('Equation > Equals > Op > Number > Equals', () => {
      describe('Should use the answer of the last equation as the left side of the new operation', () => {
        it('1 + 3 = x 6 = => 24', async () => {
          calculator.press('1');
          calculator.press('plus');
          calculator.press('3');
          calculator.press('equals');
          calculator.press('times');
          calculator.press('6');
          calculator.press('equals');
          expect(calculator.displayValue).toBe('24');
        });
      });
    });
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

  describe('active button', () => {
    it.each(['plus', 'minus', 'times', 'divide'] as const)(
      "Should highlight '%s' button right after being pressed",
      async (op) => {
        calculator.press(op);
        expect(calculator.activeOpButton).toBe(op);
      }
    );
    it.each(['plus', 'minus', 'times', 'divide'] as const)(
      "Should keep '%s' button highlighted after the sign being inverted (which starts typing the next number, but doesn't turn the button off)",
      async (op) => {
        calculator.press(op);
        expect(calculator.activeOpButton).toBe(op);
        calculator.press('sign');
        expect(calculator.activeOpButton).toBe(op);
      }
    );
    it.each(['plus', 'minus', 'times', 'divide'] as const)(
      "Should deactivate '%s' button after a number is typed",
      async (op) => {
        calculator.press(op);
        expect(calculator.activeOpButton).toBe(op);
        calculator.press('1');
        expect(calculator.activeOpButton).toBe(null);
      }
    );
    it.each([
      ['divide', 'plus'],
      ['divide', 'minus'],
      ['divide', 'times'],
      ['plus', 'divide'],
    ] as const)(
      "Should change from '%s' to '%s' button when pressed in succession",
      async (op1, op2) => {
        calculator.press(op1);
        expect(calculator.activeOpButton).toBe(op1);
        calculator.press(op2);
        expect(calculator.activeOpButton).toBe(op2);
      }
    );
  });
});

// test significant figure on comp[lex  numebrs]
// hitting equals twice runs last operation again
// 0 error
// E value
// do the font size
// copy and paste

// TEST PERCENTAGE
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

// TEST CANCEL
// C
// AC

// Improve lowest-common logic
// Make 0 left aligned

// strip mode stuff out

// backspace
// only change inout numbers
// reignite the op button
