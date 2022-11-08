import Phaser from "phaser";
import Game from "../Game";
import bgm from "../assets/sounds/WaveofEmptiness.mp3";
import batDeath from "../assets/sounds/death.mp3";
import bulletShoot from "../assets/sounds/shoot.mp3";

import map_forest from '../assets/map/map_forest.json';
import outside_ground from '../assets/map/tileset/outside/outside_ground.png';
import outside_roof from '../assets/map/tileset/outside/outside_roof.png';
import outside_wall from '../assets/map/tileset/outside/outside_wall.png';
import outside_stair from '../assets/map/tileset/outside/outside_stair.png';
import outside_B from '../assets/map/tileset/props/Outside_B.png';
import possible from '../assets/map/tileset/possible/possible.png';

import unitSpecsheet from '../assets/specsheets/unitSpecsheet.json';
import mobSpecsheet from '../assets/specsheets/mobSpecsheet.json';

import unit0atk from '../assets/spritesheets/units/unit0_atk.png';

import BatSmallA from '../assets/spritesheets/mobs/BatSmallA.png';

export default class PreLoadScene extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }

    preload() {
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();

        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(300, 770, 1320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x000000, 1);
            progressBar.fillRect(310, 780, 1300 * value, 30);
        });
        this.load.on("complete", () => {
            console.log("done!");
            progressBar.destroy();
            progressBox.destroy();
        });

        for (var i = 0; i < 64; i++){
            this.load.spritesheet("unit" + i + "idle", require("../assets/spritesheets/units/unit" + i + "_idle.png"), { frameWidth: 128, frameHeight: 128 });
            this.load.spritesheet("unit" + i + "atk", require("../assets/spritesheets/units/unit" + i + "_atk.png"), { frameWidth: 128, frameHeight: 128 });
        }
        
        this.load.spritesheet("BatSmallA", BatSmallA, { frameWidth: 16, frameHeight: 16 });

        this.load.audio("music", bgm);
        this.load.audio("death", batDeath);
        this.load.audio("shoot", bulletShoot);

        this.load.image("outside_ground", outside_ground);
        this.load.image("outside_roof", outside_roof);
        this.load.image("outside_wall", outside_wall);
        this.load.image("outside_stair", outside_stair);
        this.load.image("outside_B", outside_B);
        this.load.image("possible", possible);
        this.load.tilemapTiledJSON("map_forest", map_forest);
        
        this.load.json("unitDB", unitSpecsheet);
        this.load.json("mobDB", mobSpecsheet);
        
    }

    create() {
        this.add.text(20, 20, "Loading Game...");

        var irregulars = [3, 8, 9, 21, 22, 39, 43, 46, 48];
        
        for (var i = 0; i < 64; i++)
        {   
            this.anims.create({
                key: "unit" + i + "idle",
                frames: this.anims.generateFrameNumbers("unit" + i + "idle", { start: 0, end: 11 }),
                repeat: -1,
                frameRate: 12
            });
            if (irregulars.findIndex(e => e == i) != -1)
                continue;
            this.anims.create({
                key: "unit" + i + "atk",
                frames: this.anims.generateFrameNumbers("unit" + i + "atk", { start: 0, end: 12 }),
                repeat: -1,
                frameRate: 13                
            });    
        }
        this.anims.create({
            key: "unit3atk",
            frames: this.anims.generateFrameNumbers("unit3atk", { start: 0, end: 24 }),
            repeat: -1,
            frameRate: 25
        });
        this.anims.create({
            key: "unit8atk",
            frames: this.anims.generateFrameNumbers("unit8atk", { start: 0, end: 24 }),
            repeat: -1,
            frameRate: 25
        });
        this.anims.create({
            key: "unit9atk",
            frames: this.anims.generateFrameNumbers("unit9atk", { start: 0, end: 18 }),
            repeat: -1,
            frameRate: 19
        });
        this.anims.create({
            key: "unit21atk",
            frames: this.anims.generateFrameNumbers("unit21atk", { start: 0, end: 24 }),
            repeat: -1,
            frameRate: 25
        });
        this.anims.create({
            key: "unit22atk",
            frames: this.anims.generateFrameNumbers("unit22atk", { start: 0, end: 18 }),
            repeat: -1,
            frameRate: 19
        });
        this.anims.create({
            key: "unit39atk",
            frames: this.anims.generateFrameNumbers("unit39atk", { start: 0, end: 24 }),
            repeat: -1,
            frameRate: 25
        });
        this.anims.create({
            key: "unit43atk",
            frames: this.anims.generateFrameNumbers("unit43atk", { start: 0, end: 24 }),
            repeat: -1,
            frameRate: 25
        });
        this.anims.create({
            key: "unit46atk",
            frames: this.anims.generateFrameNumbers("unit46atk", { start: 0, end: 24 }),
            repeat: -1,
            frameRate: 25
        });
        this.anims.create({
            key: "unit48atk",
            frames: this.anims.generateFrameNumbers("unit48atk", { start: 0, end: 24 }),
            repeat: -1,
            frameRate: 25
        });
        
        this.anims.create({
            key: "BatSmallA",
            frames: this.anims.generateFrameNumbers("BatSmallA", { start: 0, end: 5 }),
            repeat: -1,
            frameRate: 6
        });

        Game.showScene("mainScene");
    }
}
