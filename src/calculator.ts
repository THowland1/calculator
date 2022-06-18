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

type HistoryItem = Fraction | Op | Equals;
interface Ans {
  lastNumber: Fraction | null;
  lastOp: Op | null;
  ans: Fraction;
}

function isOp(val: Fraction | string): val is Op {
  return (
    typeof val === 'string' &&
    ['divide', 'plus', 'minus', 'times'].includes(val)
  );
}

// 1 + 3 = (4) = 7
// 1 + 3 = (4) * = 16
// 1 + 3 = (4) * 7 = 28
// 1 + 3 = (4) 7 = 10
// 1 + 3 = (4) 7 * = 49
function shrinkHistories(history: HistoryItem[]): Ans {
  const indexOfEquals = history.lastIndexOf('equals');
  const before = history.slice(0, Math.max(indexOfEquals - 1, 0));
  const after = history.slice(indexOfEquals + 2);
  const beforeShrunk = shrinkHistory(before);

  return beforeShrunk;
}

function shrinkHistory(history: HistoryItem[]): Ans {
  let compressedHistory = [...history];

  if (isOp(compressedHistory.at(-1) ?? '')) {
    compressedHistory.push(getLocalValue(compressedHistory));
  }

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
        throw new Error('left and right must be fractions');
      }
      const newValue = fn(left, right);
      console.log({
        compressedHistory,
        indexOfDivide: indexOfOp,
        before,
        after,
        left,
        right,
      });
      compressedHistory = [...before, newValue, ...after];
    }
  }

  const historyOps = history.filter((o) => isOp(o)) as Op[];
  const historyNumbers = history.filter(
    (o) => o instanceof Fraction
  ) as Fraction[];

  const ans = compressedHistory[0] ?? new Fraction(0);
  if (!(ans instanceof Fraction)) {
    throw new Error('Must shrink down to one answer');
  }

  return {
    lastNumber: historyNumbers.at(-1) ?? null,
    lastOp: historyOps.at(-1) ?? null,
    ans: compressedHistory[0] as Fraction,
  };
}

function getLocalValue(history: HistoryItem[]): Fraction {
  const lastItem = history[history.length - 1];
  switch (lastItem) {
    case 'times':
    case 'divide':
      const lastPlusIndex = history.lastIndexOf('plus');
      const lastMinusIndex = history.lastIndexOf('minus');
      const start = Math.max(lastPlusIndex + 1, lastMinusIndex + 1);
      return shrinkHistory(history.slice(start, -1)).ans;
    case 'plus':
    case 'minus':
    case 'equals':
      return shrinkHistory(history.slice(0, -1)).ans;
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
    return this.history[this.history.length - 1] instanceof Fraction;
  }

  // Local BODMAS context
  // 1 + 2 / 3 * 4 + => 1 + ((2 / 3) * 4) + ? => show 3.666
  // 1 + 2 / 3 * 4 * => 1 + (((2 / 3) * 4) * ?) => show 2.666
  // 1 + 2 / 3 * 4 / => 1 + (((2 / 3) * 4) / ?) => show 2.666
  // 1 + 2 / 3 / 4 / => 1 + (2 * 3 * ?) => show 6
  // 1 + 2 * 3 * => 1 + (2 * 3 * ?) => show 6
  // 1 + 2 * 3 + => 1 + (2 * 3) + ? => show 7
  private get currentValue() {
    return shrinkHistories(this.history);
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
      ans: this.ans,
      op: this.op,
      mode: this.mode,
      history: this.history,
      currentValue: this.currentValue,
      displayValue: this.displayValue,
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
