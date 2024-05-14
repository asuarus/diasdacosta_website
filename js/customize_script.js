import * as Math from 'mathjs';

const alphaB = 0.2;
const Fsy = 500;
const aspectRatio = 1.5;
const Es = 200000;


const spanBar = document.getElementById('span-length');
const locationQues = document.getElementById('location');
const purposeQues = document.getElementById('purpose');
const rebarDiameter = document.getElementById('rebar-diameter');
const stirrup = document.getElementById('stirrup');
const desiredFc = document.getElementById('desired-fc');
const runButton = document.getElementById('button');

let compressiveStrengthSelection = 32;
let rebarValue = 16;
let stirrupValue = 10;
let Mstar = 3000000;
let Vstar = 100000;
let concreteDensity = 25;

locationQues.value = 'none';
purposeQues.value = 'none';  


///////////////////////////
///////////////////////////
// CALCULATION FUNCTIONS //
///////////////////////////
///////////////////////////


//intial calculations to find Fc
function getconcreteClassification(locationQues, purposeQues) {
    if (locationQues === 'interior') {

        if (purposeQues === 'residential') {
            return 'A1';
        } else if (purposeQues === 'non-residential') {
            return 'A2';
        } else if (purposeQues === 'industrial') {
            return 'B1';
        }

    } else if (locationQues === 'inland'){

        if (purposeQues === 'residential') {
            return 'A2';
        } else if (purposeQues === 'non-residential') {
            return 'A2';
        } else if (purposeQues === 'industrial') {
            return 'B1';
        }

    } else if (locationQues === 'near-coastal'){
        return 'B1';

    } else if (locationQues === 'coastal'){
        return 'B2';
    }
}

function calculateFc(classification, desiredFc) {
    Fc = 0;
    if (classification === 'A1') {
        Fc = 20;
    } else if (classification === 'A2') {
        Fc = 25;
    } else if (classification === 'B1') {
        Fc = 32;
    } else if (classification === 'B2') {
        Fc = 40;
    }

    if (desiredFc > Fc) {
        return desiredFc;
    } else {
        return Fc;
    }
}

