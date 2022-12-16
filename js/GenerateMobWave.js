module.exports = function generateRound(SpecsheetGen, round, roundCost, hpFactor) {
    let minWaveCount = 10;
    let maxWaveCount = 10;
    if (round <= 5) maxWaveCount = 10;
    else if (round <= 10) maxWaveCount = 15;
    else if (round <= 15) maxWaveCount = 20;
    else if (round <= 20) maxWaveCount = 30;
    else if (round <= 25) maxWaveCount = 40;
    else if (round <= 30) maxWaveCount = 50;
    else if (round <= 35) maxWaveCount = 60;
    else if (round <= 40) maxWaveCount = 70;
    else if (round <= 45) maxWaveCount = 80;
    else maxWaveCount = 100;

    // 최소 코스트를 설정해서,
    // 라운드에 비해서 너무 약한 몬스터는 사용하지 않도록 하고
    // maxWaveCount 내에 무조건 완료되도록 한다

    let currentCost = (round % 5 == 0 ? roundCost * 0.5 : roundCost);
    let minimumCost = Math.floor(roundCost / maxWaveCount);
    let currentWaveCount = 0;
    let currentWaveInfo = [];

    // 라운드 시작시마다 현재 roundCost에 대해서
    // minWaveCount (10) 만큼의 웨이브를 생성할 수 있는 최대 Variation을 설정한다.

    Object.keys(SpecsheetGen).forEach((x) => {
        while (true) {
            let currentVariation = SpecsheetGen[x].currentVariation;

            if (SpecsheetGen[x].boss) break;
            if (currentVariation == SpecsheetGen[x].variations) break;

            if (SpecsheetGen[x].variationCost[currentVariation + 1] * minWaveCount <= roundCost) {
                SpecsheetGen[x].currentVariation++;
            } else {
                break;
            }
        }
    });

    let availableMonsters;

    // 한 웨이브에는 몬스터 종류당 10~20마리 소환
    // 물론 중복해서 뽑힐 경우는 중복 가능

    const WaveMonsterCount = [10, 15, 20, 25, 30];

    if (round % 5 == 0) {
        // 보스 라운드일 때
        let waveBoss = Object.keys(SpecsheetGen).filter((x) => SpecsheetGen[x].boss)[Math.floor(((round - 5) % 25) / 5)];
        currentWaveInfo.push({
            "mobName": waveBoss,
            "mobCount": 1,
            "hpFactor": (hpFactor * (roundCost / 60)).toFixed(2),
            "mobRoute": "X"
        });
    }

    while (currentWaveCount < maxWaveCount) {

        let currentWaveMonsterCount = 10;
        
        if (maxWaveCount - currentWaveCount <= 10) currentWaveMonsterCount = maxWaveCount - currentWaveCount;
        else currentWaveMonsterCount = WaveMonsterCount[Math.floor(Math.random() * 5)];

        availableMonsters = Object.keys(SpecsheetGen).filter((x) => {
            if (SpecsheetGen[x].boss) return false;
            let xCost = SpecsheetGen[x].variationCost[SpecsheetGen[x].currentVariation];
            return minimumCost <= xCost && xCost * currentWaveMonsterCount <= currentCost;
        });

        // 더 생성할 수 없으면
        // 한 마리라도 생성할 수 있는 몬스터를 랜덤으로 골라 최대치만큼 생성하고 종료
        if (availableMonsters.length == 0) {
            availableMonsters = Object.keys(SpecsheetGen).filter((x) => {
                if (SpecsheetGen[x].boss) return false;
                let xCost = SpecsheetGen[x].variationCost[SpecsheetGen[x].currentVariation];
                return minimumCost <= xCost && xCost <= currentCost;
            });

            if (availableMonsters.length == 0) break;
            let randWave = Math.floor(Math.random() * availableMonsters.length);
            let randRoute = Math.floor(Math.random() * 4);

            let selectedMob = SpecsheetGen[availableMonsters[randWave]];
            currentWaveMonsterCount = Math.floor(currentCost / selectedMob.variationCost[selectedMob.currentVariation]);
            currentWaveInfo.push({
                "mobName": availableMonsters[randWave] + String.fromCharCode(65 + selectedMob.currentVariation),
                "mobCount": currentWaveMonsterCount,
                "hpFactor": hpFactor,
                "mobRoute": String.fromCharCode(65 + randRoute)
            });

            currentWaveCount += currentWaveMonsterCount;
            currentCost -= selectedMob.variationCost[selectedMob.currentVariation] * currentWaveMonsterCount;
            break;
        } else {
            let randWave = Math.floor(Math.random() * availableMonsters.length);
            let randRoute = Math.floor(Math.random() * 4);

            let selectedMob = SpecsheetGen[availableMonsters[randWave]];

            currentWaveInfo.push({
                "mobName": availableMonsters[randWave] + String.fromCharCode(65 + selectedMob.currentVariation),
                "mobCount": currentWaveMonsterCount,
                "hpFactor": hpFactor,
                "mobRoute": String.fromCharCode(65 + randRoute)
            });

            currentWaveCount += currentWaveMonsterCount;
            currentCost -= selectedMob.variationCost[selectedMob.currentVariation] * currentWaveMonsterCount;
        }
    };

    return currentWaveInfo;
}