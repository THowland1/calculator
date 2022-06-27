import { Fraction } from './math';
type NumberKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Op = 'divide' | 'plus' | 'minus' | 'times';
type Sign = 'sign';
type Decimal = 'decimal';
type Equals = 'equals';
type Clear = 'c' | 'ac';
type Key = NumberKey | Op | Sign | Decimal | 'percent' | Equals | Clear;
type Mode =
  | 'fresh'
  | 'fresh-with-op'
  | 'input'
  | 'input-with-op'
  | 'ans'
  | 'ans-with-op';

type EquationItem = Fraction | Op;
type HistoryItem = Fraction | Op | Equals; // | Sign;
interface Ans {
  lastNumber: Fraction;
  lastOp: Op;
  ans: Fraction;
}

const DEFAULT_INPUT = '0';
const DEFAULT_HISTORY = [new Fraction({ top: 0, bottom: 1 })];
const DEFAULT_LASTOP = { op: 'plus' as Op, number: new Fraction(0) };

function splitArray<TItem, TSeparator extends TItem = TItem>(
  arr: TItem[],
  separator: TSeparator
): Exclude<TItem, TSeparator>[][] {
  const result: Exclude<TItem, TSeparator>[][] = [[]];
  arr.forEach((item) => {
    if (item === separator) {
      result.push([]);
    } else {
      result.at(-1)!.push(item as Exclude<TItem, TSeparator>);
    }
  });

  return result;
}

function assertEquationValid(history: EquationItem[]) {
  let lastType: 'op' | 'number';

  history.forEach((item) => {
    const thisType = isOp(item) ? 'op' : 'number';
    if (thisType === lastType) {
      throw new Error('History must alternate between number and operation');
    }
    lastType = thisType;
  });
}

function isOp(val: Fraction | string): val is Op {
  return (
    typeof val === 'string' &&
    ['divide', 'plus', 'minus', 'times'].includes(val)
  );
}
function isNumber(val: Fraction | string): val is Fraction {
  return val instanceof Fraction;
}

// 1 + 3 = (4) = 7
// 1 + 3 = (4) * = 16
// 1 + 3 = (4) * 7 = 28
// 1 + 3 = (4) 7 = 10
// 1 + 3 = (4) 7 * = 49
/**
 * [] => [ANS, LASTOP, LASTNUMBER]
 * [OP] => [ANS, OP, ANS]
 * [OP, NUMBER] => [ANS, OP, NUMBER]
 * [NUMBER] => [ANS, LASTOP, NUMBER]
 * [NUMBER, OP] => [NUMBER, OP, NUMBER]
 */
function merge(ansBefore: Ans, history: EquationItem[]): EquationItem[] {
  let inferredHistory = [...history];
  if (!isNumber(inferredHistory[0])) {
    inferredHistory = [ansBefore.ans, ...inferredHistory];
  }

  assertEquationValid(inferredHistory);
  return inferredHistory;
}

function getCurrentEquation(history: HistoryItem[]): EquationItem[] {
  // "?"="1+2"="3/5"
  let equations = splitArray(history, 'equals' as Equals);
  let latestAns: Ans = {
    ans: new Fraction(0),
    lastNumber: new Fraction(0),
    lastOp: 'plus',
  };
  while (equations.length > 1) {
    const first = equations.shift()!;
    const firstMerged = merge(latestAns, first);
    latestAns = evaluateEquation(firstMerged, latestAns);
  }
  return merge(latestAns, equations[0]);
}

// // 1 + 3 = (4) = 7
// // 1 + 3 = (4) * = 16
// // 1 + 3 = (4) * 7 = 28
// // 1 + 3 = (4) 7 = 10
// // 1 + 3 = (4) 7 * = 49
// function shrinkHistories(history: HistoryItem[]): Ans {
//   const indexOfEquals = history.lastIndexOf('equals');

