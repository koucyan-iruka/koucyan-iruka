// 文字盤の目盛りを生成（5分ごとの目盛りのみ）
const ticks = document.querySelector(".c-clock__ticks");
for (let i = 0; i < 12; i++) {
  const tick = document.createElement("span");
  tick.style.transform = `rotate(${i * 30}deg)`;
  ticks.appendChild(tick);
}

const elementH = document.querySelector(".c-clock__hour");
const elementM = document.querySelector(".c-clock__min");
const elementS = document.querySelector(".c-clock__sec");
const numH = elementH.querySelector(".c-clock__num");
const numM = elementM.querySelector(".c-clock__num");
const numS = elementS.querySelector(".c-clock__num");

function update() {
  // 現在時間の取得
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();

  // 時、分、秒を元に角度を計算（ミリ秒で滑らかに）
  const degS = (s + ms / 1000) * (360 / 60);
  const degM = m * (360 / 60) + degS / 60;
  const degH = (h % 12) * (360 / 12) + degM / 12;

  elementH.style.transform = `rotate(${degH}deg)`;
  elementM.style.transform = `rotate(${degM}deg)`;
  elementS.style.transform = `rotate(${degS}deg)`;

  const pad = (n) => String(n).padStart(2, "0");

  // 針の先端の数字（弧に沿って回転する＝アームの回転をそのまま反映）
  numH.textContent = h % 12 || 12;
  numM.textContent = pad(m);
  numS.textContent = pad(s);

  requestAnimationFrame(update);
}

update();
