import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'rec`harts';
import ReactDOM from 'react-dom';
import BendingMomentDiagram from './BendingMomentDiagram';
import math from 'mathjs';


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
const locationQues = document.getElementById('location');
const purposeQues = document.getElementById('purpose');
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


//intial calculations to find Fc
const mInteriorClassification = math.matrix(["A1", "A2", "B1"]); //Residential, Non-Residential, Industrial
const mExteriorClassification = math.matrix(["A2", "B1", "B2"], ["B1", "B1", "B2"]); //inland, near-coastal, coastal
                                                                     //Non-Industrial
                                                                         //Industrial
function concreteClassification(locationQues, purposeQues) {
    if (locationQues === 'interior') {

        if (purposeQues === 'residential') {
            return mInteriorClassification.get([0]);
        } else if (purposeQues === 'non-residential') {
            return mInteriorClassification.get([1]);
        } else if (purposeQues === 'industrial') {
            return mInteriorClassification.get([2]);
        }

    } else if (locationQues === 'exterior') {

        l = 0;

        if (purposeQues === 'industrial') {
            l = 1;
        }

        if (purposeQues === 'residential') {
            return mExteriorClassification.get([0, l]);
        } else if (purposeQues === 'near-coastal') {
            return mExteriorClassification.get([1, l]);
        } else if (purposeQues === 'coastal') {
            return mExteriorClassification.get([2, l]);
        }

    }
}

function calculateFc(locationItem, purposeItem) {
    let classification = concreteClassification(locationItem, purposeItem);
    let Fc = 0;
    if (classification === 'A1') {
        Fc = 20;
    } else if (classification === 'A2') {
        Fc = 25;
    } else if (classification === 'B1') {
        Fc = 32;
    } else if (classification === 'B2') {
        Fc = 40;
    }
    return Fc;
}

function calculateCover(classification) {
    let cover = 0;
    if (classification === A1) {
        cover = 20;
    } else if (classification === A2) {
        cover = 30;
    } else if (classification === B1) {
        cover = 40;
    } else if (classification === B2) {
        cover = 45;
    }
    return cover;
}

