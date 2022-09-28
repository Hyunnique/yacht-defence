import Phaser from "phaser";
import testAtk  from "../assets/spritesheets/test/GG_cha_02_atk1.png";
import testWait from "../assets/spritesheets/test/idle.png";
import bgm from "../assets/sounds/WaveofEmptiness.mp3";
import fontPng from "../assets/font/font.png";
import fontXml from '../assets/font/font.xml';
import batImg from '../assets/spritesheets/bat.png';
import bulletImg from '../assets/spritesheets/bullet.png';

export default class PreLoadScene extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }

    preload() {
        this.load.spritesheet("testwait", testWait, {
            frameWidth: 150,
            frameHeight: 150,
        });
        this.load.spritesheet("testatk", testAtk, {
            frameWidth: 204,
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
        this.load.bitmapFont("pixelFont", fontPng, fontXml);
    }

    create() {
        this.add.text(20, 20, "Loading Game...");
        this.scene.start("mainScene");

        this.anims.create({
            key: "test_wait",
            frames: this.anims.generateFrameNumbers("testwait"),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "test_atk",
            frames: this.anims.generateFrameNames("testatk",{end: 6}),
            frameRate: 7,
            repeat: -1
        });

        this.anims.create({
            key: "bullet_anim",
            frames: this.anims.generateFrameNumbers("bullet"),
            frameRate: 15,
            repeat: -1
        })

        this.anims.create({
            key: "bat_anim",
            frames: this.anims.generateFrameNumbers("bat"),
            frameRate: 12,
            repeat: -1
        })
    }
}