//   if (indexOfEquals < 0) {
//     return evaluateEquation(history, {
//       ans: new Fraction(0),
//       lastNumber: new Fraction(0),
//       lastOp: 'plus',
//     });
//   }

//   const before = history.slice(0, Math.max(indexOfEquals - 1, 0));
//   if (before.includes('equals')) {
//     console.warn('equals', indexOfEquals, before, history);
//   }
//   let after = history.slice(indexOfEquals + 2);
//   const beforeShrunk = shrinkHistories(before);

//   if (!(after[0] instanceof Fraction)) {
//     after = [beforeShrunk.ans, ...after];
//   }
//   if (!after.some((o) => isOp(o))) {
//     after.push(beforeShrunk.lastOp!, beforeShrunk.lastNumber!);
//   }

//   // this might be wrong, come back later
//   const afterShrunk = evaluateEquation(after, {
//     ans: new Fraction(0),
//     lastNumber: new Fraction(0),
//     lastOp: 'plus',
//   });

//   return afterShrunk;
// }

function evaluateEquation(
  history: EquationItem[],
  lastAns: Ans = {
    ans: new Fraction(0),
    lastNumber: new Fraction(0),
    lastOp: 'plus',
  }
): Ans {
  let compressedHistory = [...history];

  // If no op, repeat the op from the last equation (or +0 if this is the first one)
  if (!compressedHistory.some(isOp)) {
    compressedHistory.push(lastAns.lastOp, lastAns.lastNumber);
  }

  // If it doesn't end with a number, infer the number from the current context
  if (isOp(compressedHistory.at(-1)!)) {
    compressedHistory.push(getLocalValue(compressedHistory));
  }

  const lastOp = compressedHistory.filter(isOp).at(-1)!;
  const lastNumber = compressedHistory.filter(isNumber).at(-1)!;

  const ops: [Op, (left: Fraction, right: Fraction) => Fraction][] = [
    ['divide', Fraction.divide],
    ['times', Fraction.times],
    ['plus', Fraction.plus],
    ['minus', Fraction.minus],
  ];
  for (const [op, fn] of ops) {
    while (
      compressedHistory.includes(op) &&
      compressedHistory.indexOf(op) < compressedHistory.length - 1
    ) {
      const indexOfOp = compressedHistory.indexOf(op);
      const before = compressedHistory.slice(0, Math.max(indexOfOp - 1, 0));
      const after = compressedHistory.slice(indexOfOp + 2);
      const left = compressedHistory[indexOfOp - 1];
      const right = compressedHistory[indexOfOp + 1];
      if (!(left instanceof Fraction && right instanceof Fraction)) {
        console.error({
          compressedHistory,
          before,
          after,
          left,
          right,
          op,
          indexOfOp,
        });
        throw new Error('left and right must be fractions');
      }
      const newValue = fn(left, right);

      compressedHistory = [...before, newValue, ...after];
    }
  }

  const ans = compressedHistory[0] ?? new Fraction(0);
  if (!(ans instanceof Fraction)) {
    throw new Error('Must shrink down to one answer');
  }

  return {
    lastNumber,
    lastOp,
    ans,
  };
}

function getLocalValue(history: EquationItem[]): Fraction {
  const lastItem = history[history.length - 1];
  switch (lastItem) {
    case 'times':
    case 'divide':
      const lastPlusIndex = history.lastIndexOf('plus');
      const lastMinusIndex = history.lastIndexOf('minus');
      const start = Math.max(lastPlusIndex + 1, lastMinusIndex + 1);
      return evaluateEquation(history.slice(start, -1)).ans;
    case 'plus':
    case 'minus':
      return evaluateEquation(history.slice(0, -1)).ans;
    default:
      return lastItem;
  }
}

export class Calculator {
  input: string;

  history: EquationItem[];

  lastOp: {
    op: Op;
    number: Fraction;
  };

  freshAns = false;

  activeOpButton: Op | null = null;
  showC = false;

  constructor() {
    this.input = DEFAULT_INPUT;
    this.history = [...DEFAULT_HISTORY];
    this.lastOp = { ...DEFAULT_LASTOP };
  }

