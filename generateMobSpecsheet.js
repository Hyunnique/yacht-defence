const fs = require('fs').promises;

// hp, def, speed, damage, variations
var specData = {
    "Air": [500, 30, 25, 4, 1],
    "Ball": [400, 35, 20, 4, 4],
    "Bat": [200, 15, 12, 1, 20],
    "BatSmall": [100, 15, 12, 1, 5],
    "Beard": [350, 30, 20, 3, 2],
    "Brain": [250, 15, 20, 3, 5],
    "Bug": [200, 15, 15, 1, 5],
    "Butterfly": [100, 15, 15, 1, 2],
    "Cat": [200, 15, 20, 2, 6],
    "Chest": [800, 30, 20, 4, 1],
    "Chicken": [200, 15, 20, 2, 3],
    "Cloud": [200, 15, 15, 2, 4],
    "Coffin": [400, 20, 25, 3, 4],
    "Count": [1000, 35, 25, 5, 1],
    "Crab": [400, 40, 25, 3, 6],
    "Disc": [1000, 15, 15, 4, 1],
    "Dog": [200, 15, 20, 2, 7],
    "Duck": [200, 15, 20, 2, 3],
    "Dwarf": [600, 25, 25, 4, 6],
    "Dye": [300, 15, 12, 2, 4],
    "Earth": [500, 50, 25, 2, 3],
    "EarthSmall": [400, 40, 25, 2, 3],
    "EarthSmaller": [300, 30, 25, 2, 3],
    "Eel": [150, 20, 12, 4, 4],
    "ElementalOrb": [500, 30, 15, 4, 2],
    "Eye": [450, 25, 15, 4, 4],
    "EyeBall": [350, 20, 12, 2, 3],
    "Factory": [1000, 30, 20, 4, 2],
    "FireSmall": [200, 15, 12, 3, 1],
    //"Fish": [],
    //"Frog": [],
    "Ghast": [400, 15, 12, 3, 3],
    "Gnome": [700, 20, 20, 4, 3],
    //"Goat": [],
    "Hare": [500, 15, 15, 4, 4],
    "Head": [700, 30, 25, 3, 4],
    "Hulk": [900, 30, 25, 4, 2],
    "Klackon": [1200, 20, 20, 4, 6],
    "Lurker": [300, 45, 25, 3, 3],
    "Machine": [800, 30, 20, 3, 1],
    "Mask": [700, 25, 20, 3, 4],
    "Monolith": [500, 20, 20, 3, 12],
    "Moth": [300, 15, 15, 2, 5],
    "Mouth": [400, 15, 15, 3, 3],
    "Mummy": [650, 25, 25, 3, 3],
    "Mushroom": [150, 15, 20, 1, 2],
    "Orb": [400, 40, 15, 3, 4],
    "Potion": [600, 15, 15, 3, 12],
    "Pterodactyl": [500, 20, 12, 3, 8],
    "Puddle": [350, 15, 15, 3, 3],
    "Pyramid": [500, 25, 20, 3, 2],
    "Reaper": [1200, 40, 20, 5, 1],
    "Robot": [800, 30, 20, 4, 4],
    "Scorpion": [600, 15, 15, 3, 3],
    "Sentry": [300, 25, 15, 3, 3],
    "SentryCopter": [300, 25, 12, 3, 3],
    "Shield": [300, 50, 20, 1, 6],
    "Skeleton": [500, 20, 20, 3, 4],
    "Skull": [400, 15, 15, 3, 4],
    "SkullFlaming": [400, 15, 15, 5, 2],
    //"SkullSmall": [],
    "Slime": [200, 20, 15, 1, 16],
    "SlimeSmall": [100, 15, 15, 1, 9],
    //"SlimeSmaller": [],
    "SlimeSquare": [250, 20, 15, 2, 12],
    "SlimeSquareSmall": [150, 15, 15, 2, 8],
    //"Slug": [],
    "Snake": [200, 20, 15, 1, 12],
    "Space": [2000, 30, 25, 3, 1],
    //"Sparks": [],
    //"Sphere": [],
    //"Squirrel": [],
    "Sword": [1000, 30, 15, 4, 2],
    //"Tentacle": [],
    //"Water": [],
    //"WaterSmall": [],
    "Weasel": [600, 25, 20, 4, 3],
    "Witch": [400, 30, 15, 4, 6],
    "Worm": [100, 15, 20, 1, 8],
    "Zombie": [650, 25, 25, 3, 2]
};

