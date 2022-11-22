const SpecsheetGen = require('./assets/specsheets/mobSpecSheetGen.json');
const SpecsheetDist = require('./assets/specsheets/mobSpecSheet.json');

let roundCost = 20;
const minWaveCount = 10;

function generateRound(round) {
    Object.keys(SpecsheetGen).forEach((x) => {
        while (true) {
            let defaultCost = SpecsheetGen[x].defaultCost;
            let currentVariation = SpecsheetGen[x].currentVariation;
            let monsterDelta = 21 - SpecsheetGen[x].variations;

            if (defaultCost * ((currentVariation + 1) * monsterDelta * 2 + 1) * minWaveCount <= roundCost) {
                SpecsheetGen[x].currentVariation++;
            } else {
                break;
            }
        }
    });
    if (round % 5 != 0) {
        // 보스 라운드가 아닐 때

        let availableMonsters = Object.keys(SpecsheetGen).filter((x) => {
            return SpecsheetGen[x].defaultCost * (SpecsheetGen[x].currentVariation * (21 - SpecsheetGen[x].variations) * 2 + 1) * minWaveCount <= roundCost;
        });

        console.log(availableMonsters);
    } else {
        // 보스 라운드일 때
    }

    roundCost = Math.floor(roundCost * 1.1 + 20);
}

for (let i = 1; i <= 10; i++) {
    generateRound(i);
    console.log(roundCost);
}