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



export default class gameScene extends Phaser.Scene{
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
        const map = this.make.tilemap({key: "map_forest"});

        const outside_ground = map.addTilesetImage("outside_ground", "outside_ground");
        const outside_roof = map.addTilesetImage("outside_roof", "outside_roof");
        const outside_wall = map.addTilesetImage("outside_wall", "outside_wall");
        const outside_stair = map.addTilesetImage("outside_stair", "outside_stair");
        const outside_B = map.addTilesetImage("Outside_B", "outside_B");
        const possible = map.addTilesetImage("possible", "possible");

        const tile = map.createLayer("tile", outside_ground, 0, 0);
        const wall = map.createLayer("wall", outside_wall, 0, 0);
        const bridge = map.createLayer("bridge", outside_B, 0, 0);
        const grass = map.createLayer("grass", outside_B, 0, 0);
        const tree1_back = map.createLayer("Tree1_B", outside_B, 0, 0);
        const tree2_back = map.createLayer("Tree2_B", outside_B, 0, 0);
        const tree1_front = map.createLayer("Tree1_F", outside_B, 0, 0);
        const tree2_front = map.createLayer("Tree2_F", outside_B, 0, 0);
        this.info = map.createLayer("info", possible, 0, 0); 
        this.info.alpha = 0;
        // info layer 기준 tileset index가
        // 배치 가능 2897
        // 배치 불가능 2898

        const tileData = outside_ground.tileData;

