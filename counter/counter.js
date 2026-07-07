let counter = 0;
const counterValue = document.getElementById('counter-value');
const incrementBtn = document.getElementById('increment-btn');
const decrementBtn = document.getElementById('decrement-btn');
const resetBtn = document.getElementById('reset');

incrementBtn.addEventListener('click', () => {
    counter++;
    counterValue.textContent = counter;
});

decrementBtn.addEventListener('click', () => {
    counter--;
    counterValue.textContent = counter;
});

resetBtn.addEventListener('click', () => {
    counter = 0;
    counterValue.textContent = counter;
});
