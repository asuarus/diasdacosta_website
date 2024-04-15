import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'rec`harts';
import ReactDOM from 'react-dom';
import BendingMomentDiagram from './BendingMomentDiagram';
import math from 'mathjs';



let alphaB = 0.2;
let Fsy = 500;
let aspectRatio = 16;

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

function calculateFc(classification) {
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
}

function calculateCover(classification) {
    cover = 0;
    if (classification === A1) {
        cover = 20;
    } else if (classification === A2) {
        cover = 30;
    } else if (classification === B1) {
        cover = 40;
    } else if (classification === B2) {
        cover = 45;
    }
}

function calculateEffectiveDepth(depthNumber, cover, rebarDiameter) {
    let effectiveDepth = depthNumber - cover - rebarDiameter / 2;
    return effectiveDepth;
}

function calculateWebDepth(spanLength) {
    let webDepth = spanLength / (aspectRatio);
    return webDepth;
}


function calculateCrossSectionalArea(spanLength, effectiveDepth, Fc, webDepth) {
    let crossSectionalArea = alphaB * (spanLength * effectiveDepth) ** 2 (0.6 * (Fc ** 0.5)/Fsy) * webDepth * effectiveDepth;
    return crossSectionalArea;
}


