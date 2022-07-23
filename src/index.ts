import { Calculator } from './calculator';

// TODO stop gorwing
// TODO fade button after click

document.getElementById('version')!.innerText = process.env.BUILD_TIME ?? '';

const calculator = new Calculator();

document.addEventListener('touchmove', (e) => e.preventDefault(), {
  passive: false,
});

const displayEl = document.getElementById('display');

function render() {
  localStorage.setItem('calculator', JSON.stringify(calculator.toJSON()));

  document
    .querySelectorAll('[data-selected]')
    .forEach((el) => el.toggleAttribute('data-selected', false));
  document
    .querySelector(`[data-key='${calculator.activeOpButton}']`)
    ?.toggleAttribute('data-selected', true);

  document
    .querySelector(`[data-key='c'], [data-key='ac']`)
    ?.setAttribute('data-key', calculator.showC ? 'c' : 'ac');

  const span = document.createElement('span');
  span.style.whiteSpace = 'nowrap';
  span.style.width = '100%';
  span.style.textAlign = 'end';
  span.innerHTML = calculator.displayValue;
  displayEl!.innerHTML = '';
  displayEl!.appendChild(span);

  span.style.fontSize = `${(100 * span.offsetWidth) / span.scrollWidth}%`;
}

const allButtons =
  document.querySelectorAll<HTMLButtonElement>('button[data-key]');

render();

function clearAllButtonsPressedState() {
  allButtons.forEach((btn) => {
    btn.classList.toggle('pressed', false);
  });
}
function pressButtonAtCoordinates(evt: PointerEvent) {
  const el = document.elementFromPoint(evt.x, evt.y);
  if (el instanceof HTMLButtonElement) {
    el.classList.toggle('pressed', true);
  }
}
document.addEventListener('pointerdown', (touch) => {
  clearAllButtonsPressedState();
  pressButtonAtCoordinates(touch);
});
let lastbounds: [left: number, bottom: number, right: number, top: number] = [
  0, 0, 0, 0,
];
document.addEventListener('pointermove', (touch) => {
  const { x, y } = touch;
  const [l, b, r, t] = lastbounds;
  if (x > l && x < r && y > t && y < b) {
    return;
  }
  const el = document.elementFromPoint(x, y);
  if (el instanceof HTMLButtonElement) {
    const { top, bottom, left, right } = el.getBoundingClientRect();
    console.log({ top, bottom, left, right });

    lastbounds = [left, bottom, right, top];
  }
  clearAllButtonsPressedState();
  pressButtonAtCoordinates(touch);
});
document.addEventListener('pointerup', (touch) => {
  clearAllButtonsPressedState();

  const el = document.elementFromPoint(touch.x, touch.y);
  if (el instanceof HTMLButtonElement) {
    const key = el.dataset.key;
    if (typeof key === 'string') {
      calculator.press(key as '1');
      render();
    }
  }
});

const growBtn = document.querySelector('#grow')!;
const shrinkBtn = document.querySelector('#shrink')!;
const root = document.querySelector(':root') as HTMLElement;
const calulatorDiv = document.querySelector('.calculator') as HTMLElement;

growBtn!.addEventListener('click', (e) => {
  growBtn.classList.toggle('hidden', true);
  shrinkBtn.classList.toggle('hidden', false);
  root.classList.toggle('big', true);
});
shrinkBtn!.addEventListener('click', (e) => {
  growBtn.classList.toggle('hidden', false);
  shrinkBtn.classList.toggle('hidden', true);
  root.classList.toggle('big', false);
});

function resetWindowHeight() {
  root.style.setProperty('--innerheight-unitless', String(window.innerHeight));
  root.style.setProperty(
    '--calculator-height-unitless',
    String(calulatorDiv.clientHeight)
  );
}
resetWindowHeight();
addEventListener('resize', resetWindowHeight);
