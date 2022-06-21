import { Fraction } from './math';
type NumberKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Op = 'divide' | 'plus' | 'minus' | 'times';
type Sign = 'sign';
type Decimal = 'decimal';
type Equals = 'equals';
type Key = NumberKey | Op | Sign | Decimal | 'percent' | Equals | 'c';
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
  if (!compressedHistory.some((item) => isOp(item))) {
    compressedHistory.push(lastAns.lastOp, lastAns.lastNumber);
  }

  // If it doesn't end with a number, infer the number from the current context
  if (isOp(compressedHistory.at(-1)!)) {
    compressedHistory.push(getLocalValue(compressedHistory));
  }

  const lastOp = compressedHistory.filter((o) => isOp(o)).at(-1) as Op;
  const lastNumber = compressedHistory
    .filter((o) => o instanceof Fraction)
    .at(-1) as Fraction;

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

  history: HistoryItem[];

  ans: Fraction;

  op: Op;

  mode: Mode;

  errored: boolean;

  constructor() {
    this.input = '0';
    this.history = [new Fraction({ top: 0, bottom: 1 })];
    this.ans = new Fraction({ top: 0, bottom: 1 });
    this.op = 'plus';
    this.mode = 'fresh';
    this.errored = false;
  }

  private get showInput() {
    return this.history.at(-1) instanceof Fraction;
  }

  private get currentValue() {
    return getLocalValue(this.currentEquation);
  }

  private get localValue() {
    return getLocalValue(this.currentEquation);
  }

  private get currentEquation() {
    return getCurrentEquation(this.history);
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
      ans: this.ans,
      op: this.op,
      mode: this.mode,
      history: this.history,
      currentValue: this.currentValue,
      displayValue: this.displayValue,
      currentEquation: getCurrentEquation(this.history),
    };
  }

  press(key: Key) {
    const lastItem = this.history[this.history.length - 1];

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
        switch (this.mode) {
          case 'fresh-with-op':
            this.mode = 'input';
            break;
        }

        if (this.input.replace('.', '').length < 9) {
          this.input = this.input === '0' ? key : this.input + key;
        }

        const inputAsFraction = new Fraction(Number(this.input));
        if (lastItem instanceof Fraction) {
          this.history[this.history.length - 1] = inputAsFraction;
        } else {
          this.history.push(inputAsFraction);
        }
        break;
      case 'decimal':
        if (!this.input.includes('.')) {
          this.input += '.';
        }
        break;
      case 'divide':
      case 'plus':
      case 'minus':
      case 'times':
        if (isOp(lastItem)) {
          this.history[this.history.length - 1] = key;
        } else {
          this.input = '0';
          this.history.push(key);
        }
        this.op = key;
        switch (this.mode) {
          case 'fresh':
            this.ans = new Fraction(Number(this.input));
            this.input = '0';
            this.mode = 'fresh-with-op';
            break;
          case 'input':
            this.ans = new Fraction(Number(this.input));
            this.input = '0';
            this.mode = 'input-with-op';
            break;
        }
        break;
      case 'percent':
      case 'sign':
        if (this.showInput) {
          if (this.input.startsWith('-')) {
            this.input.replace('-', '');
          } else {
            this.input = `-${this.input}`;
          }
        } else {
          this.ans.top = 0 - this.ans.top;
        }
        break;
      case 'equals':
        this.history.push(key);

      case 'c':
        this.input = '0';
        this.ans = new Fraction({ top: 0, bottom: 1 });
        this.op = 'plus';
        this.mode = 'fresh';
        this.errored = false;
        break;
    }
  }
}
