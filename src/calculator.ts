import { Fraction } from './math';
type NumberKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Op = 'divide' | 'plus' | 'minus' | 'times';
type Key = NumberKey | Op | 'decimal' | 'percent' | 'sign' | 'equals' | 'c';
type Mode =
  | 'fresh'
  | 'fresh-with-op'
  | 'input'
  | 'input-with-op'
  | 'ans'
  | 'ans-with-op';

function showInput(mode: Mode) {
  switch (mode) {
    case 'fresh':
    case 'fresh':
    case 'fresh-with-op':
    case 'input':
    case 'input-with-op':
      return true;
    case 'ans':
    case 'ans-with-op':
    default:
      return false;
  }
}

export class Calculator {
  input: string;

  ans: Fraction;

  op: Op;

  mode: Mode;

  constructor() {
    this.input = '0';
    this.ans = new Fraction({ top: 0, bottom: 1 });
    this.op = 'plus';
    this.mode = 'fresh';
  }

  get displayValue() {
    if (showInput(this.mode)) {
      const [before, after] = this.input.split('.');
      return (
        Number(before).toLocaleString() +
        (typeof after === 'string' ? `.${after}` : '')
      ).replace('-', '–');
    } else {
      const value = Math.round(this.ans.toNumber() * 1e8) / 1e8;
      const eValue = Math.log10(Math.abs(value));
      const opts: Intl.NumberFormatOptions = {};
      console.log(value);
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
      displayValue: this.displayValue,
    };
  }

  press(key: Key) {
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
        this.op = key;
        switch (this.mode) {
          case 'fresh':
            console.log(new Fraction(Number(this.input)));
            this.ans = new Fraction(Number(this.input));
            this.input = '0';
            this.mode = 'fresh-with-op';
            break;
        }
        break;
      case 'percent':
      case 'sign':
        if (showInput(this.mode)) {
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
        switch (this.op) {
          case 'divide':
            this.ans = Fraction.divide(this.ans, Number(this.input));
            break;
          case 'minus':
            this.ans = Fraction.minus(this.ans, Number(this.input));
            break;
          case 'plus':
            this.ans = Fraction.plus(this.ans, Number(this.input));
            break;
          case 'times':
            this.ans = Fraction.times(this.ans, Number(this.input));
            break;
        }
        this.mode = 'ans';
        break;
      case 'c':
        this.input = '0';
        this.ans = new Fraction({ top: 0, bottom: 1 });
        this.op = 'plus';
        this.mode = 'fresh';
        break;
    }
  }
}