function calculateCover(classification) {
    cover = 0;
    if (classification === 'A1') {
        return 20;
    } else if (classification === 'A2') {
        return 30;
    } else if (classification === 'B1') {
        return 40;
    } else if (classification === 'B2') {
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

function calculateEffectiveDepth(crossSectionalDepth, cover, stirrup, rebarDiameter) {
    return ceil((crossSectionalDepth - cover - stirrup - (rebarDiameter / 2))); 
}

function calculateCrossSectionalArea(crossSectionalDepth, rebarDiameter, effectiveDepth, Fc, webDepth) {
    return 0.2 * Math.pow((crossSectionalDepth/rebarDiameter),2) * (0.6*Math.sqrt(Fc)/Fsy) * webDepth * effectiveDepth;
}

function calculateNumberOfBars(Ast, rebarDiameter) {
    return Math.ceil(Ast/((Math.PI)/4*Math.pow(rebarDiameter,2)));
}

function ceil(num) {
    zerotest = (num % 10)
    if (zerotest === 0) {
        return num;
    } else {
        return (10 - zerotest) + num;
    }
}



// second part


// webDepth and webWidth are converted to meters
function calculateDeadLoad(webDepth, webWidth , permanentLoad) { 
    selfWeight = (webDepth/1000) * (webWidth/1000) * (webWidth/1000) * concreteDensity; // extra webWidth converts units to kN/m
    permanentLoad *= webWidth; // converts units from kPa to kN/m
    return selfWeight + permanentLoad; 
} //final answer in kN/m

// calculating bending moment in kN*m
function calculateBendingMoment(deadLoad, liveLoad, spanLength) {
    eq1 = 1.3 * deadLoad;
    eq2 = 1.2 * deadLoad + 1.5 * liveLoad;


    // using whichever standard equation is larger 
    eq1 > eq2 ? (eq1*spanLength*spanLength)/8 : (eq2*spanLength*spanLength)/8;
}


function momentCapacity(Fc, Ast, webWidth, effectiveDepth, D) {
    Fcprime = 0.6 * math.pow(Fc, 0.5);

    alphatwo = 0.85 - 0.0015*Fcprime;
    gamma = 0.97 - 0.0025*Fcprime;


    Asc = 2*((Math.PI)/4*Math.pow(rebarValue,2));;
    dsc = D - effectiveDepth; 

    if (alphatwo < 0.67)
        alphatwo = 0.67;
    if (gamma < 0.67)
        gamma = 0.67;

    Tst = Ast * Fsy; // tensile strength in reinforcement ?????
    Tsc = Asc * Fsy; // tensile strength in compression reinforcement ?????


    c = findc(alphatwo, Fc, gamma, webWidth, Asc, Es, dsc, Tst);

    epsilonst = 0.003*(effectiveDepth-c)/c;
    epsilonsc = 0.003*(c-dsc)/c;


    // Assumption Checking 
    while (epsilonst < 0.0025) {
        Tst *= epsilonst;
        c = findc(alphatwo, Fc, gamma, webWidth, Asc, Es, dsc, Tst);
    }
    while ((Tsc > 0.0025) && (epsilonsc > 0.0025)) {
        Tsc *= epsilonsc;
        c = findc(alphatwo, Fc, gamma, webWidth, Asc, Es, dsc, Tst);
    }

    

    MuoC = C*(effectiveDepth-gamma*c/2) + Es*epsilonsc*(effectiveDepth-dsc);
    MuoT = C*(effectiveDepth-gamma*c/2) + Tsc*(effectiveDepth-dsc);

    MuoC > MuoT ? Muo = MuoC : Muo = MuoT;

    kuo = c / effectiveDepth;
    phi = 1.24 - 13*kuo/12;

    if (phi > 0.85)
        phi = 0.85;
    if (phi < 0.65)
        phi = 0.65;

    return phi*Muo;
}

function findc(alphatwo, Fc, gamma, webWidth, Asc, Es, dsc, Tst) {

    coeffA = alphatwo*Fc*gamma*webWidth;
    coeffB = 0.003*Asc*Es-Asc*alphatwo*Fc-Tst;
    coeffC = -0.003*Asc*Es*dsc;

    c = (-coeffB + Math.sqrt(Math.pow(coeffB,2)-4*coeffA*coeffC))/(2*coeffA);

    if (c < dsc){  
        c = (-Tst - (Asc*(Es*epsilonsc - alphatwo*Fcprime)))/(alphatwo*Fcprime*gamma*webWidth);
    }

    return c;
}


//////////////////
// HERO SECTION //
//////////////////

function run() {
    console.log('RUNNING');

    console.log('spanBar:', spanBar.value);

    concreteClassification = getconcreteClassification(locationQues.value, purposeQues.value);
    console.log('concreteClassification:', concreteClassification);

    finalFc = calculateFc(concreteClassification, desiredFc.value);
    console.log('finalFc:', finalFc);

    finalCover = calculateCover(concreteClassification);
    console.log('finalCover:', finalCover);

    crossSectionalDepth = calculateWebDepth(spanBar.value);
    console.log('crossSectionalDepth:', crossSectionalDepth);

    crossSectionalWidth = calculateCrossSectionWidth(crossSectionalWidth);
    console.log('webWidth:', crossSectionalWidth);

    effectiveDepth = calculateEffectiveDepth(crossSectionalDepth, finalCover, stirrup.value, rebarDiameter.value);
    console.log('effectiveDepth:', effectiveDepth);

    crossSectionalArea = calculateCrossSectionalArea(crossSectionalDepth, effectiveDepth, finalFc, crossSectionalWidth);
    console.log('crossSectionalArea:', crossSectionalArea);

    numberOfBars = calculateNumberOfBars(crossSectionalArea, rebarDiameter.value);
    console.log('numberOfBars:', numberOfBars);
}



/////////////////////
// EVENT LISTENERS //
/////////////////////

window.onload= function() {
    console.log('onload');
    run();
}

if (runButton) {
    runButton.addEventListener('click', function() {
        console.log('button click');
        run();
    });
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.body.style.pointerEvents = 'none';
}
  
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.body.style.pointerEvents = 'auto';
}

function cancelFunc(){
    location.reload();
    hideLoading();
}

if (spanBar) {
    spanBar.addEventListener('change', function() {
        spanNumber = spanBar.value;
        console.log('span selection:', spanNumber);
        run();
    });
}

if (desiredFc) {
    desiredFc.addEventListener('change', () => {
        console.log('desiredFc selection:');
        run();
    });
}

if (locationQues) {
    locationQues.addEventListener('change', () => {
        console.log('location selection:', locationQues.value);
        run();
    });
}

if (purposeQues) {
    purposeQues.addEventListener('change', () => {
        console.log('purpose selection:', purposeQues.value);
        run();
    });
}

if (rebarDiameter) {
    rebarDiameter.addEventListener('change', () => {
        console.log('rebar selection:', rebarDiameter.value);
        run();
    });
}

if (stirrup) {
    stirrup.addEventListener('change', () => {
        console.log('stirrup selection:', stirrup.value);
        run();
    });
}
