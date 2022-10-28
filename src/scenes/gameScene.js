import girl from '../objects/units/test.js';
import Mob from '../objects/mobs/Mob.js';
import shooter from '../objects/units/test2.js';
import Projectile from '../objects/projectiles/projectile.js';
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

export default class gameScene extends Phaser.Scene{
    constructor() {
        super("gameScene");
    }
    controls;
    debugGraphics;
    animatedTiles = [];

    /*
        타이머관련 변수 선언
            phaseTimer: 현재 동작중인 타이머 저장
            timerText: 타이머 표기용 변수
    */
    phaseTimer;
    timerText;

    create(){
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
        var info = map.createLayer("info", possible, 0, 0); 
        info.alpha = 1;
        // info layer 기준 tileset index가
        // 배치 가능 2897
        // 배치 불가능 2898

        
        this.timerText = this.add.text(32, 32, "");
        var placePhaseTimer = new Phaser.Time.TimerEvent({
            delay: 30000
        });
        var battlePhaseTimer = new Phaser.Time.TimerEvent({
            delay: 60000
        });
        var dicePhaseTimer = new Phaser.Time.TimerEvent({
            delay: 30000
        });
        this.phaseTimer = this.time.addEvent(dicePhaseTimer);

        const tileData = outside_ground.tileData;
        // console.log(tileData);
        // for (let tileid in tileData) console.log(tileid);
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
        // console.log(this.animatedTiles);

        let help = this.add.text(0, 0, '', { font: '48px monospace' }); 
        let cursors = this.input.keyboard.createCursorKeys();

        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.75
        });
        this.debugGraphics = this.add.graphics();

        this.input.on('pointerdown', (pointer) => {
            let t = this.getTileAtPointer(pointer, info);
            if (!t) return;
            console.log(`(${t.x}, ${t.y}) on ${t.layer.name}`, t);
        });
        
        this.input.on('pointermove', (pointer) => {
            let t = this.getTileAtPointer(pointer, info);
            if (!t) return;
            help.setText(t.index).setPosition(t.pixelX, t.pixelY);
            this.drawDebug(t);
        });
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
            this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");
        });

        this.sound.pauseOnBlur = false;
        this.globalnum = 1;
        this.spawnpoint = {
            x: 0,
            y: 600
        }

        this.endpoint = {
            x: 800,
            y: 600
        }
        this.m_music = this.sound.add("music");
        const musicConfig = {
            mute: false,
            volume: 0.7,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        };
        //this.m_music.play(musicConfig);
        this.m_mobs = this.physics.add.group();
        this.addMob();

        this.m_projectiles = this.physics.add.group();

        this.m_player = new shooter(this);

        this.input.setDraggable(this.m_player);

        this.input.on('dragstart', (pointer) => {
            var tile = this.getTileAtPointer(pointer, info);
            if (tile.index == "2898") tile.index = "2897";
        });

        this.input.on('drag', (pointer,gameObject) => {
            gameObject.x = pointer.worldX;
            gameObject.y = pointer.worldY;
        })

        this.input.on('dragend', (pointer, gameObject) => {
            var tile = this.getTileAtPointer(pointer, info);
            this.placeUnitOnTile(info,tile, gameObject);
        })

        this.physics.add.overlap(this.m_player, this.m_mobs, (player, mob) => {
            player.addMobtoTarget(this, mob);
            player.attackMob(this);
        }, null, this);

        this.physics.add.overlap(this.m_projectiles, this.m_mobs, (projectile, mob) => mob.bullseye(this,projectile), null, this);
        this.cameras.main.setBounds(0, 0, 2400, 1440);
        //this.logMob();
    }

    update(time, delta) {
        this.animatedTiles.forEach(tile => tile.update(delta));
        this.controls.update(delta);
        
        let x = this.input.mousePointer.x;
        let y = this.input.mousePointer.y;

        if (x > 1550 && y > 850) {
            this.cameras.main.scrollX += 12;
            this.cameras.main.scrollY += 12;
        }
        else if (x < 50 && y < 50) {
            this.cameras.main.scrollX -= 12;
            this.cameras.main.scrollY -= 12;
        }
        else if (x > 1550 && y < 50) {
            this.cameras.main.scrollX += 12;
            this.cameras.main.scrollY -= 12;
        }
        else if (x < 50 && y > 850) {
            this.cameras.main.scrollX -= 12;
            this.cameras.main.scrollY += 12;
        }
        else if (x > 1550) this.cameras.main.scrollX += 12;
        else if (x < 50) this.cameras.main.scrollX -= 12;
        else if (y > 850) this.cameras.main.scrollY += 12;
        else if (y < 50) this.cameras.main.scrollY -= 12;

        this.timerText.setText('남은 시간 : ' + this.phaseTimer.getRemainingSeconds().toString().substr(0,2));
    }


    addMob() {
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                this.m_mobs.add(new Mob(this,this.globalnum++,this.spawnpoint,this.endpoint));
            },  
            loop: true,
            startAt: 0
        })
    }

    logMob() {
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                console.log(this.m_player);
                console.log(this.m_mobs);
            },
            loop: true
        })
    }

    startPhaseCycle()
    {
        
    }

    placeUnitOnTile(layer,tile, Unit)
    {
        if (tile.index == "2897") {
            tile.index = "2898";
            Unit.x = tile.pixelX + 24;
            Unit.y = tile.pixelY + 24;
            Unit.body.setOffset(0, 0);
            Unit.body.x = Unit.x + Unit.offset;
            Unit.body.y = Unit.y + Unit.offset;
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
}