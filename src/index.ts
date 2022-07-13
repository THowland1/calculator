import { Calculator } from './calculator';

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

render();

document
  .querySelectorAll<HTMLButtonElement>('button[data-key]')
  .forEach((btn) => {
    btn.addEventListener('click', (e) => {
      calculator.press((e.target as HTMLButtonElement).dataset.key as '1');
      render();
    });
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
