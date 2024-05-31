var canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext("2d");

c.clearRect(0, 0, canvas.width, canvas.height);
c.lineWidth = "2";
console.log(webDepth, D, canvas.width, canvas.height);

c.beginPath();
c.rect(40, 40, b, D);
c.roundRect(concreteCover + 40, concreteCover + 40, b - 2 * concreteCover, D - 2 * concreteCover, [6]);
c.roundRect(
  concreteCover + stirrupValue + 40,
  concreteCover + stirrupValue + 40,
  webDepth - 2 * (concreteCover + stirrupValue),
  D - 2 * (concreteCover + stirrupValue),
  [6]
);
c.stroke();

c.beginPath();
c.arc(dsc + 40, dsc + 40, rebarValue / 2, 0, 2 * Math.PI);
c.stroke();

c.beginPath();
c.arc(webDepth - dsc + 40, dsc + 40, rebarValue / 2, 0, 2 * Math.PI);
c.stroke();

for (let i = 0; i < nORebars; i++) {
  c.beginPath();
  const tempCenter = dsc + ((webDepth - 2 * dsc) / (nORebars - 1)) * i;
  c.arc(tempCenter + 40, effectiveDepth + 40, rebarValue / 2, 0, 2 * Math.PI);
  c.stroke();
}

c.beginPath();
c.moveTo(webDepth + 50, 40);
c.lineTo(webDepth + 70, 40);
c.moveTo(webDepth + 60, 40);
c.lineTo(webDepth + 60, effectiveDepth + 40);
c.moveTo(webDepth + 40 - dsc, effectiveDepth + 40);
c.lineTo(webDepth + 70, effectiveDepth + 40);

c.moveTo(webDepth + 40 - dsc, D + 40 - concreteCover);
c.lineTo(webDepth + 70, D + 40 - concreteCover);
c.moveTo(webDepth + 60, D + 40 - concreteCover);
c.lineTo(webDepth + 60, D + 40);
c.moveTo(webDepth + 50, D + 40);
c.lineTo(webDepth + 70, D + 40);

c.moveTo(10, 40);
c.lineTo(30, 40);
c.moveTo(20, 40);
c.lineTo(20, D + 40);
c.moveTo(10, D + 40);
c.lineTo(30, D + 40);

c.moveTo(40, 10);
c.lineTo(40, 30);
c.moveTo(40, 20);
c.lineTo(webDepth + 40, 20);
c.moveTo(webDepth + 40, 10);
c.lineTo(webDepth + 40, 30);

c.stroke();