        for (let tileid in tileData) {
            let layer = map.layers[0];
            layer.data.forEach(tileRow => {
                tileRow.forEach(tile => {
                    if (tile.index - outside_ground.firstgid === parseInt(tileid, 10)) {
                        this.animatedTiles.push(
                            new AnimatedTile(
                                tile,
                                tileData[tileid].animation,
                                outside_ground.firstgid
                            )
                        )
                    }
                });
            });
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

        this.input.on("wheel",  (pointer, gameObjects, deltaX, deltaY, deltaZ) => {

            if (deltaY > 0) {
                var newZoom = this.cameras.main.zoom -.2;
                if (newZoom > 0.7) {
                    this.cameras.main.zoom = newZoom;     
                }
            }
            if (deltaY < 0) {
                var newZoom = this.cameras.main.zoom +.2;
                if (newZoom < 1.7) {
                    this.cameras.main.zoom = newZoom;     
                }
            }
            // this.camera.centerOn(pointer.worldX, pointer.worldY);
            // this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");
        });






//BGM
        this.shopSound = this.sound.add("shop");
        this.shopBuySound = [];
        for (let i = 1; i <= 3; i++) this.shopBuySound.push(this.sound.add("shopBuy" + i));
        this.shopBuyFailSound = this.sound.add("shopBuyFail");
        // this.m_music = this.sound.add("music");
        // this.sound.pauseOnBlur = false;
        // const musicConfig = {
        //     mute: false,
        //     volume: 0.7,
        //     rate: 1,
        //     detune: 0,
        //     seek: 0,
        //     loop: true,
        //     delay: 0
        // };
        //this.m_music.play(musicConfig);


//몹/유저유닛/투사체 관련
        this.m_mobs = this.physics.add.group();
        this.mobArray = [];
        this.roundNum = 0;
        this.globalnum = 1;
        this.mobCounter = 0;
        this.unitIndex = 0;
        this.playerHealth = 100;
        this.placemode = false;
        this.checkLast = false;
        this.m_projectiles = this.physics.add.group();
        this.unitDB = this.cache.json.get("unitDB");
        this.mobDB = this.cache.json.get("mobDB");
        this.roundDB = this.cache.json.get("roundDB");
        this.m_player = [];
        this.selectedUnit;
        this.onPlaceQueue;
        this.prePosX = 0;
        this.prePosY = 0;

        this.physics.add.overlap(this.m_projectiles, this.m_mobs, (projectile, mob) => mob.hit(projectile), null, this);
        this.cameras.main.setBounds(0, 0, 2400, 1440);
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
        else if (x > this.cameras.main.width- 50 && y < 50) {
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

        if (this.checkLast && this.mobCounter == 0)
        {
            Game.Socket.emit('battlePhase-done', true);
            this.checkLast = false;
            this.mobCounter = 0;
        }
    }

    initialPlace(unitData)
    {
        this.info.alpha = 1;
        this.onPlaceQueue = new Unit(this, -500, -500, unitData,this.unitIndex++);
        this.onPlaceQueue.rangeView.alpha = 1;
        this.input.on('pointermove', (pointer) => {
            if (this.placemode) {
                let t = this.getTileAtPointer(pointer, this.info);
                if (!t || t.index == "2898") {
                    this.onPlaceQueue.rangeView.alpha = 0;
                    this.onPlaceQueue.alpha = 0;
                }
                else {
                    this.onPlaceQueue.rangeView.alpha = 0.4;
                    this.onPlaceQueue.alpha = 1;
                }
                this.onPlaceQueue.setX(t.getCenterX());
                this.onPlaceQueue.setY(t.getCenterY());
            }
        });
        this.input.on('pointerdown', (pointer) => {
            if (this.placemode) {
                let t = this.getTileAtPointer(pointer, this.info);
                if (t.index == "2897") {
                    this.m_player.push(this.onPlaceQueue);
                    t.index = "2898";
                    this.info.alpha = 0;
                    this.onPlaceQueue.rangeView.alpha = 0;
                    t.placedUnit = this.onPlaceQueue;
                    this.placemode = false;
                    this.input.off("pointermove");
                    this.input.off("pointerdown");
                    this.onPlaceQueue.setX(t.getCenterX());
                    this.onPlaceQueue.setY(t.getCenterY());
                    this.resetBuff();
                    console.log(this.m_player);
                    this.onPlaceQueue = undefined;
                    this.placeModeController(true);
                }
            }
        },this);
    }

    resetBuff()
    {
        
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

    placeModeController(bool)
    {
        if (bool)
        {
            this.input.on("pointerdown", (pointer) => {
                let t = this.getTileAtPointer(pointer, this.info);
                this.m_player.splice(this.m_player.findIndex(e => e.index == t.placedUnit.index), 1);
                t.index = "2897";
                var unitID = parseInt(t.placedUnit.idleAnim.substring(4, t.placedUnit.idleAnim.length - 4));
                this.onPlaceQueue = t.placedUnit;
                t.placedUnit.remove();
                this.placemode = true;
                this.placeModeController(false);
                this.initialPlace(this.unitDB["unit"+unitID]);
            });  
        }
        else {
            this.input.off("pointerdown");
            this.input.off("pointermove");
            this.info.alpha = 0;
            if (this.onPlaceQueue != undefined) {
                this.handleTierBonus(this.onPlaceQueue.tier, false);
                console.log(this.tierBonus);
                console.log(this.tierCnt);
                this.onPlaceQueue.remove();
                this.onPlaceQueue = undefined;
            }
                
        }
    }

    startRound() {
        //this.roundDB["round" + this.roundNum].forEach((element) => {
        this.currentRoundData.forEach((element) => {
                this.time.addEvent({
                delay: 500,
                callback: () => {
                    this.m_mobs.add(new Mob(this, this.mobDB[element["mobName"]], this.globalnum, element["mobRoute"]));
                    this.globalnum++;
                },
                repeat: element["mobCount"]-1,
                startAt: 0
            });
            this.mobCounter += element["mobCount"];
        });
        this.checkLast = true;
    }

    placeUnitOnTile(tile, Unit, prePosX, prePosY) {
        if (tile.index == "2897") {
            tile.index = "2898";
            Unit.x = tile.pixelX + 24;
            Unit.y = tile.pixelY + 24;
        }
        else if (tile.index == "2898") {
            Unit.x = prePosX;
            Unit.y = prePosY;
        }
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
        this.PhaseText = "Dice Phase";
        this.input.setDraggable(this.m_player, false);
        
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
        //this.phaseTimer = this.time.delayedCall(20000, this.toBattlePhase, [], this);
    }
    toBattlePhase() {
        this.placeModeController(false);
        this.PhaseText = "Battle Phase";
        this.startRound();
        //this.phaseTimer = this.time.delayedCall(6000, this.toDicePhase, [], this);
    }
    // DicePhase -> PlacePhase -> BattlePhase 순서가 반복되는 구조로 호출

    // function receiveUnit(unitID)
    // DicePhase를 마친 뒤 유닛을 선택하면 호출함
    // Unit ID를 파라미터로 가짐
    receiveUnit(unitID, tier) {
        this.placemode = true;
        this.initialPlace(this.unitDB["unit" + unitID]);
        this.handleTierBonus(tier, true);
    }

    handleTierBonus(tier,bool)
    {
        bool ? this.tierCnt[tier - 1]++ : this.tierCnt[tier - 1]--;
        let buffvalue1 = 0;
        let buffvalue2 = 0;
        switch (tier) {
            case 1:
                buffvalue1 = 20;
                buffvalue2 = 2.5;
                break;
            case 2:
                buffvalue1 = 15;
                buffvalue2 = 5;
                break;
            case 3:
                buffvalue1 = 10;
                buffvalue2 = 7.5;
                break;
            case 4:
                buffvalue1 = 15
                break;
        }

        this.tierBonus[tier - 1] += buffvalue1 * (bool ? 1 : -1);
        this.tierBonus[3] += buffvalue2 * (bool ? 1 : -1);

         for (let i = 0; i < 4; i++) {
            document.getElementsByClassName("ui-unitArea-unitTierCount")[i].innerHTML = "";
            document.getElementsByClassName("ui-unitArea-unitTierCount")[i].innerHTML += this.tierCnt[i] + " <span class='ui-unitArea-unitTierBonus'>(+" + this.tierBonus[i] + "%)</span>";
        }
    }
}

