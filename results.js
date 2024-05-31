import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'rec`harts';
import ReactDOM from 'react-dom';
import BendingMomentDiagram from './BendingMomentDiagram';


const sec1 = document.getElementById('section1');
const sec2 = document.getElementById('section2');
const sec3 = document.getElementById('section3');
const cancelBtn = document.getElementById("cancel-btn");
const spanSlider = document.getElementById("span-slider");
const spanNumber = document.getElementById("span-length");
const depthNumber = document.getElementById("depthNumber");
const widthNumber = document.getElementById("widthNumber");
const liveLoad = document.getElementById("live-load");
const deadLoad = document.getElementById("dead-load");
const locationQues = document.getElementById('locationques');
const purposeQues = document.getElementById('purposeques');
const comboStrength = document.getElementById('combo-strength');
const comboShort = document.getElementById('combo-short');
const comboLong = document.getElementById('combo-long');
const rebarDiameter = document.getElementById('rebar-diameter');
const stirrup = document.getElementById('stirrup');
const compressiveStrength = document.getElementById('compressive-strength');
const elasticModulus = document.getElementById('elastic-modulus');
const yieldStrength = document.getElementById('yield-strength');
const elasticModulusSteel = document.getElementById('elastic-modulus-steel');
const effectiveDepth = document.getElementById('effective-depth');
const concreteCover = document.getElementById('concrete-cover');
const crossSectionalArea = document.getElementById('cross-sectional-area');
const rebars = document.getElementById('rebars');
const rebarWarning = document.getElementById('rebar-warning');
const designLoad = document.getElementById('design-load');
const cValue = document.getElementById('c-value');
const phiValue = document.getElementById('phi-value');
const MuoValue = document.getElementById('Muo-value');
const designShear = document.getElementById('design-shear');
const shearReinforcement = document.getElementById('shear-reinforcement');
const transverseSpacing = document.getElementById('transverse-spacing');
const crushingWarning = document.getElementById('crushing-warning');
const crushingWarning2 = document.getElementById('crushing-warning2');


let locationItem = 1;
let purposeItem = 0;
let compressiveStrengthSelection = 32;
let rebarValue = 16;
let stirrupValue = 10;
let Mstar = 3000000;
let Vstar = 100000;


window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

window.onload= function() {
    findAll();
}

function scrollToSection1() {
    sec1.scrollIntoView({ behavior: "smooth" });
    document.getElementById('trans-box1').style.visibility = "hidden";
}

function scrollToSection2() {
    sec2.scrollIntoView({ behavior: "smooth" });
    document.getElementById('trans-box2').style.visibility = "hidden";
}

function scrollToSection3() {
    sec3.scrollIntoView({ behavior: "smooth" });
    findAll();
    document.getElementById('trans-box3').style.visibility = "hidden";
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

spanSlider.addEventListener("input", function() {
    spanNumber.innerHTML = spanSlider.value;
    findAll();
    findCrossSection();
});

compressiveStrength.addEventListener('change', () => {
    if (locationItem == 1) {
      compressiveStrength.options[0].disabled = true;
    } else {
      compressiveStrength.options[0].disabled = false;
    }
    console.log('Clicked location:', locationItem);
    let compressiveStrengthSelectionTemp = compressiveStrength.options[compressiveStrength.selectedIndex];
    compressiveStrengthSelection = compressiveStrengthSelectionTemp.value;
    console.log('comp Strength selection:', compressiveStrengthSelection);
    findAll();
});

locationQues.addEventListener('click', function(event) {
  locationItem = Array.from(this.children).indexOf(event.target);
  console.log('Clicked location:', locationItem);
  findAll();
});

purposeQues.addEventListener('click', function(event) {
    purposeItem = Array.from(this.children).indexOf(event.target);
    console.log('Clicked purpose:', purposeItem); //residential,office,shopping area
    // findLoad(purposeItem,spanNumber.innerHTML,widthNumber.innerHTML,thicknessNumber.innerHTML);
});

rebarDiameter.addEventListener('change', (event) => {
    rebarValue = rebarDiameter.value;
    findAll();
});

stirrup.addEventListener('change', (event) => {
    stirrupValue = stirrup.value;
    findAll();
});

designLoad.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        Mstar = designLoad.value;
        findAll();
    }
});

designShear.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        Vstar = designShear.value;
        findAll();
    }
});

depthNumber.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        findAll();
    }
});

widthNumber.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        findAll();
    }
});

// depthNumber.addEventListener('input', (event) => {
//     findAll();
// });

// widthNumber.addEventListener('input', (event) => {
//     findAll();
// });