var bossData = {
    
    "BossBear": {
        "mobAnim": "bearWalk",
        "deathAnimName": "bearDie",
        "deathSound": "death",
        "scale": 1,
        "health": 1000,
        "m_speed": 30,
        "defence": 70,
        "currentVariation": 0,
        "variations": 1,
        "defaultCost": 0,
        "boss": true
    },
    "BossSlimeKing": {
        "mobAnim": "slimeKingWalk",
        "deathAnimName": "slimeKingDie",
        "deathSound": "death",
        "scale": 1,
        "health": 1000,
        "m_speed": 30,
        "defence": 70,
        "currentVariation": 0,
        "variations": 1,
        "defaultCost": 0,
        "boss": true
    },
    "BossMagician": {
        "mobAnim": "magicianWalk",
        "deathAnimName": "magicianDie",
        "deathSound": "death",
        "scale": 1,
        "health": 1000,
        "m_speed": 30,
        "defence": 70,
        "currentVariation": 0,
        "variations": 1,
        "defaultCost": 0,
        "boss": true
    },
    "BossGiant": {
        "mobAnim": "giantWalk",
        "deathAnimName": "giantDie",
        "deathSound": "death",
        "scale": 1,
        "health": 1000,
        "m_speed": 30,
        "defence": 70,
        "currentVariation": 0,
        "variations": 1,
        "defaultCost": 0,
        "boss": true
    },
    "BossGolem": {
        "mobAnim": "stoneGolemWalk",
        "deathAnimName": "stoneGolemDie",
        "deathSound": "death",
        "scale": 1,
        "health": 1000,
        "m_speed": 30,
        "defence": 70,
        "currentVariation": 0,
        "variations": 1,
        "defaultCost": 0,
        "boss": true
    },
};

var specData_result = {};

Object.keys(specData).forEach((x) => {

    var hp = specData[x][0];
    var def = specData[x][1];
    var spd = specData[x][2];

    var ehp = hp * (1 / (1 - (def / 100)));
    var cost = Math.floor(ehp / Math.log(spd) / 20) / 2;

    specData[x] = {
        "mobAnim": x,
        "deathAnimName": "boom3",
        "deathSound": "death",
        "scale": 3,
        "health": hp,
        "m_speed": spd,
        "defence": def,
        "currentVariation": 0,
        "variations": 0,
        "variationCost": [],
        "boss": false
    };
});

fs.readdir("./src/assets/spritesheets/mobs")
.then((filename) => {
    filename.forEach((x) => {
        let param = x.substring(0, x.length - 5);
        
        if (specData[param]) specData[param].variations++;
    });

    Object.keys(bossData).forEach((x) => {
        specData[x] = bossData[x];
    });

    Object.keys(specData).forEach((x) => {

        let monsterDelta = 21 - specData[x].variations;
        if (specData[x].boss) {
            specData_result[x] = JSON.parse(JSON.stringify(specData[x]));
            delete specData_result[x].variations;
            delete specData_result[x].currentVariation;
        } else {
            for (let i = 0; i < specData[x].variations; i++) {
                specData_result[x + String.fromCharCode(65 + i)] = JSON.parse(JSON.stringify(specData[x]));
                specData_result[x + String.fromCharCode(65 + i)].mobAnim = x + String.fromCharCode(65 + i);
                specData_result[x + String.fromCharCode(65 + i)].health = Math.floor(specData_result[x + String.fromCharCode(65 + i)].health * (1 + (i * monsterDelta * 4.0)));
                specData_result[x + String.fromCharCode(65 + i)].defence = Math.floor(specData_result[x + String.fromCharCode(65 + i)].defence * (1 + (0.08 * i * monsterDelta)));

                var hp = specData_result[x + String.fromCharCode(65 + i)].health;
                var def = specData_result[x + String.fromCharCode(65 + i)].defence;
                var spd = specData_result[x + String.fromCharCode(65 + i)].m_speed;

                var ehp = hp * (1 / (1 - (def / 100)));
                var cost = Math.floor(ehp / Math.log(spd) / 20) / 2;

                specData[x].variationCost.push(cost);

                specData_result[x + String.fromCharCode(65 + i)].defaultCost = cost;
                delete specData_result[x + String.fromCharCode(65 + i)].variationCost;
                delete specData_result[x + String.fromCharCode(65 + i)].variations;
                delete specData_result[x + String.fromCharCode(65 + i)].currentVariation;
            }
        }
    });
    fs.writeFile('./src/assets/specsheets/mobSpecSheetGen.json', JSON.stringify(specData, null, '\t'));
    fs.writeFile('./src/assets/specsheets/mobSpecSheet.json', JSON.stringify(specData_result, null, '\t'));
});