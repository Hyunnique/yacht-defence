import Phaser from "phaser";
import testAtk  from "../assets/spritesheets/test/test_atk.png";
import testAtk2  from "../assets/spritesheets/test/GG_cha_02_atk2.png";
import testWait from "../assets/spritesheets/test/test_idle.png";
import bgm from "../assets/sounds/WaveofEmptiness.mp3";
import batDeath from "../assets/sounds/death.mp3";
import bulletShoot from "../assets/sounds/shoot.mp3";
import fontPng from "../assets/font/font.png";
import fontXml from '../assets/font/font.xml';
import batImg from '../assets/spritesheets/bat.png';
import bulletImg from '../assets/spritesheets/bullet.png';
import diceRoll from '../assets/spritesheets/test/dice.png';
import dice1 from '../assets/images/dice_1.png';
import dice2 from '../assets/images/dice_2.png';
import dice3 from '../assets/images/dice_3.png';
import dice4 from '../assets/images/dice_4.png';
import dice5 from '../assets/images/dice_5.png';
import dice6 from '../assets/images/dice_6.png';
import map_forest from '../assets/map/map_forest.json';
import outside_ground from '../assets/map/tileset/outside/outside_ground.png';
import outside_roof from '../assets/map/tileset/outside/outside_roof.png';
import outside_wall from '../assets/map/tileset/outside/outside_wall.png';
import outside_stair from '../assets/map/tileset/outside/outside_stair.png';
import outside_B from '../assets/map/tileset/props/Outside_B.png';
import possible from '../assets/map/tileset/possible/possible.png';
import unitSpecsheet from '../assets/specsheets/unitSpecsheet.json';
import test3idle from '../assets/spritesheets/units/test3idle.png';
import test3atk from '../assets/spritesheets/units/test3atk.png';

export default class PreLoadScene extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }

    preload() {

        this.load.spritesheet("test3wait", test3idle, {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet("test3atk", test3atk, {
            frameWidth: 194,
            frameHeight: 128
        });
        this.load.spritesheet("testwait", testWait, {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet("testatk", testAtk, {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet("testatk2", testAtk2, {
            frameWidth: 150,
            frameHeight: 150,
        });
        this.load.spritesheet("bat", batImg, {
            frameWidth: 16,
            frameHeight: 16,
        });

        this.load.spritesheet("bullet", bulletImg, {
            frameWidth: 361,
            frameHeight: 50
        })
        
        this.load.audio("music", bgm);
        this.load.audio("death", batDeath);
        this.load.audio("shoot", bulletShoot);
        this.load.bitmapFont("pixelFont", fontPng, fontXml);

        this.load.image("outside_ground", outside_ground);
        this.load.image("outside_roof", outside_roof);
        this.load.image("outside_wall", outside_wall);
        this.load.image("outside_stair", outside_stair);
        this.load.image("outside_B", outside_B);
        this.load.image("possible", possible);
        this.load.tilemapTiledJSON("map_forest", map_forest);
        
        this.load.spritesheet("diceroll", diceRoll, {
            frameWidth: 90,
            frameHeight: 90
        })
        this.load.image("dice1", dice1);
        this.load.image("dice2", dice2);
        this.load.image("dice3", dice3);
        this.load.image("dice4", dice4);
        this.load.image("dice5", dice5);
        this.load.image("dice6", dice6);

        this.load.json("unitDB", unitSpecsheet);
    }

    create() {
        this.add.text(20, 20, "Loading Game...");
        
        this.anims.create({
            key: "test3wait",
            frames: this.anims.generateFrameNumbers("test3wait", {end:14}),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: "test3atk",
            frames: this.anims.generateFrameNumbers("test3atk", {end:12}),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: "test_wait",
            frames: this.anims.generateFrameNumbers("testwait", {end:14}),
            frameRate: 30,
            repeat: -1
        });

        this.anims.create({
            key: "test_atk",
            frames: this.anims.generateFrameNames("testatk"),
            frameRate: 9,
            repeat: -1
        });

        this.anims.create({
            key: "test_atk2",
            frames: this.anims.generateFrameNames("testatk2"),
            frameRate: 6,
            repeat: -1
        });


        this.anims.create({
            key: "bullet_anim",
            frames: this.anims.generateFrameNumbers("bullet"),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: "bat_anim",
            frames: this.anims.generateFrameNumbers("bat"),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: "dice_roll",
            frames: this.anims.generateFrameNames("diceroll"),
            frameRate: 72,
            repeat: -1
        });

        this.scene.start("mainScene");
    }
}
