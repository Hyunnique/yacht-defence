import Mob from '../objects/mobs/Mob.js';
import Game from "../Game.js";
import Unit from '../objects/units/playerUnit.js';
import Item from "../assets/specsheets/shopItemSheet.json"
import profile from '../Profile.js';
import { GameObjects } from 'phaser';
const Phaser = require('phaser');
const Config = require("../Config");

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
/*
무작위 구현
(mob)
1.dictionary형이므로 key만 뽑아 배열로 만듬
2.key배열의 length 미만에서 무작위 값을 뽑음
3.key 배열의 무작위 값을 조회해 dictionary에서 조회!!

(unit)
1.티어별로 번호를 저장한 배열 생성
2.배열 내에서 무작위 번호 선택
3.dictionary에서 조회

(item)
1.WIP.
*/



export default class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }
    controls;
    debugGraphics;
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
        this.mapOffsetX = 0;
        this.mapOffsetY = 0;

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
            tile.push(map[i].createLayer("tile", outside_ground, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            wall.push(map[i].createLayer("wall", outside_wall, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            bridge.push(map[i].createLayer("bridge", outside_B, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            grass.push(map[i].createLayer("grass", outside_B, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            tree1_back.push(map[i].createLayer("Tree1_B", outside_B, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            tree2_back.push(map[i].createLayer("Tree2_B", outside_B, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            tree1_front.push(map[i].createLayer("Tree1_F", outside_B, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            tree2_front.push(map[i].createLayer("Tree2_F", outside_B, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
            this.info.push(map[i].createLayer("info", possible, this.mapWidth * (i % 2), this.mapHeight * Math.floor(i / 2)));
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

        
        let help = this.add.text(0, 0, '', { font: '48px monospace' });
        let cursors = this.input.keyboard.createCursorKeys();

        //카메라
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.75
        });
        this.debugGraphics = this.add.graphics();

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
        this.cameras.main.setBounds(0, 0, 2400, 1440);
        this.currentView = 0;

        //BGM
        this.shopSound = this.sound.add("shop");
        this.shopBuySound = [];
        for (let i = 1; i <= 3; i++) this.shopBuySound.push(this.sound.add("shopBuy" + i));
        this.shopBuyFailSound = this.sound.add("shopBuyFail");
        this.sound.pauseOnBlur = false;
        this.bossPrepareMusic = this.sound.add("bossPrepareMusic");
        this.bossFightMusic = this.sound.add("bossFight");
        this.normalMusic = this.sound.add("normal");

        this.normalMusic.play(Game.bgmSoundConfig);
        


        //몹/유저유닛/투사체 관련
        this.m_mobs = this.physics.add.group();
        this.mobArray = [];
        this.roundNum = 0;
        this.globalnum = 1;
        this.globalnum1 = 1;
        this.globalnum2 = 1;
        this.globalnum3 = 1;
        this.mobCounter = 0;
        this.unitIndex = 0;
        this.playerHealth = 100;
        this.placemode = false;
        this.checkLast = false;
        this.eventChecked = false;
        this.m_projectiles = this.physics.add.group();
        this.unitDB = this.cache.json.get("unitDB");
        this.mobDB = this.cache.json.get("mobDB");
        this.roundDB = this.cache.json.get("roundDB");

        this.m_player = [];
        this.spectate_player = [];
        this.spectate_player_units = Array(4).fill(null).map(() => Array());
        this.spectate_player_mobs = [];
        this.spectate_player_projectiles = [];
        for (var i = 0; i < 4; i++) {
            this.spectate_player_mobs.push(this.physics.add.group());
            this.spectate_player_projectiles.push(this.physics.add.group());
        }


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
            if (pointer.worldX < 2400 && pointer.worldY < 1440)
                index = 0;
            else if (pointer.worldX > 2400 && pointer.worldY < 1440)
                index = 1;
            else if (pointer.worldX < 2400 && pointer.worldY > 1440)
                index = 2;
            else if (pointer.worldX > 2400 && pointer.worldY > 1440)
                index = 3;
            let t = this.getTileAtPointer(pointer, this.info[index]);
            //console.log(t.placedUnit == undefined || t.placedUnit == null ? "empty!" : t.placedUnit);

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

    initialPlace(unitData, unitID) {
        this.info[0].alpha = 1;
        this.onPlaceQueue = new Unit(this, this.input.activePointer.x, this.input.activePointer.y, unitData, this.unitIndex++, unitID, 0);
        this.onPlaceQueue.rangeView.alpha = 0.4;
        this.onPlaceQueue.buffRangeView.alpha = 0.6;
        this.moveUnit();
    }

    moveUnit(pointer) {
        if (pointer) {
            if (pointer.worldX > 2400 || pointer.worldY > 1440)
                return;
            this.preTile = this.getTileAtPointer(pointer, this.info[0]);
            if (this.preTile == undefined || this.preTile.placedUnit == undefined)
                return;
            this.preTile.index = "2897";
            this.onPlaceQueue = this.preTile.placedUnit;
            this.preTile.placedUnit = undefined;
            this.onPlaceQueue.rangeView.alpha = 0.4;
            this.onPlaceQueue.buffRangeView.alpha = 0.6;
            this.m_player.splice(this.m_player.findIndex(e => { e.index == this.onPlaceQueue.index }), 1);
        }
        else {
            this.preTile = undefined;
        }
        this.placemode = true;
        this.info[0].alpha = 1;
        this.input.on('pointermove', (pointer) => {
            let t = this.getTileAtPointer(pointer, this.info[0]);
            if (!t || t.index == "2898") {
                this.onPlaceQueue.rangeView.alpha = 0;
                this.onPlaceQueue.buffRangeView.alpha = 0;
                this.onPlaceQueue.alpha = 0;
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
        );
        this.input.on('pointerdown', this.unitPlaceHandler, this);
    }

    unitPlaceHandler(pointer) {
        let t = this.getTileAtPointer(pointer, this.info[0]);
        if (t.index == "2897") {
            this.unitPlacer(t);
            this.info[0].alpha = 0;
            this.placemode = false;
            this.input.off("pointermove");
            this.input.off("pointerdown", this.unitPlaceHandler, this);
        }
    }

    unitPlacer(t) {
        this.onPlaceQueue.alpha = 1;
        this.m_player.push(this.onPlaceQueue);
        t.index = "2898";
        this.onPlaceQueue.rangeView.alpha = 0;
        this.onPlaceQueue.buffRangeView.alpha = 0;
        t.placedUnit = this.onPlaceQueue;
        this.onPlaceQueue.setX(t.getCenterX());
        this.onPlaceQueue.setY(t.getCenterY());
        this.onPlaceQueue.setDepth(((this.onPlaceQueue.y / 48) * (this.onPlaceQueue.x / 48)));
        this.resetBuff();
        this.onPlaceQueue = undefined;

        Game.syncFieldStatus();
    }

    placeOtherPlayerUnit(playerNum, shopBuffs, tierBuffs) {
        var index = 0;
        this.spectate_player.forEach(e => {
            var unit = new Unit(this, e.x + (2400 * (playerNum % 2)), e.y + (1440 * Math.floor(playerNum / 2)), this.unitDB["unit" + e.id], null, e.id, playerNum);
            this.spectate_player_units[playerNum].push(unit);
            let t = this.info[playerNum].getTileAtWorldXY(e.x + (2400 * (playerNum % 2)), e.y + (1440 * Math.floor(playerNum / 2)), true);
            t.placedUnit = unit;
            unit.setDepth(((unit.y / 48) * (unit.x / 48)));
            this.resetOtherBuff(playerNum,shopBuffs,tierBuffs)
        });
    }

    setVisibility(playerNum, bool) {
        if (playerNum == 0)
            return;
        this.physics.overlapRect(2400 * (playerNum % 2), (1440 * Math.floor(playerNum / 2)), 2440, 1440).forEach(e => {
            e.gameObjects.setVisible(bool);
        });
    }

    removeOtherPlayerUnit(playerNum) {
        this.spectate_player_units[playerNum].forEach(e => {
            let t = this.info[playerNum].getTileAtWorldXY(e.x, e.y, true);
            t.placedUnit = undefined;
            e.remove();
        });
        this.spectate_player_units[playerNum] = [];
    }

    resetOtherBuff(playerNum,shopBuff,tierBuffs) {
        this.spectate_player_units[playerNum].forEach((e) => { e.removeBuff() });
        this.spectate_player_units[playerNum].forEach((e) => {
            e.giveBuff();
            e.syncGivenGlobalBuff(shopBuff,tierBuffs);
        });
        this.spectate_player_units[playerNum].forEach((e) => {
            e.updateBuff();
        });
    }


    resetBuff() {
        console.log(this.m_player);
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
        console.log(this.m_player);
    }

    placeModeTimeOver() {
        this.input.off("pointerdown", this.unitPlaceHandler, this);
        this.input.off("pointermove");
        this.info[0].alpha = 0;
        this.placemode = false;
        if (this.onPlaceQueue != undefined) {
            if (this.preTile == undefined) {
                this.handleTierBonus(this.onPlaceQueue.tier, false);
                this.onPlaceQueue.remove();
                this.onPlaceQueue = undefined;
                Game.syncFieldStatus();
            }
            else {
                this.unitPlacer(this.preTile);
                this.preTile = undefined;
            }
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
            this.time.addEvent({
                delay: initialDelay,
                callback: () => {
                    this.m_mobs.add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum, element["mobRoute"], element["hpFactor"], 0));
                    this.globalnum++;
                },
                repeat: element["mobCount"] - 1,
                startAt: index * 100
            });
            if (Game.PlayerData.length > 1) {
                this.time.addEvent({
                    delay: initialDelay,
                    callback: () => {
                        this.spectate_player_mobs[1].add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum1, element["mobRoute"], element["hpFactor"], 1));
                        this.globalnum1++;
                    },
                    repeat: element["mobCount"] - 1,
                    startAt: index * 100
                });
                if (Game.PlayerData.length > 2) {
                    this.time.addEvent({
                        delay: initialDelay,
                        callback: () => {
                            this.spectate_player_mobs[2].add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum2, element["mobRoute"], element["hpFactor"], 2));
                            this.globalnum2++;
                        },
                        repeat: element["mobCount"] - 1,
                        startAt: index * 100
                    });
                    if (Game.PlayerData.length > 3) {
                        this.time.addEvent({
                            delay: initialDelay,
                            callback: () => {
                                this.spectate_player_mobs[3].add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum3, element["mobRoute"], element["hpFactor"], 3));
                                this.globalnum3++;
                            },
                            repeat: element["mobCount"] - 1,
                            startAt: index * 100
                        });
            
                    }
                }
            }
        });
        this.checkLast = true;
    }

    mobPos(id)
    {
        return this.m_mobs.getChildren().find(e => e.mobNum === id);
    }

    getTileAtPointer(pointer, layer) {
        return layer.getTileAtWorldXY(pointer.worldX, pointer.worldY, true);
    }

    drawDebug(tile) {
        const { width, height, pixelX, pixelY } = tile;
        const left = pixelX;
        const top = pixelY;
        const right = pixelX + width;
        const bottom = pixelY + height;
        this.debugGraphics
        .clear()
        .fillStyle(0x666666, 0.6)
        .fillRect(left, top, width, height)
        .lineStyle(8, 0xff0000, 0.8);
        
        // `tile.face*` are the computed faces, from `tile.collide*`
        if (tile.faceLeft) this.debugLine(left, top, 0, height);
        if (tile.faceTop) this.debugLine(left, top, width, 0);
        if (tile.faceRight) this.debugLine(right, top, 0, height);
        if (tile.faceBottom) this.debugLine(left, bottom, width, 0);
    }

    debugLine(x, y, dx, dy) {
        this.debugGraphics.lineBetween(x, y, x + dx, y + dy);
    }

    toDicePhase() {
        if (this.roundNum % 5 == 0) {
            this.plugins.get('rexSoundFade').fadeOut(this.normalMusic, 2500, false);
            this.plugins.get('rexSoundFade').fadeIn(this.bossPrepareMusic, 2500, Game.bgmSoundConfig.volume, 0);
        }
        else if (this.normalMusic.config.volume == 0) {
            this.plugins.get('rexSoundFade').fadeOut(this.bossFightMusic, 2500, false);
            this.plugins.get('rexSoundFade').fadeIn(this.normalMusic, 2500, Game.bgmSoundConfig.volume, 0);
        }
        this.PhaseText = "Dice Phase";        
        this.globalnum = 1;
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
        }
        this.startRound();
        //this.phaseTimer = this.time.delayedCall(6000, this.toDicePhase, [], this);
    }
    // DicePhase -> PlacePhase -> BattlePhase 순서가 반복되는 구조로 호출

    // function receiveUnit(unitID)
    // DicePhase를 마친 뒤 유닛을 선택하면 호출함
    // Unit ID를 파라미터로 가짐
    receiveUnit(unitID, tier) {
        this.placemode = true;
        this.handleTierBonus(tier, true);
        this.initialPlace(this.unitDB["unit" + unitID],unitID);
    }
    

    handleTierBonus(tier,bool)
    {
        bool ? this.tierCnt[tier - 1]++ : this.tierCnt[tier - 1]--;
        let tierOnlyBonus = 0;
        let overallBonus = 0;

        switch (tier) {
            case 1:
                tierOnlyBonus = 200;
                overallBonus = 15;
                break;
            case 2:
                tierOnlyBonus = 40;
                overallBonus = 4;
                break;
            case 3:
                tierOnlyBonus = 20;
                overallBonus = 2.5;
                break;
            case 4:
                tierOnlyBonus = 10;
                overallBonus = 1.5;
                break;
        }

        this.tierBonus[tier - 1] += tierOnlyBonus * (bool ? 1 : -1);
        
        for (let i = 0; i < 4; i++) {
            this.tierBonus[i] += overallBonus * (bool ? 1 : -1);

            document.getElementsByClassName("ui-unitArea-unitTierCount")[i].innerHTML = "";
            document.getElementsByClassName("ui-unitArea-unitTierCount")[i].innerHTML += this.tierCnt[i] + " <span class='ui-unitArea-unitTierBonus'>(+" + this.tierBonus[i] + "%)</span>";
        }
    }
}

