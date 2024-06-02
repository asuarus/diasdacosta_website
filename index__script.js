
const spanHTML = document.getElementById("span-length");
const locationHTML = document.getElementById("location");
const purposeHTML = document.getElementById("purpose");
const rebarHTML = document.getElementById("rebar-diameter");
const stirrupHTML = document.getElementById("stirrup");
const FcHTML = document.getElementById("desired-fc");
const runButton = document.getElementById("run-button");
const AstHTML = document.getElementById("areaT");
const AscHTML = document.getElementById("areaC");
const rebarNumHTML = document.getElementById("numRebars");
const loadHTML = document.getElementById("design-load");
const momentHTML = document.getElementById("moment-capacity");
const permLoadHTML = document.getElementById("permanent-load");
const liveLoadHTML = document.getElementById("live-load");
const canvas = document.getElementById("canvasElement");


const Fsy = 500;
const aspectRatio = 1.5;
const Es = 200000;
var concreteDensity = 25;
locationHTML.value = "none";
purposeHTML.value = "none";
var momentCapacity = 0;
var nofRebars = 0;
var est = 0;

///////////////////////////
///////////////////////////
// CALCULATION FUNCTIONS //
///////////////////////////
///////////////////////////

//intial calculations to find Fc
function getconcreteClassification(locationHTML, purposeHTML) {
  if (locationHTML === "interior") {
    if (purposeHTML === "residential") {
      return "A1";
    } else if (purposeHTML === "non-residential") {
      return "A2";
    } else if (purposeHTML === "industrial") {
      return "B1";
    }
  } else if (locationHTML === "inland") {
    if (purposeHTML === "residential") {
      return "A2";
    } else if (purposeHTML === "non-residential") {
      return "A2";
    } else if (purposeHTML === "industrial") {
      return "B1";
    }
  } else if (locationHTML === "near-coastal") {
    return "B1";
  } else if (locationHTML === "coastal") {
    return "B2";
  }
}

function calculateFc(classification, FcHTML) {
  Fc = 0;
  if (classification === "A1") {
    Fc = 20;
  } else if (classification === "A2") {
    Fc = 25;
  } else if (classification === "B1") {
    Fc = 32;
  } else if (classification === "B2") {
    Fc = 40;
  }

  if (FcHTML > Fc) {
    return FcHTML;
  } else {
    return Fc;
  }
}

function calculateCover(classification) {
  cover = 0;
  if (classification === "A1") {
    return 20;
  } else if (classification === "A2") {
    return 30;
  } else if (classification === "B1") {
    return 40;
  } else if (classification === "B2") {
    return 45;
  }
  return cover;
}

function calculateWebDepth(spanLength) {
  return ceil(spanLength / 16);
}

function calculateCrossSectionWidth(crossSectionalDepth) {
  return ceil(crossSectionalDepth / aspectRatio);
}

function calculateEffectiveDepth(
  crossSectionalDepth,
  cover,
  stirrupHTML,
  rebarHTML
) {
  return ceil(crossSectionalDepth - cover - stirrupHTML - rebarHTML / 2);
}

function calculateCrossSectionalArea(
  crossSectionalDepth,
  rebarHTML,
  effectiveDepth,
  Fc,
  webDepth
) {
  return (
    0.2 *
    Math.pow(crossSectionalDepth / rebarHTML, 2) *
    ((0.6 * Math.sqrt(Fc)) / Fsy) *
    webDepth *
    effectiveDepth
  );
}

function calculateNumberOfBars(Ast, rebar) {
  nofRebars = Math.ceil(Ast / ((Math.PI / 4) * Math.pow(rebar, 2)));
}

function ceil(num) {
  zerotest = num % 10;
  if (zerotest === 0) {
    return num;
  } else {
    return 10 - zerotest + num;
  }
}

// second part

// webDepth and webWidth are converted to meters
function calculateDeadLoad(webDepth, webWidth, permLoad) {
  selfWeight =
    (webDepth / 1000) * (webWidth / 1000) * (webWidth / 1000) * concreteDensity; // extra webWidth converts units to kN/m
  permLoad *= webWidth; // converts units from kPa to kN/m
  return selfWeight + permLoad;
} //final answer in kN/m

