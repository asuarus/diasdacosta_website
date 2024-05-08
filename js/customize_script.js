const alphaB = 0.2;
const Fsy = 500;
const aspectRatio = 1.5;
const PI = 3.14159;


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

function calculateWebWidth(spanLength) {
    return ceil(spanLength / 16); 
}

function calculateCrossSectionDepth(crossSectionalDepth) {
    return ceil(crossSectionalDepth / aspectRatio); 
}

function calculateEffectiveDepth(crossSectionalDepth, cover, stirrup, rebarDiameter) {
    return ceil((crossSectionalDepth - cover - stirrup - (rebarDiameter / 2))); 
}

function calculateCrossSectionalArea(crossSectionalDepth, effectiveDepth, Fc, webDepth) {
    console.log('LOOK HERE HEY HEY HEY ', crossSectionalDepth, effectiveDepth, Fc, webDepth)
    return 0.2 * ((crossSectionalDepth / effectiveDepth) ** 2) * 0.6 * (Fc ** 0.5) / Fsy * webDepth * effectiveDepth;
}

function calculateNumberOfBars(Ast, rebar) {
    return ceil(Ast / (PI/(4*rebar**2)));
}

function ceil(num) {
    test = (num % 10)
    if (test === 0) {
        return num;
    } else {
        return (10 - test) + num;
    }
}


// second part






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

    crossSectionalWidth = calculateWebWidth(spanBar.value);
    console.log('crossSectionalDepth:', crossSectionalWidth);

    crossSectionalDepth = calculateCrossSectionDepth(crossSectionalWidth);
    console.log('webDepth:', crossSectionalDepth);

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
