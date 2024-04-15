var canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext("2d");

c.clearRect(0, 0, canvas.width, canvas.height);
c.lineWidth = "2";
console.log(b, D, canvas.width, canvas.height);

c.beginPath();
c.rect(40, 40, b, D);
c.roundRect(conC + 40, conC + 40, b - 2 * conC, D - 2 * conC, [6]);
c.roundRect(
  conC + stirrupValue + 40,
  conC + stirrupValue + 40,
  b - 2 * (conC + stirrupValue),
  D - 2 * (conC + stirrupValue),
  [6]
);
c.stroke();

c.beginPath();
c.arc(dsc + 40, dsc + 40, rebarValue / 2, 0, 2 * Math.PI);
c.stroke();

c.beginPath();
c.arc(b - dsc + 40, dsc + 40, rebarValue / 2, 0, 2 * Math.PI);
c.stroke();

for (let i = 0; i < nORebars; i++) {
  c.beginPath();
  const tempCenter = dsc + ((b - 2 * dsc) / (nORebars - 1)) * i;
  c.arc(tempCenter + 40, eDepth + 40, rebarValue / 2, 0, 2 * Math.PI);
  c.stroke();
}

c.beginPath();
c.moveTo(b + 50, 40);
c.lineTo(b + 70, 40);
c.moveTo(b + 60, 40);
c.lineTo(b + 60, eDepth + 40);
c.moveTo(b + 40 - dsc, eDepth + 40);
c.lineTo(b + 70, eDepth + 40);

c.moveTo(b + 40 - dsc, D + 40 - conC);
c.lineTo(b + 70, D + 40 - conC);
c.moveTo(b + 60, D + 40 - conC);
c.lineTo(b + 60, D + 40);
c.moveTo(b + 50, D + 40);
c.lineTo(b + 70, D + 40);

c.moveTo(10, 40);
c.lineTo(30, 40);
c.moveTo(20, 40);
c.lineTo(20, D + 40);
c.moveTo(10, D + 40);
c.lineTo(30, D + 40);

c.moveTo(40, 10);
c.lineTo(40, 30);
c.moveTo(40, 20);
c.lineTo(b + 40, 20);
c.moveTo(b + 40, 10);
c.lineTo(b + 40, 30);

c.stroke();
