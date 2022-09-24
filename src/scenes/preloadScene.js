import Phaser from "phaser";
import testAtk  from "../assets/spritesheets/test/GG_cha_02_atk1.png";
import testWait from "../assets/spritesheets/test/idle.png";
import bgm from "../assets/sounds/WaveofEmptiness.mp3";
import fontPng from "../assets/font/font.png";
import fontXml from '../assets/font/font.xml';
import batImg from '../assets/spritesheets/bat.png';

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
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "bat_anim",
            frames: this.anims.generateFrameNumbers("bat"),
            frameRate: 12,
            repeat: -1
        })
    }
}