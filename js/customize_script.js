const calculations = require('./calculations');

const spanLength = document.getElementById('span-length');
const location = document.getElementById('location');
const purpose = document.getElementById('purpose');
const rebarDiameter = document.getElementById('rebar-diameter');
const stirrup = document.getElementById('stirrup');

getEventListeners('click', calc_button => {

    const classification = calculations.calculateClassification(location, purpose);
    const Fc = calculations.calculateFc(classification);
    const cover = calculations.calculateCover(classification);
    const effectiveDepth = calculations.calculateEffectiveDepth(spanLength, cover, rebarDiameter);
    const webDepth = calculations.calculateWebDepth(spanLength);
    const crossSectionalArea = calculations.calculateCrossSectionalArea(spanLength, effectiveDepth, Fc, webDepth);

    console.log(crossSectionalArea);
});