// calculating bending momentHTML in kN*m
function calculateBendingMoment(deadLoad, liveLoad, spanLength) {
  eq1 = 1.3 * deadLoad;
  eq2 = 1.2 * deadLoad + 1.5 * liveLoad;

  // using whichever standard equation is larger
  return (eq1 > eq2
    ? (eq1 * spanLength * spanLength) / 8
    : (eq2 * spanLength * spanLength) / 8);
}

function calcMomentCapacity(Fc, webWidth, effectiveDepth, cover, rebar, stirrup, designLoad, Es) {
    
  Fcprime = 0.6 * Math.pow(Fc, 0.5);

  alphatwo = 0.85 - 0.0015 * Fcprime;
  gamma = 0.97 - 0.0025 * Fcprime;
  
  let dsc = Number(cover) + Number(stirrup) + Number(rebar);


  if (alphatwo < 0.67) alphatwo = 0.67;
  if (gamma < 0.67) gamma = 0.67;

  findc1(rebar, Fcprime, gamma, webWidth, alphatwo, Es, dsc, effectiveDepth);
  findc(designLoad, rebar, Fsy, alphatwo, Fcprime, gamma, webWidth, Es, dsc, effectiveDepth);
}

function findc1(rebar, Fcprime, gamma, webWidth, alphatwo, Es, dsc, effectiveDepth){
  const Asc = 2*((Math.PI)/4*Math.pow(rebar,2));
  AscHTML.value = Asc.toPrecision(5);
  const Tst = nofRebars * Fsy;

  const coeffA = alphatwo*Fcprime*gamma*webWidth;
  const coeffB = 0.003*Asc*Es-Asc*alphatwo*Fcprime-Tst;
  const coeffC = -0.003*Asc*Es*dsc;

  const c = (-coeffB + Math.sqrt(Math.pow(coeffB,2)-4*coeffA*coeffC))/(2*coeffA);

  est = ((effectiveDepth-c)/c)*0.003;
  const Csc = Asc*(Es*((c-dsc)/c)*0.003 - alphatwo*Fcprime);
  const C = alphatwo*Fcprime*gamma*c*webWidth;

  const kuo = c/effectiveDepth;
  Muo = C*(effectiveDepth - 0.5*gamma*c)+Csc*(effectiveDepth-dsc);
  phi = 1.24-13*kuo/12;
  if (phi > 0.85) {phi = 0.85;}
  if (phi < 0.65) {phi = 0.65;}

  momentCapacity = (phi*Muo).toPrecision(9); 
}

function findc2(rebar, Fsy, alphatwo, Fc, gamma, webWidth, Es, dsc, effectiveDepth){
  const Asc = 2*((Math.PI)/4*Math.pow(rebar,2));
  AscHTML.value = Asc.toPrecision(5);
  const Tst = nofRebars * Fsy;
  const coeffA = alphatwo*Fc*gamma*webWidth;
  const coeffB = 0.003*Asc*Es-Asc*alphatwo*Fc-Tst;
  const coeffC = -0.003*Asc*Es*dsc;

  const c = (-coeffB + Math.sqrt(Math.pow(coeffB,2)-4*coeffA*coeffC))/(2*coeffA);

  est = ((effectiveDepth-c)/c)*0.003;
  const Csc = Asc*(Es*((c-dsc)/c)*0.003 - alphatwo*Fc);
  const C = alphatwo*Fc*gamma*c*webWidth;

  const kuo = c/effectiveDepth;
  Muo = C*(effectiveDepth - 0.5*gamma*c) + Csc*(effectiveDepth-dsc);
  phi = 1.24-13*kuo/12;
  if (phi > 0.85) {phi = 0.85;}
  if (phi < 0.65) {phi = 0.65;}
  
  momentCapacity = (phi*Muo).toPrecision(9);
}

function findc(designLoad, rebar, Fsy, alphatwo, Fc, gamma, webWidth, Es, dsc, effectiveDepth){
  count = 0;
  while (momentCapacity < designLoad){
      nofRebars += 1;
      rebarNumHTML.value = nofRebars;
      findc1(rebar, Fsy, alphatwo, Fc, gamma, webWidth, Es, dsc, effectiveDepth);
  }
  while (est < 0.0025){
      findc2(rebar, Fsy, alphatwo, Fc, gamma, webWidth, Es, dsc, effectiveDepth);
      findc(rebar, Fsy, alphatwo, Fc, gamma, webWidth, Es, dsc, effectiveDepth);
  }
  count = 0;
}

