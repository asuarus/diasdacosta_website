const Fsy = 500;
const aspectRatio = 1.5;
const Es = 200000;

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

let rebarValue = 16;
let concreteDensity = 25;
locationHTML.value = "none";
purposeHTML.value = "none";

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

function calculateNumberOfBars(Ast, rebarHTML) {
  return Math.ceil(Ast / ((Math.PI / 4) * Math.pow(rebarHTML, 2)));
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

function calcMomentCapacity(Fc, Ast, webWidth, effectiveDepth, cover, stirrup, rebar, Tst) {
    
  Fcprime = 0.6 * Math.pow(Fc, 0.5);

  alphatwo = 0.85 - 0.0015 * Fcprime;
  gamma = 0.97 - 0.0025 * Fcprime;

  Asc = 2 * ((Math.PI / 4) * Math.pow(rebarValue, 2));
  let dsc = Number(cover) + Number(stirrup) + Number(rebar);


  if (alphatwo < 0.67) alphatwo = 0.67;
  if (gamma < 0.67) gamma = 0.67;

  Tst = Ast * Fsy; // tensile force in reinforcement
  Csc = Asc * Fsy; // compressive force in compression reinforcement

  c = findc(alphatwo, Fc, gamma, webWidth, Asc, Es, dsc, Tst);

  epsilonst = (0.003 * (effectiveDepth - c)) / c;
  epsilonsc = (0.003 * (c - dsc)) / c;

  // Assumption Checking
  while (epsilonst < 0.0025) {
    Tst *= epsilonst;
    calcMomentCapacity(Fc, Ast, webWidth, effectiveDepth, cover, stirrup, rebar, Tst);
  }
  while (Csc > 0.0025 && epsilonsc > 0.0025) {
    Csc *= epsilonsc;
    calcMomentCapacity(Fc, Ast, webWidth, effectiveDepth, cover, stirrup, rebar, Tst);
  }

  C = alphatwo * Fcprime * webWidth * c * gamma;

  if (c > dsc) {
    Muo = C * (effectiveDepth - (gamma * c) / 2) + Csc * (effectiveDepth - dsc);
  } else {
    Muo =
      C * (effectiveDepth - (gamma * c) / 2) +
      Es * epsilonsc * (effectiveDepth - dsc);
  }

  kuo = c / effectiveDepth;
  phi = 1.24 - (13 * kuo) / 12;

  if (phi > 0.85) phi = 0.85;
  if (phi < 0.65) phi = 0.65;

  return phi * Muo;
}

function findc(alphatwo, Fc, gamma, webWidth, Asc, Es, dsc, Tst) {
  coeffA = alphatwo * Fc * gamma * webWidth;
  coeffB = 0.003 * Asc * Es - Asc * alphatwo * Fc - Tst;
  coeffC = -0.003 * Asc * Es * dsc;
  discriminant = coeffB * coeffB - 4 * coeffA * coeffC;
  
  root1 = (-coeffB + Math.sqrt(discriminant)) / (2 * coeffA);
  root2 = (-coeffB - Math.sqrt(discriminant)) / (2 * coeffA);
  root1 > root2 ? c = root1 : c = root2;
  if (c < dsc) {
    c =
      (-Tst - Asc * (Es * epsilonsc - alphatwo * Fcprime)) / (alphatwo * Fcprime * gamma * webWidth);
  }
 
  return c;
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
  AstHTML.innerHTML = crossSectionalArea.toPrecision(5);

  numberOfBars = calculateNumberOfBars(crossSectionalArea, Number(rebarHTML.value));
  console.log("numberOfBars:", numberOfBars);
  rebarNumHTML.innerHTML = numberOfBars.toPrecision(3);

  load = calculateDeadLoad(crossSectionalDepth, crossSectionalWidth, Number(permLoadHTML.value));
  console.log("load:", load);
  loadHTML.innerHTML = load.toPrecision(5);

  bendingMoment = calculateBendingMoment(load, Number(liveLoadHTML.value), Number(spanHTML.value));
  console.log("bendingMoment:", bendingMoment);

  momentCapacity = calcMomentCapacity(finalFc, crossSectionalArea, crossSectionalWidth, effectiveDepth, finalCover, Number(stirrupHTML.value), Number(rebarHTML.value), 0);
  console.log("momentCapacity:", momentCapacity);
  momentHTML.innerHTML = momentCapacity.toPrecision(6);

  drawCanvas(crossSectionalDepth, crossSectionalWidth, crossSectionalWidth, finalCover, Number(stirrupHTML.value), Number(rebarHTML.value), numberOfBars, effectiveDepth, finalCover + Number(stirrupHTML.value) + Number(rebarHTML.value) / 2);
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

if (FcHTML) {
  FcHTML.addEventListener("change", () => {
    console.log("FcHTML selection:", FcHTML.value);
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
