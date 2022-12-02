import Mob from '../objects/mobs/Mob.js';
import Game from "../Game.js";
import Unit from '../objects/units/playerUnit.js';
import Item from "../assets/specsheets/shopItemSheet.json"
const Phaser = require('phaser');

class AnimatedTile {
    tile;
    tileAnimationData;
    firstgid;
    elapsedTime;
    animationDuration

    constructor(tile, tileAnimationData, firstgid) {
        this.tile = tile;
        this.tileAnimationData = tileAnimationData;
        this.firstgid = firstgid;
        this.elapsedTime = 0;
        this.animationDuration = tileAnimationData[0].duration * tileAnimationData.length;
    }

    update(delta) {
        this.elapsedTime += delta;
        this.elapsedTime %= this.animationDuration;

        const animationFrameIndex = Math.floor(this.elapsedTime / this.tileAnimationData[0].duration);

        this.tile.index = this.tileAnimationData[animationFrameIndex].tileid + this.firstgid
    }
}

export default class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }
    controls;
    animatedTiles = [];

    tierCnt = [0, 0, 0, 0];
    tierBonus = [0, 0, 0, 0];
    gold = 0;

    currentRoundData;

    buffAtk = 0;
    buffAspd = 0;
    buffPenetration = 0;

    /*
        타이머관련 변수 선언
            phaseTimer: 현재 동작중인 타이머 저장
            timerText: 타이머 표기용 변수
    */
    phaseTimer;
    PhaseText = "";

    create() {
        // 맵
        this.mapWidth = 2400;
        this.mapHeight = 1440;
        this.mapOffsetX = 3000;
        this.mapOffsetY = 1840;

        let map = [];
        let outside_ground = [];
        let outside_roof = [];
        let outside_wall = [];
        let outside_stair = [];
        let outside_B = [];
        let possible = [];
        let tile = [];
        let wall = [];
        let bridge = [];
        let grass = [];
        let tree1_back = [];
        let tree2_back = [];
        let tree1_front = [];
        let tree2_front = [];
        this.info = [];

        for (let i = 0; i < 4; i++) {
            map.push(this.make.tilemap({ key: "map_forest" }));
            outside_ground.push(map[i].addTilesetImage("outside_ground", "outside_ground"));
            outside_roof.push(map[i].addTilesetImage("outside_roof", "outside_roof"));
            outside_wall.push(map[i].addTilesetImage("outside_wall", "outside_wall"));
            outside_stair.push(map[i].addTilesetImage("outside_stair", "outside_stair"));
            outside_B.push(map[i].addTilesetImage("Outside_B", "outside_B"));
            possible.push(map[i].addTilesetImage("possible", "possible"));
            tile.push(map[i].createLayer("tile", outside_ground, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            wall.push(map[i].createLayer("wall", outside_wall, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            bridge.push(map[i].createLayer("bridge", outside_B, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            grass.push(map[i].createLayer("grass", outside_B, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            tree1_back.push(map[i].createLayer("Tree1_B", outside_B, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            tree2_back.push(map[i].createLayer("Tree2_B", outside_B, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            tree1_front.push(map[i].createLayer("Tree1_F", outside_B, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            tree2_front.push(map[i].createLayer("Tree2_F", outside_B, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            this.info.push(map[i].createLayer("info", possible, this.mapOffsetX * (i % 2), this.mapOffsetY * Math.floor(i / 2) - 96));
            this.info[i].alpha = 0;
        }

        // info layer 기준 tileset index가
        // 배치 가능 2897
        // 배치 불가능 2898


        for (let i = 0; i < 4; i++) {
            const tileData = outside_ground[i].tileData;
            for (let tileid in tileData) {
                map.forEach((m) => {
                    let layer = m.layers[0];
                    layer.data.forEach(tileRow => {
                        tileRow.forEach(tile => {
                            if (tile.index - outside_ground[i].firstgid === parseInt(tileid, 10)) {
                                this.animatedTiles.push(
                                    new AnimatedTile(
                                        tile,
                                        tileData[tileid].animation,
                                        outside_ground[i].firstgid
                                    )
                                )
                            }
                        });
                    });
                })
            }
        }

        
        let cursors = this.input.keyboard.addKeys({ up: 87, down: 83, left: 65, right: 68 });
        //카메라
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.75
        });

        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {

            if (deltaY > 0) {
                var newZoom = this.cameras.main.zoom - .2;
                if (newZoom > 0.7) {
                    this.cameras.main.zoom = newZoom;
                }
            }
            if (deltaY < 0) {
                var newZoom = this.cameras.main.zoom + .2;
                if (newZoom < 1.7) {
                    this.cameras.main.zoom = newZoom;
                }
            }
            // this.camera.centerOn(pointer.worldX, pointer.worldY);
            // this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");
        });
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight + 96);
        this.currentView = 0;

        //BGM
        this.shopSound = this.sound.add("shop");
        this.shopBuySound = [];
        for (let i = 1; i <= 3; i++) this.shopBuySound.push(this.sound.add("shopBuy" + i));
        this.shopBuyFailSound = this.sound.add("shopBuyFail");
        this.sound.pauseOnBlur = false;
        this.bossPrepareMusic = this.sound.add("bossPrepareMusic");
        this.bossFightMusic = this.sound.add("bossFight");
        this.normalMusic = this.sound.add("normal_diff1");

        this.normalMusic.play(Game.bgmSoundConfig);


        for (var i = 2; i <= 8; i++)
        {
            this.sound.add("normal_diff" + i);
        }
        this.sound.add("attackBigFire");
        this.sound.add("attackFire");
        this.sound.add("attackBow");
        this.sound.add("attackIce");
        this.sound.add("attackKnife");
        this.sound.add("attackLightning");
        this.sound.add("attackLongWeapon");
        this.sound.add("attackMagic1");
        this.sound.add("attackMagic2");
        this.sound.add("attackSword");
        this.sound.add("attackThrow");
        this.sound.add("hitBoom1");
        this.sound.add("hitBoom2");
        this.sound.add("hitBoom3");
        this.sound.add("hitBow");
        this.sound.add("hitNormal");
        this.sound.add("hitFire");
        this.sound.add("rollDice");
        this.sound.add("tier1");
        this.sound.add("tier2");
        this.sound.add("tier3");
        this.sound.add("tier4");

        //몹/유저유닛/투사체 관련
        this.m_mobs = this.physics.add.group();
        this.roundNum = 0;
        this.globalnum = [1, 1, 1, 1];
        this.mobCounter = 0;

        this.unitIndex = 0;

        this.placemode = false;
        this.checkLast = false;
        this.eventChecked = false;

        this.m_projectiles = this.physics.add.group();

        this.unitDB = this.cache.json.get("unitDB");
        this.mobDB = this.cache.json.get("mobDB");
        this.roundDB = this.cache.json.get("roundDB");
        this.skillDB = this.cache.json.get("skillDB");

        this.m_player = [];
        this.spectate_player = [];

        this.spectate_player_units = Array(4).fill(null).map(() => Array());
        this.spectate_player_mobs = Array(4).fill(null).map(() => this.physics.add.group());
        this.spectate_player_projectiles = Array(4).fill(null).map(() => this.physics.add.group());

        this.selectedUnit;
        this.onPlaceQueue;
        this.preTile;

        this.physics.add.overlap(this.m_projectiles, this.m_mobs, (projectile, mob) => mob.hit(projectile), null, this);

        this.spectate_player_mobs.forEach((e, i) => {
            this.physics.add.overlap(this.spectate_player_projectiles[i], e, (projectile, mob) => mob.hit(projectile), null, this);
        });

        this.input.on("pointerdown", this.clickHandler, this);
    }

    update(time, delta) {
        this.animatedTiles.forEach(tile => tile.update(delta));
        this.controls.update(delta);
        
        let x = this.input.mousePointer.x;
        let y = this.input.mousePointer.y;

        if (x > this.cameras.main.width - 50 && y > this.cameras.main.height - 50) {
            this.cameras.main.scrollX += 12;
            this.cameras.main.scrollY += 12;
        }
        else if (x < 50 && y < 50) {
            this.cameras.main.scrollX -= 12;
            this.cameras.main.scrollY -= 12;
        }
        else if (x > this.cameras.main.width - 50 && y < 50) {
            this.cameras.main.scrollX += 12;
            this.cameras.main.scrollY -= 12;
        }
        else if (x < 50 && y > this.cameras.main.height - 50) {
            this.cameras.main.scrollX -= 12;
            this.cameras.main.scrollY += 12;
        }
        else if (x > this.cameras.main.width - 50) this.cameras.main.scrollX += 12;
        else if (x < 50) this.cameras.main.scrollX -= 12;
        else if (y > this.cameras.main.height - 50) this.cameras.main.scrollY += 12;
        else if (y < 50) this.cameras.main.scrollY -= 12;

        if (this.checkLast && this.mobCounter == 0 && !this.eventChecked) {
            this.eventChecked = true;
            this.events.once("mobAnimDone", () => {
                Game.Socket.emit('battlePhase-done', true);
                this.checkLast = false;
            }, this);
        }
    }

    clickHandler(pointer) {
        if (pointer.leftButtonDown()) {
            this.unitInfoHandler(pointer, false);
            if (this.PhaseText == "Place Phase" && !this.placemode)
                this.moveUnit(pointer);
        }
        else if (pointer.rightButtonDown()) {
            this.unitInfoHandler(pointer, true);
        }
    }

    unitInfoHandler(pointer, bool) {
        if (!this.placemode) {
            var index;

            if (pointer.worldX < this.mapWidth && pointer.worldY < this.mapHeight)
                index = 0;
            else if (pointer.worldX > this.mapOffsetX && pointer.worldY < this.mapHeight)
                index = 1;
            else if (pointer.worldX < this.mapWidth && pointer.worldY > this.mapOffsetY)
                index = 2;
            else if (pointer.worldX > this.mapOffsetX && pointer.worldY > this.mapOffsetY)
                index = 3;
            
            let t = this.getTileAtPointer(pointer, this.info[index]);
            if (t.placedUnit != undefined) {
                if (this.selectedUnit != undefined) {
                    this.selectedUnit.rangeView.alpha = 0;
                    this.selectedUnit.buffRangeView.alpha = 0;
                }
                if (bool) {
                    this.selectedUnit = t.placedUnit;
                    this.selectedUnit.rangeView.alpha = 0.4;
                    this.selectedUnit.buffRangeView.alpha = 0.6;

                    Game.showUnitInfo(t.placedUnit);
                }
            }
            else if (this.selectedUnit != undefined) {
                this.selectedUnit.rangeView.alpha = 0;
                this.selectedUnit.buffRangeView.alpha = 0;
                this.selectedUnit = undefined;

                Game.hideUnitInfo();
            }
        }
    }

    // function receiveUnit(unitID)
    // DicePhase를 마친 뒤 유닛을 선택하면 호출함
    // Unit ID를 파라미터로 가짐
    /**
     * 초기 배치 receiveUnit -> moveunit -> unitplacer
     * 재배치 moveUnit -> unitplacer
     * 
     * 
     */
    receiveUnit(unitID, tier) {
        if (Game.PlayerData[0].hp > 0) {
            this.handleTierBonus(tier, true);
            this.onPlaceQueue = new Unit(this, this.input.activePointer.x, this.input.activePointer.y, this.unitDB["unit" + unitID], this.unitIndex++, unitID, 0);
            this.onPlaceQueue.rangeView.alpha = 0.4;
            this.onPlaceQueue.buffRangeView.alpha = 0.6;
            this.m_player.push(this.onPlaceQueue);
            this.moveUnit();
        }
    }

    moveUnit(pointer) {
        if (pointer) {
            if (pointer.worldX > this.mapWidth || pointer.worldY > this.mapHeight)
                return;
            this.preTile = this.getTileAtPointer(pointer, this.info[0]);
            if (!this.preTile || !this.preTile.placedUnit)
                return;
            this.preTile.index = 2897;
            this.onPlaceQueue = this.preTile.placedUnit;
            this.preTile.placedUnit = undefined;
            this.onPlaceQueue.rangeView.alpha = 0.4;
            this.onPlaceQueue.buffRangeView.alpha = 0.6;
        }
        else 
            this.preTile = undefined;
        this.placeModeSwitch(true);        
    }  

    placeModeSwitch(bool) {
        if (bool) {
            this.input.on('pointermove', this.pointerFollower, this);
            this.input.on('pointerdown', this.unitPlaceHandler, this);
        }
        else {
            this.input.off("pointermove", this.pointerFollower, this);
            this.input.off("pointerdown", this.unitPlaceHandler, this);
        }
        this.info[0].alpha = bool ? 1 : 0;
        this.placemode = bool;
    }

    unitPlaceHandler(pointer) {
        let t = this.getTileAtPointer(pointer, this.info[0]);
        if (t.index == 2897) {
            this.unitPlacer(t,false);
            this.placeModeSwitch(false);
        }
        else if (t.index == 2898 && t.placedUnit) {
            this.unitPlacer(t,true);
            this.placeModeSwitch(false);
        }
            
            
    }

    pointerFollower(pointer) {
        let t = this.getTileAtPointer(pointer, this.info[0]);
        this.onPlaceQueue.moveMiscs();
        if (!t || t.index == 2898) {
            this.onPlaceQueue.rangeView.alpha = 0.2;
            this.onPlaceQueue.buffRangeView.alpha = 0.3;
            this.onPlaceQueue.alpha = 0.5;
        }
        else {
            this.onPlaceQueue.rangeView.alpha = 0.4;
            this.onPlaceQueue.buffRangeView.alpha = 0.6;
            this.onPlaceQueue.alpha = 1;
        }
        this.onPlaceQueue.setX(t.getCenterX());
        this.onPlaceQueue.setY(t.getCenterY());
        this.onPlaceQueue.setDepth(((this.onPlaceQueue.y / 48) * (this.onPlaceQueue.x / 48)));
    }

    unitPlacer(t, change) {
        if (change) {
            var temp = t.placedUnit;
            this.preTile.placedUnit = temp;
            this.preTile.index = 2898;
            temp.setX(this.preTile.getCenterX());
            temp.setY(this.preTile.getCenterY());
            temp.setDepth((temp.x / 48) * (temp.y / 48));
            temp.moveMiscs();
            this.preTile = undefined;
        }
        this.onPlaceQueue.alpha = 1;
        t.index = 2898;
        this.onPlaceQueue.rangeView.alpha = 0;
        this.onPlaceQueue.buffRangeView.alpha = 0;
        this.onPlaceQueue.moveMiscs();
        t.placedUnit = this.onPlaceQueue;
        this.onPlaceQueue.setX(t.getCenterX());
        this.onPlaceQueue.setY(t.getCenterY());
        this.onPlaceQueue.setDepth(((this.onPlaceQueue.y / 48) * (this.onPlaceQueue.x / 48)));
        this.resetBuff();
        this.onPlaceQueue = undefined;
        Game.syncFieldStatus();
    }

    removeOtherPlayerUnit(index)
    {
        this.spectate_player_units[index].forEach(e => {
                let t = this.info[index].getTileAtWorldXY(e.x, e.y, true);
                t.placedUnit = undefined;
                e.remove();
            });
        this.spectate_player_units[index] = [];
    }

    placeOtherPlayerUnit(playerNum, shopBuffs, tierBuffs) {
        if (playerNum == 0)
            return;
        var savedLength = this.spectate_player_units[playerNum].length;
        var receivedLength = this.spectate_player.length;
        if (receivedLength == 0)
            this.removeOtherPlayerUnit(playerNum);

        this.spectate_player.forEach((e, i) => {
            var offsetX = e.x + (this.mapOffsetX * (playerNum % 2));
            var offsetY = e.y + (this.mapOffsetY * Math.floor(playerNum / 2));
            if (i < savedLength) {//기존에 있는 것중에
                var unit = this.spectate_player_units[playerNum][i];
                if (unit.x != offsetX || unit.y != offsetY) { // 자리가 달라? 
                    unit.x = offsetX;
                    unit.y = offsetY;
                    unit.setDepth(((unit.y / 48) * (unit.x / 48)));
                    let t = this.info[playerNum].getTileAtWorldXY(offsetX, offsetY, true);
                    t.placedUnit = unit;
                }
            }
            else { //새것??
                var unit = new Unit(this, offsetX, offsetY, this.unitDB["unit" + e.id], e.uid, e.id, playerNum);
                this.spectate_player_units[playerNum].push(unit);
                let t = this.info[playerNum].getTileAtWorldXY(unit.x, unit.y, true);
                t.placedUnit = unit;
                unit.setDepth(((unit.y / 48) * (unit.x / 48)));
            }
        });
        this.resetOtherBuff(playerNum, shopBuffs, tierBuffs);
        
    }

    resetOtherBuff(playerNum,shopBuff,tierBuffs) {
        this.spectate_player_units[playerNum].forEach((e) => { e.removeBuff() });
        this.spectate_player_units[playerNum].forEach((e) => {
            e.giveBuff();
            e.syncGlobalBuff(shopBuff, tierBuffs);
        });
        this.spectate_player_units[playerNum].forEach((e) => {
            e.updateBuff();
        });
    }

    resetBuff() {
        this.m_player.forEach((e) => {
            e.removeBuff();
        });
        this.m_player.forEach((e) => {
            e.giveBuff();
            e.syncGlobalBuff();
        });
        this.m_player.forEach((e) => {
            e.updateBuff();
        });
    }

    placeModeTimeOver() {
        this.placeModeSwitch(false);
        if (this.onPlaceQueue != undefined) {
            if (this.preTile == undefined) {
                this.handleTierBonus(this.onPlaceQueue.tier, false);
                this.onPlaceQueue.remove();
                this.m_player.splice(this.m_player.length - 1, 1);
            }
            else {
                this.unitPlacer(this.preTile);
                this.preTile = undefined;
            }    
            this.onPlaceQueue = undefined;
            Game.syncFieldStatus();
        }
        
    }

    startRound() {
        let initialDelay = 1500;
        if (this.roundNum <= 5) initialDelay = 1500;
        else if (this.roundNum <= 10) initialDelay = 1200;
        else if (this.roundNum <= 20) initialDelay = 900;
        else if (this.roundNum <= 30) initialDelay = 600;
        else initialDelay = 300;
        
        this.currentRoundData.forEach((element, index) => {
            this.mobCounter += element["mobCount"];
            if (Game.PlayerData[0].hp > 0) {
                    this.time.addEvent({
                    delay: initialDelay,
                    callback: () => {
                        this.m_mobs.add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum[0], element["mobRoute"], element["hpFactor"], 0));
                        this.globalnum[0]++;
                    },
                    repeat: element["mobCount"] - 1,
                    startAt: index * 100
                });
            }
            if (Game.PlayerData.length > 1 && !Game.PlayerData[1].dead) {
                this.time.addEvent({
                    delay: initialDelay,
                    callback: () => {
                        this.spectate_player_mobs[1].add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum[1], element["mobRoute"], element["hpFactor"], 1));
                        this.globalnum[1]++;
                    },
                    repeat: element["mobCount"] - 1,
                    startAt: index * 100
                });
            }
            if (Game.PlayerData.length > 2 && !Game.PlayerData[2].dead) {
                this.time.addEvent({
                    delay: initialDelay,
                    callback: () => {
                        this.spectate_player_mobs[2].add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum[2], element["mobRoute"], element["hpFactor"], 2));
                        this.globalnum[2]++;
                    },
                    repeat: element["mobCount"] - 1,
                    startAt: index * 100
                });
            }
            if (Game.PlayerData.length > 3 && !Game.PlayerData[3].dead) {
                this.time.addEvent({
                    delay: initialDelay,
                    callback: () => {
                        this.spectate_player_mobs[3].add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum[3], element["mobRoute"], element["hpFactor"], 3));
                        this.globalnum[3]++;
                    },
                    repeat: element["mobCount"] - 1,
                    startAt: index * 100
                });
            }
        });
        this.checkLast = true;
    }

    getTileAtPointer(pointer, layer) {
        return layer.getTileAtWorldXY(pointer.worldX, pointer.worldY, true);
    }

    toDicePhase() {
        if (this.roundNum % 5 == 0) {
            this.plugins.get('rexSoundFade').fadeOut(this.normalMusic, 2500, false);
            this.plugins.get('rexSoundFade').fadeIn(this.bossPrepareMusic, 2500, Game.bgmSoundConfig.volume, 0);
            this.time.delayedCall(2500, () => { this.normalMusic.pause() }, [], this);
        }
        else if (!this.normalMusic.isPlaying) {
            this.plugins.get('rexSoundFade').fadeOut(this.bossFightMusic, 2500, false);
            this.normalMusic.resume();
            this.plugins.get('rexSoundFade').fadeIn(this.normalMusic, 2500, Game.bgmSoundConfig.volume, 0);
            this.time.delayedCall(2500, () => { this.bossFightMusic.stop() }, [], this);
        }
        this.PhaseText = "Dice Phase";        
        this.globalnum = [1, 1, 1, 1];
        this.scene.pause().launch('diceScene');
    }

    toPlacePhase() {
        this.PhaseText = "Place Phase";
        this.itemList = [];
        let itemCount = Object.keys(Item).length;
        for (let i = 0; i < 3; i++) { 
            while (true) {
                let _r = Math.floor(Math.random() * itemCount);
                if (!this.itemList.includes(_r)) {
                    this.itemList.push(_r);
                    break;
                }
            }
        }
    }

    toBattlePhase() {
        this.placeModeTimeOver();
        this.PhaseText = "Battle Phase";
        this.eventChecked = false;
        if (this.roundNum % 5 == 0) {
            this.plugins.get('rexSoundFade').fadeOut(this.bossPrepareMusic, 2500, false);
            this.plugins.get('rexSoundFade').fadeIn(this.bossFightMusic, 2500, Game.bgmSoundConfig.volume, 0);
            this.time.delayedCall(2500, () => { this.bossPrepareMusic.stop() }, [], this);
        }
        this.startRound();
    }    
    
    gameOverHandler(index)
    {
        if (index == 0) {
            this.m_player.forEach((e) => {
                let t = this.info[index].getTileAtWorldXY(e.x, e.y, true);
                t.placedUnit = undefined;
                e.remove();
            });
            this.tierCnt = [0, 0, 0, 0];
            this.tierBonus = [0, 0, 0, 0];
            this.m_player = [];
            Game.syncFieldStatus();
        }
        else {
            this.removeOtherPlayerUnit(index);
            this.spectate_player_mobs[index].getChildren().forEach((e) => {
                e.death(); 
            });
        }        
    }

    handleTierBonus(tier,bool)
    {
        bool ? this.tierCnt[tier - 1]++ : this.tierCnt[tier - 1]--;
        let tierOnlyBonus = 0;
        let overallBonus = 0;

        switch (tier) {
            case 1:
                tierOnlyBonus = 50;
                overallBonus = 10;
                break;
            case 2:
                tierOnlyBonus = 20;
                overallBonus = 5;
                break;
            case 3:
                tierOnlyBonus = 12;
                overallBonus = 3;
                break;
            case 4:
                tierOnlyBonus = 5;
                overallBonus = 1;
                break;
        }

        this.tierBonus[tier - 1] += tierOnlyBonus * (bool ? 1 : -1);
        
        for (let i = 0; i < 4; i++) {
            this.tierBonus[i] += overallBonus * (bool ? 1 : -1);

            document.getElementsByClassName("ui-unitArea-unitTierCount")[i].innerHTML = "";
            document.getElementsByClassName("ui-unitArea-unitTierCount")[i].innerHTML += this.tierCnt[i] + " <span class='ui-unitArea-unitTierBonus'>(+" + this.tierBonus[i] + "%)</span>";
        }
    }

    musicChanger() {
        this.normalMusic = this.sound.get("normal_diff" + (this.roundNum > 70 ? "8" : Math.ceil((this.roundNum - 1) / 10) + 1));
    }
}