function findLoad(purpose, span, width, thickness){
    const conreteDensity = 25;
    let udl = 0; //uniformly distributed load (kPa)
    let cl = 0; //concentrated load (kN)
    let shortf = 0.7; //short-term factor
    let longf = 0.4; //long-term factor
    if (purpose == 0){ //residential
        udl = 1.5;
        cl = 1.8;
    } else if (purpose == 1){ //office
        udl = 3.0;
        cl = 2.7;
    } else { //shopping area
        udl = 4.0;
        cl = 3.7;
    }
    const lload = udl * span * width * thickness; // Q, live load
    const dload = conreteDensity * width * thickness; // G, dead load
    liveLoad.innerHTML = lload.toPrecision(4);
    deadLoad.innerHTML = dload.toPrecision(4);
    comboStrength.innerHTML = (1.2*dload + 1.5*lload).toPrecision(4);
    comboShort.innerHTML = (dload + shortf*lload).toPrecision(4);
    comboLong.innerHTML = (dload + longf*lload).toPrecision(4);
}

function findCrossSection(){
    widthNumber.value = (parseInt(spanNumber.innerHTML)/16).toPrecision(5);
    depthNumber.value = (parseInt(widthNumber.value)/1.5).toPrecision(5);
}

function setElasticModulus(){
    if (compressiveStrengthSelection == 25){
        elasticModulus.innerHTML = 26700;
    } else if (compressiveStrengthSelection == 32){
        elasticModulus.innerHTML = 30100;
    } else if (compressiveStrengthSelection == 40){
        elasticModulus.innerHTML = 32800;
    } else if (compressiveStrengthSelection == 50){
        elasticModulus.innerHTML = 34800;
    } else if (compressiveStrengthSelection == 65){
        elasticModulus.innerHTML = 37400;
    } else if (compressiveStrengthSelection == 80){
        elasticModulus.innerHTML = 39600;
    } else if (compressiveStrengthSelection == 100){
        elasticModulus.innerHTML = 42200;
    } else if (compressiveStrengthSelection == 120){
        elasticModulus.innerHTML = 44400;
    }
}