function drawCanvas(webDepth, D, b, concreteCover, stirrupValue, rebarValue, nORebars, effectiveDepth, dsc) {
    

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
}

//////////////////
// HERO SECTION //
//////////////////

function run() {
  console.log("RUNNING");

  console.log("spanHTML:", Number(spanHTML.value));

  concreteClassification = getconcreteClassification(locationHTML.value, purposeHTML.value);
  console.log("concreteClassification:", concreteClassification);

  finalFc = calculateFc(concreteClassification, Number(FcHTML.value));
  console.log("finalFc:", finalFc);

  finalCover = calculateCover(concreteClassification);
  console.log("finalCover:", finalCover);

  crossSectionalDepth = calculateWebDepth(Number(spanHTML.value));
  console.log("crossSectionalDepth:", crossSectionalDepth);

  crossSectionalWidth = calculateCrossSectionWidth(crossSectionalDepth);
  console.log("webWidth:", crossSectionalWidth);

  effectiveDepth = calculateEffectiveDepth(crossSectionalDepth, finalCover, Number(stirrupHTML.value), Number(rebarHTML.value));
  console.log("effectiveDepth:", effectiveDepth);

  crossSectionalArea = calculateCrossSectionalArea(crossSectionalDepth, Number(rebarHTML.value), effectiveDepth, finalFc, crossSectionalWidth);
  console.log("crossSectionalArea:", crossSectionalArea);
  AstHTML.value = crossSectionalArea.toPrecision(5);

  calculateNumberOfBars(crossSectionalArea, Number(rebarHTML.value));
  console.log("numberOfBars:", nofRebars);
  rebarNumHTML.value = nofRebars.toPrecision(2);

  load = calculateDeadLoad(crossSectionalDepth, crossSectionalWidth, Number(permLoadHTML.value));
  console.log("load:", load);
  loadHTML.value = load.toPrecision(5);

  bendingMoment = calculateBendingMoment(load, Number(liveLoadHTML.value), Number(spanHTML.value));
  console.log("bendingMoment:", bendingMoment);

  calcMomentCapacity(finalFc, crossSectionalWidth, effectiveDepth, finalCover, Number(rebarNumHTML.value), Number(stirrupHTML.value), bendingMoment, Es);
  console.log("momentCapacity:", momentCapacity);
  momentHTML.value = momentCapacity;

  drawCanvas(crossSectionalDepth, crossSectionalWidth, crossSectionalWidth, finalCover, Number(stirrupHTML.value), Number(rebarHTML.value), nofRebars, effectiveDepth, finalCover + Number(stirrupHTML.value) + Number(rebarHTML.value) / 2);
  rebarNumHTML.value = nofRebars;
  console.log("DONE");
}



/////////////////////
// EVENT LISTENERS //
/////////////////////

window.onload = function () {
  console.log("onload");
  run();
};

if (runButton) {
  runButton.addEventListener("click", function () {
    console.log("button click");
    run();
  });
}

if (spanHTML) {
  spanHTML.addEventListener("change", function () {
    spanNumber = spanHTML.value;
    console.log("span selection:", spanNumber);
    run();
  });
}

if (FcHTML) {
  FcHTML.addEventListener("change", () => {
    console.log("FcHTML selection:");
    run();
  });
}

if (locationHTML) {
  locationHTML.addEventListener("change", () => {
    console.log("location selection:", locationHTML.value);
    run();
  });
}

if (purposeHTML) {
  purposeHTML.addEventListener("change", () => {
    console.log("purpose selection:", purposeHTML.value);
    run();
  });
}

if (rebarHTML) {
  rebarHTML.addEventListener("change", () => {
    console.log("rebar selection:", rebarHTML.value);
    run();
  });
}

if (stirrupHTML) {
  stirrupHTML.addEventListener("change", () => {
    console.log("stirrupHTML selection:", stirrupHTML.value);
    run();
  });
}


if (permLoadHTML) {
  permLoadHTML.addEventListener("change", () => {
    console.log("permLoadHTML selection:", permLoadHTML.value);
    run();
  });
}

if (liveLoadHTML) {
  liveLoadHTML.addEventListener("change", () => {
    console.log("liveLoadHTML selection:", liveLoadHTML.value);
    run;
  });
}
