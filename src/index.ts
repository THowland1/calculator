import { Calculator } from './calculator';

const calculator = new Calculator();

document.addEventListener('touchmove', (e) => e.preventDefault(), {
  passive: false,
});

const displayEl = document.getElementById('display');

function render() {
  document.body.dataset.mode = calculator.mode;
  document.body.dataset.op = calculator.op;
  localStorage.setItem('calculator', JSON.stringify(calculator.toJSON()));

  document
    .querySelectorAll('[data-selected]')
    .forEach((el) => el.toggleAttribute('data-selected', false));
  if (
    calculator.mode === 'fresh-with-op' ||
    calculator.mode === 'input-with-op'
  ) {
    document
      .querySelector(`[data-key='${calculator.op}']`)
      ?.toggleAttribute('data-selected', true);
  }

  const span = document.createElement('span');
  span.style.width = '100%';
  span.style.textAlign = 'end';
  span.innerHTML = calculator.displayValue;
  displayEl!.innerHTML = '';
  displayEl!.appendChild(span);

  span.style.fontSize = `${(100 * span.offsetWidth) / span.scrollWidth}%`;
}

render();

document
  .querySelectorAll<HTMLButtonElement>('button[data-key]')
  .forEach((btn) => {
    const key = btn.dataset.key;
    btn.addEventListener('click', () => {
      calculator.press(key as '1');
      render();
    });
  });