  private get showInput() {
    return !this.freshAns && this.history.at(-1) instanceof Fraction;
  }

  private get localValue() {
    return getLocalValue(this.history);
  }

  get displayValue() {
    if (this.showInput) {
      const [before, after] = this.input.split('.');
      return (
        Number(before).toLocaleString() +
        (typeof after === 'string' ? `.${after}` : '')
      ).replace('-', '–');
    } else {
      const value = Math.round(this.localValue.toNumber() * 1e8) / 1e8;
      if (!isFinite(value)) {
        return 'Error';
      }

      const eValue = Math.log10(Math.abs(value));
      const opts: Intl.NumberFormatOptions = {};
      if (eValue < 9) {
        opts.maximumSignificantDigits = 9;
      } else if (eValue < 10) {
        opts.maximumSignificantDigits = 7;
        opts.notation = 'scientific';
      } else if (eValue <= 100) {
        opts.maximumSignificantDigits = 6;
        opts.notation = 'scientific';
      } else {
        opts.maximumSignificantDigits = 5;
        opts.notation = 'scientific';
      }
      return value
        .toLocaleString('en-GB', opts)
        .replace('E', 'e')
        .replace('-', '–');
    }
  }

  toJSON() {
    return {
      input: this.input,
      history: this.history,
      localValue: this.localValue,
      displayValue: this.displayValue,
    };
  }

  private equal() {
    const ans = evaluateEquation(this.history, {
      ans: new Fraction(0),
      lastNumber: this.lastOp.number,
      lastOp: this.lastOp.op,
    });
    this.history = [ans.ans];
    this.lastOp = {
      op: ans.lastOp,
      number: ans.lastNumber,
    };
    this.freshAns = true;
  }

  private syncLastOpWithInput() {
    const lastItem = this.history.at(-1)!;
    const inputAsFraction = new Fraction(Number(this.input));
    if (lastItem instanceof Fraction) {
      this.history[this.history.length - 1] = inputAsFraction;
    } else {
      this.history.push(inputAsFraction);
    }
  }

  press(key: Key) {
    const lastItem = this.history.at(-1)!;

    if (key !== 'sign') {
      this.activeOpButton = null;
      this.freshAns = false;
    }

    switch (key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.showC = true;

        if (this.input.replace('.', '').replace('-', '').length < 9) {
          this.input =
            this.input.replace('-', '') === '0'
              ? this.input.replace('0', key)
              : this.input + key;
        }

        this.syncLastOpWithInput();

        break;
      case 'decimal':
        this.showC = true;

        if (!this.input.includes('.')) {
          this.input += '.';
        }
        break;
      case 'divide':
      case 'plus':
      case 'minus':
      case 'times':
        this.activeOpButton = key;

        if (isOp(lastItem)) {
          this.history[this.history.length - 1] = key;
        } else {
          this.input = '0';
          this.history.push(key);
        }
        break;
      case 'percent':
        // TODO - Add percent functionality
        break;
      case 'sign': {
        if (this.freshAns) {
          this.history[this.history.length - 1] = Fraction.times(
            this.history[this.history.length - 1] as Fraction,
            -1
          );
          break;
        }
        if (this.input.startsWith('-')) {
          this.input = this.input.replace('-', '');
        } else {
          this.input = `-${this.input}`;
        }

        this.syncLastOpWithInput();
        break;
      }

      case 'equals':
        this.equal();
        this.input = DEFAULT_INPUT;

        break;
      case 'c':
        this.showC = false;
        this.input = DEFAULT_INPUT;
        this.activeOpButton = this.history.filter(isOp).at(-1) ?? null;

        this.syncLastOpWithInput();
        break;
      case 'ac':
        this.input = DEFAULT_INPUT;
        this.history = [...DEFAULT_HISTORY];
        this.lastOp = { ...DEFAULT_LASTOP };
        break;
    }
  }
}