function findOutputs(){
    //variables
    const fc = compressiveStrengthSelection;
    const D = parseInt(depthNumber.value);
    let conC = concreteCover.innerHTML;
    //stirrupValue, rebarValue
    const fsy = yieldStrength.innerHTML;
    const W = parseInt(widthNumber.value);

    const Es = 200000;

    //concrete cover
    if (locationItem == 0 && fc == 25){
        conC = 30;
    } else if (locationItem == 0 && fc == 32){
        conC = 25;
    } else if (locationItem == 0 && fc >= 40){
        conC = 20;
    } else if (fc == 32){
        conC = 40;
    } else if (fc == 40){
        conC = 30;
    } else if (fc >= 50){
        conC = 25;
    }
    concreteCover.innerHTML = conC;

    //depth
    const eDepth = D - conC - stirrupValue - (rebarValue/2); //d
    effectiveDepth.innerHTML = eDepth.toPrecision(6);

    //cross-section area
    const Ast = 0.2 * Math.pow((D/rebarValue),2) * (0.6*Math.sqrt(fc)/fsy) * W * eDepth;
    crossSectionalArea.innerHTML = Ast.toPrecision(7);

    //rebars
    let nORebars = Math.ceil(Ast/((Math.PI)/4*Math.pow(rebarValue,2)));
    rebars.innerHTML = nORebars;

    if (rebars.innerHTML < 2){
        rebarWarning.innerHTML = "*Use a smaller rebar diameter";
    } else if (rebars.innerHTML > 8){
        rebarWarning.innerHTML = "*Use a greater rebar diameter";
    } else {
        rebarWarning.innerHTML = "";
    }

    //strength design
    let phi = 0.85;
    let Muo = 1;
    let est = 0;
    const alpha2 = 0.85 - 0.0015*fc;
    const gamma = 0.97 - 0.0025*fc;
    const b = W;
    const dsc = D - eDepth;

    function findc1(){
        const Asc = 2*((Math.PI)/4*Math.pow(rebarValue,2));
        const Tst = nORebars * fsy;
        // const Csc = Asc*(Es*((c-dsc)/c)*0.003 - alpha2*fc);
        // const C = alpha2*fc*gamma*c*b;
        const quadA = alpha2*fc*gamma*b;
        const quadB = 0.003*Asc*Es-Asc*alpha2*fc-Tst;
        const quadC = -0.003*Asc*Es*dsc;

        const c = (-quadB + Math.sqrt(Math.pow(quadB,2)-4*quadA*quadC))/(2*quadA);
        est = ((eDepth-c)/c)*0.003;
        const Csc = Asc*(Es*((c-dsc)/c)*0.003 - alpha2*fc);
        const C = alpha2*fc*gamma*c*b;

        const kuo = c/eDepth;
        Muo = C*(eDepth - 0.5*gamma*c)+Csc*(eDepth-dsc);
        phi = 1.24-13*kuo/12;
        if (phi > 0.85) {phi = 0.85;}
        if (phi < 0.65) {phi = 0.65;}

        cValue.innerHTML = c.toPrecision(5);
        phiValue.innerHTML = phi.toPrecision(5);
        MuoValue.innerHTML = (phi*Muo).toPrecision(9);
    }

    function findc2(){
        const Asc = 2*((Math.PI)/4*Math.pow(rebarValue,2));
        const Tst = nORebars * fsy;
        // const Csc = Asc*(Es*((c-dsc)/c)*0.003 - alpha2*fc);
        // const C = alpha2*fc*gamma*c*b;
        const quadA = alpha2*fc*gamma*b;
        const quadB = 0.003*Asc*Es-Asc*alpha2*fc+0.003*Ast*Es;
        const quadC = -0.003*Asc*Es*dsc-0.003*Ast*Es*eDepth;

        const c = (-quadB + Math.sqrt(Math.pow(quadB,2)-4*quadA*quadC))/(2*quadA);
        est = ((eDepth-c)/c)*0.003;
        const Csc = Asc*(Es*((c-dsc)/c)*0.003 - alpha2*fc);
        const C = alpha2*fc*gamma*c*b;

        const kuo = c/eDepth;
        Muo = C*(eDepth - 0.5*gamma*c)+Csc*(eDepth-dsc);
        phi = 1.24-13*kuo/12;
        if (phi > 0.85) {phi = 0.85;}
        if (phi < 0.65) {phi = 0.65;}
        
        cValue.innerHTML = c.toPrecision(5);
        phiValue.innerHTML = phi.toPrecision(5);
        MuoValue.innerHTML = (phi*Muo).toPrecision(9);
    }

    function findc(){
        showLoading();
        while (phi*Muo < Mstar){
            nORebars += 1;
            rebars.innerHTML = nORebars;
            if (rebars.innerHTML < 2){
                rebarWarning.innerHTML = "*Use a smaller rebar diameter";
            } else if (rebars.innerHTML > 8){
                rebarWarning.innerHTML = "*Use a greater rebar diameter";
            } else {
                rebarWarning.innerHTML = "";
            }
            findc1();
        }
        while (est < 0.0025){
            findc2();
            findc();
        }
        hideLoading();
    }

    findc1();
    findc();

    //shear force design
    function cot(x){ return 1 / Math.tan(x*Math.PI/180);} //x to degrees
    function crushSafety(){
        phi = 0.7;
        const dv = Math.max(0.72*D,0.9*eDepth);
        const epsilonx = (Math.abs(Mstar/dv)+Math.abs(Vstar))/(2*Es*Ast);
        console.log('ex:',epsilonx,Mstar,dv,Vstar,Es,Ast);
        const thetav = 29+7000*epsilonx;
        const Vumax = 0.55*0.9*fc*b*dv*((cot(thetav)+cot(90))/(1+Math.pow(cot(thetav),2)));

        if (phi*Vumax >= Vstar){
            crushingWarning.innerHTML = '';
            crushingWarning2.innerHTML = '';
        } else{
            crushingWarning2.innerHTML = 'not ';
            crushingWarning.innerHTML = ': revise cross-section dimensions';
        }
        console.log('phi*Vu.max:',phi*Vumax);
        console.log('V*:',Vstar);

        //shear resistance
        const kv = 0.4/(1+1500*epsilonx);
        const Vuc = kv*b*dv*Math.sqrt(fc);
        console.log('vuc:',kv,b,dv,fc);
        let ks = 0;
        phi = 0.75;

        if (D <= 300){
            ks = 1;
        } else if (300 < D && D < 650){
            ks = (1000/D)/700;
        } else{
            ks = 0.5;
        }
        
        if (Vstar <= ks*phi*Vuc){
            shearReinforcement.innerHTML = 'N/A';
        } else {
            const Asvmin = 0.08*Math.sqrt(fc)*b/fsy; //min shear reinforcement Asv.min/s
            const Vus = (Vstar/phi)-Vuc;
            const Asv = Vus/(fsy*dv*cot(thetav)); //Asv/s
            if (Asv >= Asvmin){
                shearReinforcement.innerHTML = Asv.toPrecision(4);
            } else{
                shearReinforcement.innerHTML = Asvmin.toPrecision(4);
            }
            console.log('Asv:',Asv);
        }
        transverseSpacing.innerHTML = Math.min(300,(0.5*D).toPrecision(3));
    }

    crushSafety()

    
    // draw cross-section
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = b+80;
    canvas.height = D+80;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = "2";
    console.log(b,D,canvas.width, canvas.height);

    ctx.beginPath();
    ctx.rect(40, 40, b, D);
    ctx.roundRect(conC+40,conC+40,b-2*conC,D-2*conC,[6]);
    ctx.roundRect(conC+stirrupValue+40,conC+stirrupValue+40,b-2*(conC+stirrupValue),D-2*(conC+stirrupValue),[6]);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(dsc+40, dsc+40, rebarValue/2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(b-dsc+40, dsc+40, rebarValue/2, 0, 2 * Math.PI);
    ctx.stroke();

    for (let i = 0; i < nORebars; i++) {
        ctx.beginPath();
        const tempCenter = dsc+(b-2*dsc)/(nORebars-1)*i;
        ctx.arc(tempCenter+40, eDepth+40, rebarValue/2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(b+50,40);
    ctx.lineTo(b+70,40);
    ctx.moveTo(b+60,40);
    ctx.lineTo(b+60,eDepth+40);
    ctx.moveTo(b+40-dsc,eDepth+40);
    ctx.lineTo(b+70,eDepth+40);

    ctx.moveTo(b+40-dsc,D+40-conC);
    ctx.lineTo(b+70,D+40-conC);
    ctx.moveTo(b+60,D+40-conC);
    ctx.lineTo(b+60,D+40);
    ctx.moveTo(b+50,D+40);
    ctx.lineTo(b+70,D+40);

    ctx.moveTo(10,40);
    ctx.lineTo(30,40);
    ctx.moveTo(20,40);
    ctx.lineTo(20,D+40);
    ctx.moveTo(10,D+40);
    ctx.lineTo(30,D+40);
    
    ctx.moveTo(40,10);
    ctx.lineTo(40,30);
    ctx.moveTo(40,20);
    ctx.lineTo(b+40,20);
    ctx.moveTo(b+40,10);
    ctx.lineTo(b+40,30);

    ctx.stroke();
    
}

function findAll(){
    setElasticModulus();
    findOutputs();
}



/*
write html, css, and js code based on the following:

the user chooses location of a beam: inland or coastal
the user can choose the span (L) of the beam: this will be a slider that defaults to 15m
for the cross-section, the depth (D) is defined as L/16, and width (W) is defined as D/1.5
for the rebar diameter, the user can choose between 16mm, 18mm, and 20mm: this will be a dropdown that defaults to 16mm

concrete properties: 
user can choose characteristic compressive strength (fc) based on the table below; however, the minimum choice will be based on the beam location chosen earlier:
    inland: fc >= 25MPa, coastal: fc >= 32MPa; this will be a dropdown defaulting to the minimum value
characteristic flexural tensile strength (fct.f) = 0.6 * sqrt(fc)
elastic modulus (Ec) will be based on fc according to this table:
fc (MPa): 20 25 32 40 50 65 80 100 120
Ec (MPa): 24000 26700 30100 32800 34800 37400 39600 42200 44400

steel properties:
Characteristic yield strength (fsy) = 500 MPa
Elastic modulus (Es) = 200 * 10^3 MPa

concrete cover (conC): this will be based on both beam location and fc:
    inland: 30mm (25MPa), 25 (32MPa), 20 (>=40MPa)
    coastal: 40mm (32MPa), 30 (40MPa), 25 (>=50MPa)
stirrup (stirrup): let the user choose between 10mm or 12mm: dropdown defaulting to 10mm
effective depth (d) = D - conC - stirrup - (diameter/2)
cross-sectional area (Ast) = (0.2 * (D/d)^2 * (fct.f/fsy)) * W * d

**note that for D and W, the dimensions should be rounded up to the nearest 10mm

these will be the variables shown; it will be shown in two columns
column 1:
    Span (L): slider for user selection (units: m)
    Cross-section: depth (D) and width (W) (units: mm)
    Rebar Diameter: dropdown for user selection (units: mm)
    Stirrup: dropdown for user selection (units: mm)
    Concrete Properties: fc and Ec, dropdown for fc for user selection
    Steel Properties: fsy and Es

column 2:
    Effective Depth (d) (units: mm)
    Concrete Cover (units: m)
    Cross-Sectional Area of Longitudinal Tensile Reinforcement (Ast) (units: mm^2)



if n.o.rebars <2 or >8 print error (use smaller/greater rebar diam)

Requirement: V* <= ks*phi*Vuc

Vu = Vuc + Vus

ks = 1 (D <= 300mm)
ks = 1000-D (300 < D < 650)
ks = 0.5 (D >= 650)

*/