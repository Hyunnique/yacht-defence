module.exports = function generateRound(SpecsheetGen, roundCost, round) {

    let minWaveCount = 10;
    let maxWaveCount = 20;
    if (round <= 10) maxWaveCount = 20;
    else if (round <= 20) maxWaveCount = 30;
    else if (round <= 30) maxWaveCount = 40;
    else if (round <= 40) maxWaveCount = 50;
    else maxWaveCount = 60;

    // 최소 코스트를 설정해서,
    // 라운드에 비해서 너무 약한 몬스터는 사용하지 않도록 하고
    // maxWaveCount 내에 무조건 완료되도록 한다

    let minimumCost = Math.floor(roundCost / maxWaveCount);
    let currentCost = roundCost;
    let currentWaveCount = 0;
    let currentWaveInfo = [];

    // 라운드 시작시마다 현재 roundCost에 대해서
    // minWaveCount (10) 만큼의 웨이브를 생성할 수 있는 최대 Variation을 설정한다.

    Object.keys(SpecsheetGen).forEach((x) => {
        while (true) {
            let defaultCost = SpecsheetGen[x].defaultCost;
            let currentVariation = SpecsheetGen[x].currentVariation;
            let monsterDelta = 21 - SpecsheetGen[x].variations;

            if (SpecsheetGen[x].boss) break;
            if (currentVariation == SpecsheetGen[x].variations) break;

            if (defaultCost * ((currentVariation + 1) * monsterDelta * 2 + 1) * minWaveCount <= roundCost) {
                SpecsheetGen[x].currentVariation++;
            } else {
                break;
            }
        }
    });

    let availableMonsters;

    // 한 웨이브에는 몬스터 종류당 10~20마리 소환
    // 물론 중복해서 뽑힐 경우는 중복 가능
    const WaveMonsterCount = [10, 15, 20];
    if (round % 5 != 0) {
        // 보스 라운드가 아닐 때
    } else {
        // 보스 라운드일 때
        currentCost /= 5;

        let waveBoss = Object.keys(SpecsheetGen).filter((x) => SpecsheetGen[x].boss)[Math.floor((round % 25) / 5)];
        currentWaveInfo.push({
            "mobName": waveBoss,
            "mobCount": 1,
            "hpFactor": 1,
            "mobRoute": "X"
        });
    }

    while (currentWaveCount < maxWaveCount) {

        let currentWaveMonsterCount = 10;
        
        if (maxWaveCount - currentWaveCount <= 20) currentWaveMonsterCount = maxWaveCount - currentWaveCount;
        else currentWaveMonsterCount = WaveMonsterCount[Math.floor(Math.random() * 3)];

        availableMonsters = Object.keys(SpecsheetGen).filter((x) => {
            let xCost = SpecsheetGen[x].defaultCost * (SpecsheetGen[x].currentVariation * (21 - SpecsheetGen[x].variations) * 2 + 1);
            return !SpecsheetGen[x].boss && minimumCost <= xCost && xCost * currentWaveMonsterCount <= currentCost;
        });

        // 더 생성할 수 없으면
        // 한 마리라도 생성할 수 있는 몬스터를 랜덤으로 골라 최대치만큼 생성하고 종료
        if (availableMonsters.length == 0) {
            availableMonsters = Object.keys(SpecsheetGen).filter((x) => {
                let xCost = SpecsheetGen[x].defaultCost * (SpecsheetGen[x].currentVariation * (21 - SpecsheetGen[x].variations) * 2 + 1);
                return !SpecsheetGen[x].boss && minimumCost <= xCost && xCost <= currentCost;
            });

            if (availableMonsters.length == 0) break;
            let randWave = Math.floor(Math.random() * availableMonsters.length);
            let randRoute = Math.floor(Math.random() * 4);

            let selectedMob = SpecsheetGen[availableMonsters[randWave]];
            currentWaveMonsterCount = Math.floor(currentCost / (selectedMob.defaultCost * (selectedMob.currentVariation * (21 - selectedMob.variations) * 2 + 1)));
            currentWaveInfo.push({
                "mobName": availableMonsters[randWave] + String.fromCharCode(65 + selectedMob.currentVariation),
                "mobCount": currentWaveMonsterCount,
                "hpFactor": 1,
                "mobRoute": (round % 5 == 0 ? "X" : String.fromCharCode(65 + randRoute))
            });

            currentWaveCount += currentWaveMonsterCount;
            currentCost -= selectedMob.defaultCost * (selectedMob.currentVariation * (21 - selectedMob.variations) * 2 + 1) * currentWaveMonsterCount;
            break;
        } else {
            let randWave = Math.floor(Math.random() * availableMonsters.length);
            let randRoute = Math.floor(Math.random() * 4);

            let selectedMob = SpecsheetGen[availableMonsters[randWave]];

            currentWaveInfo.push({
                "mobName": availableMonsters[randWave] + String.fromCharCode(65 + selectedMob.currentVariation),
                "mobCount": currentWaveMonsterCount,
                "hpFactor": 1,
                "mobRoute": (round % 5 == 0 ? "X" : String.fromCharCode(65 + randRoute))
            });

            currentWaveCount += currentWaveMonsterCount;
            currentCost -= selectedMob.defaultCost * (selectedMob.currentVariation * (21 - selectedMob.variations) * 2 + 1) * currentWaveMonsterCount;
        }
    };

    console.log("Round " + round + "--");
    console.log("round cost:" + roundCost);
    console.log("left cost:" + currentCost);
    return currentWaveInfo;
}