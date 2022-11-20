import Phaser from "phaser";
import Game from "../Game";
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
import roundSheet from '../assets/specsheets/roundSheet.json';

import healthBar from '../assets/images/healthBar.png';
import Bullet from '../assets/projectiles/bullet.png';

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
            progressBar.destroy();
            progressBox.destroy();
        });

        // 유닛 대기, 공격 모션 로딩
        for (var i = 0; i < 64; i++){
            this.load.spritesheet("unit" + i + "idle", require("../assets/spritesheets/units/unit" + i + "_idle.png"), { frameWidth: 128, frameHeight: 128 });
            this.load.spritesheet("unit" + i + "atk", require("../assets/spritesheets/units/unit" + i + "_atk.png"), { frameWidth: 128, frameHeight: 128 });
        }
        

        // 이펙트 관련 로딩
        this.load.spritesheet("attack1", require("../assets/spritesheets/effect/attack1_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack2", require("../assets/spritesheets/effect/attack2_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack3", require("../assets/spritesheets/effect/attack3_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack4", require("../assets/spritesheets/effect/attack4_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack5_1", require("../assets/spritesheets/effect/attack5_1_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack5_2", require("../assets/spritesheets/effect/attack5_2_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack6", require("../assets/spritesheets/effect/attack6_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack7_1", require("../assets/spritesheets/effect/attack7_1_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack7_2", require("../assets/spritesheets/effect/attack7_2_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack8", require("../assets/spritesheets/effect/attack8_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack9", require("../assets/spritesheets/effect/attack9_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack10", require("../assets/spritesheets/effect/attack10_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack11", require("../assets/spritesheets/effect/attack11_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack12", require("../assets/spritesheets/effect/attack12_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack13", require("../assets/spritesheets/effect/attack13_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack14", require("../assets/spritesheets/effect/attack14_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack16", require("../assets/spritesheets/effect/attack16_sprite.png"), {frameWidth: 100, frameHeight: 100});
        this.load.spritesheet("attack17", require("../assets/spritesheets/effect/attack17_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("attack18", require("../assets/spritesheets/effect/attack18_sprite.png"), {frameWidth: 600, frameHeight: 555});
        this.load.spritesheet("attack19_1", require("../assets/spritesheets/effect/attack19_1_sprite.png"), {frameWidth: 550, frameHeight: 500});
        this.load.spritesheet("attack19_2", require("../assets/spritesheets/effect/attack19_2_sprite.png"), {frameWidth: 550, frameHeight: 500});
        this.load.spritesheet("attack19_3", require("../assets/spritesheets/effect/attack19_3_sprite.png"), {frameWidth: 550, frameHeight: 500});
        this.load.spritesheet("attack20", require("../assets/spritesheets/effect/attack20_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("bigFireBall", require("../assets/spritesheets/effect/big_fire_ball_sprite.png"), {frameWidth: 515, frameHeight: 746});
        this.load.spritesheet("bigFireBall90", require("../assets/spritesheets/effect/big_fire_ball_90_sprite.png"), {frameWidth: 746, frameHeight: 515});
        this.load.spritesheet("boom", require("../assets/spritesheets/effect/boom_sprite.png"), {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet("boom2", require("../assets/spritesheets/effect/boom2_sprite.png"), {frameWidth: 200, frameHeight: 500});
        this.load.spritesheet("boom3", require("../assets/spritesheets/effect/boom3_sprite.png"), {frameWidth: 300, frameHeight: 300});
        this.load.spritesheet("boom5", require("../assets/spritesheets/effect/boom5_sprite.png"), {frameWidth: 780, frameHeight: 780});
        this.load.spritesheet("buff1", require("../assets/spritesheets/effect/buff1_sprite.png"), {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet("buff2", require("../assets/spritesheets/effect/buff2_sprite.png"), {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet("buff3", require("../assets/spritesheets/effect/buff3_sprite.png"), {frameWidth: 450, frameHeight: 450});
        this.load.spritesheet("electricBall", require("../assets/spritesheets/effect/electric_ball_sprite.png"), {frameWidth: 750, frameHeight: 750});
        this.load.spritesheet("fireFromBottom", require("../assets/spritesheets/effect/fire_from_bottom_sprite.png"), {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet("fireShot1", require("../assets/spritesheets/effect/fire_shot_1_sprite.png"), {frameWidth: 120, frameHeight: 160});
        this.load.spritesheet("fireShot2", require("../assets/spritesheets/effect/fire_shot_2_sprite.png"), {frameWidth: 500, frameHeight: 400});
        this.load.spritesheet("fireShot3_1", require("../assets/spritesheets/effect/fire_shot_3_1_sprite.png"), {frameWidth: 340, frameHeight: 240});
        this.load.spritesheet("fireShot3_2", require("../assets/spritesheets/effect/fire_shot_3_2_sprite.png"), {frameWidth: 340, frameHeight: 240});
        this.load.spritesheet("greenBirdShot1", require("../assets/spritesheets/effect/green_bird_shot_1_sprite.png"), {frameWidth: 400, frameHeight: 400});
        this.load.spritesheet("greenBirdShot2", require("../assets/spritesheets/effect/green_bird_shot_2_sprite.png"), {frameWidth: 450, frameHeight: 320});
        this.load.spritesheet("hitted", require("../assets/spritesheets/effect/hitted_sprite.png"), {frameWidth: 444, frameHeight: 444});
        this.load.spritesheet("hitted2", require("../assets/spritesheets/effect/hitted2_sprite.png"), {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet("hitted3", require("../assets/spritesheets/effect/hitted3_sprite.png"), {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet("orbPurple", require("../assets/spritesheets/effect/orb_purple_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("orbRed", require("../assets/spritesheets/effect/orb_red_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("pierce", require("../assets/spritesheets/effect/pierce_sprite.png"), {frameWidth: 435, frameHeight: 435});
        this.load.spritesheet("purpleFire", require("../assets/spritesheets/effect/purple_fire_sprite.png"), {frameWidth: 400, frameHeight: 400});
        this.load.spritesheet("purpleFire90", require("../assets/spritesheets/effect/purple_fire_90_sprite.png"), {frameWidth: 400, frameHeight: 400});
        this.load.spritesheet("purpleShot1", require("../assets/spritesheets/effect/purple_shot_1_sprite.png"), {frameWidth: 170, frameHeight: 170});
        this.load.spritesheet("purpleShot2", require("../assets/spritesheets/effect/purple_shot_2_sprite.png"), {frameWidth: 420, frameHeight: 420});
        this.load.spritesheet("purpleShot3", require("../assets/spritesheets/effect/purple_shot_3.png"), {frameWidth: 400, frameHeight: 240});
        this.load.spritesheet("blueShot1", require("../assets/spritesheets/effect/blue_shot_1_sprite.png"), {frameWidth: 170, frameHeight: 170});
        this.load.spritesheet("greenShot1", require("../assets/spritesheets/effect/green_shot_1_sprite.png"), {frameWidth: 170, frameHeight: 170});
        this.load.spritesheet("redShot1", require("../assets/spritesheets/effect/red_shot_1_sprite.png"), {frameWidth: 170, frameHeight: 170});
        this.load.spritesheet("redFire", require("../assets/spritesheets/effect/red_fire_sprite.png"), {frameWidth: 500, frameHeight: 500});
        this.load.spritesheet("redFire90", require("../assets/spritesheets/effect/red_fire_90_sprite.png"), {frameWidth: 501, frameHeight: 501});
        this.load.spritesheet("redFire2", require("../assets/spritesheets/effect/red_fire2_sprite.png"), {frameWidth: 540, frameHeight: 540});
        this.load.spritesheet("redFire2_90", require("../assets/spritesheets/effect/red_fire2_90_sprite.png"), {frameWidth: 540, frameHeight: 540});
        this.load.spritesheet("shot", require("../assets/spritesheets/effect/shot_sprite.png"), {frameWidth: 361, frameHeight: 50});
        this.load.spritesheet("thunder", require("../assets/spritesheets/effect/thunder_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("tornado1", require("../assets/spritesheets/effect/tornado_1_sprite.png"), {frameWidth: 800, frameHeight: 800});
        this.load.spritesheet("tornado2", require("../assets/spritesheets/effect/tornado_2.png"), {frameWidth: 800, frameHeight: 800});
        this.load.spritesheet("tornadoOrg", require("../assets/spritesheets/effect/tornado_org_sprite.png"), {frameWidth: 800, frameHeight: 800});
        this.load.spritesheet("weaponProjectile1", require("../assets/spritesheets/effect/weapon_projectile_1.png"), {frameWidth: 6, frameHeight: 15});
        this.load.spritesheet("weaponProjectile2", require("../assets/spritesheets/effect/weapon_projectile_2.png"), {frameWidth: 194, frameHeight: 194});
        this.load.spritesheet("weaponProjectile3", require("../assets/spritesheets/effect/weapon_projectile_3.png"), {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet("weaponProjectile4", require("../assets/spritesheets/effect/weapon_projectile_4.png"), {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("weaponProjectile5", require("../assets/spritesheets/effect/weapon_projectile_5.png"), {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet("weaponProjectile6", require("../assets/spritesheets/effect/weapon_projectile_6.png"), {frameWidth: 32, frameHeight: 32});
        
        this.load.spritesheet("bullet", Bullet, { frameWidth: 361, frameHeight: 50 });

        // 보스 몹 로딩
        this.load.spritesheet("bearWalk", require("../assets/spritesheets/boss/bear_walk_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("bearDie", require("../assets/spritesheets/boss/bear_die_sprite.png"), {frameWidth: 740, frameHeight: 340});
        this.load.spritesheet("giantWalk", require("../assets/spritesheets/boss/giant_walk_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("giantDie", require("../assets/spritesheets/boss/giant_walk_sprite.png"), {frameWidth: 252, frameHeight: 356});
        this.load.spritesheet("magicianWalk", require("../assets/spritesheets/boss/magician_walk_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("magicianDie", require("../assets/spritesheets/boss/magician_die_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("slimeKingWalk", require("../assets/spritesheets/boss/slime_king_walk_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("slimeKingDie", require("../assets/spritesheets/boss/slime_king_die_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("stoneGolemWalk", require("../assets/spritesheets/boss/stone_golem_walk_sprite.png"), {frameWidth: 340, frameHeight: 340});
        this.load.spritesheet("stoneGolemDie", require("../assets/spritesheets/boss/stone_golem_die_sprite.png"), {frameWidth: 340, frameHeight: 340});

        // 몹 로딩
        this.load.spritesheet("BatSmallA", require("../assets/spritesheets/mobs/BatSmallA.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("WormA", require("../assets/spritesheets/mobs/WormA.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("BrainD", require("../assets/spritesheets/mobs/BrainD.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("CloudA", require("../assets/spritesheets/mobs/CloudA.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("EyeBallA", require("../assets/spritesheets/mobs/EyeBallA.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("DyeD", require("../assets/spritesheets/mobs/DyeD.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("HeadA", require("../assets/spritesheets/mobs/HeadA.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("MummyC", require("../assets/spritesheets/mobs/MummyC.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("PuddleA", require("../assets/spritesheets/mobs/PuddleA.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("ScorpionC", require("../assets/spritesheets/mobs/ScorpionC.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("SkullD", require("../assets/spritesheets/mobs/SkullD.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("SlimeSmallA", require("../assets/spritesheets/mobs/SlimeSmallA.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("TentacleC", require("../assets/spritesheets/mobs/TentacleC.png"), { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("GhastB", require("../assets/spritesheets/mobs/GhastB.png"), { frameWidth: 16, frameHeight: 16 });

        // 사운드 관련 로딩
        //this.load.audio("music", bgm);
        this.load.audio("death", batDeath);
        this.load.audio("shoot", bulletShoot);

        // 맵 로딩
        this.load.image("outside_ground", outside_ground);
        this.load.image("outside_roof", outside_roof);
        this.load.image("outside_wall", outside_wall);
        this.load.image("outside_stair", outside_stair);
        this.load.image("outside_B", outside_B);
        this.load.image("possible", possible);
        this.load.tilemapTiledJSON("map_forest", map_forest);

        this.load.image("healthBar", healthBar);
        
        // 게임 내 데이터 로드
        this.load.json("unitDB", unitSpecsheet);
        this.load.json("mobDB", mobSpecsheet);
        this.load.json("roundDB", roundSheet);
    }

    create() {
        this.add.text(20, 20, "Loading Game...");

        // 유닛 대기, 공격 애니메이션 생성
        var irregulars = [3, 8, 9, 21, 22, 39, 43, 46, 48];
        for (var i = 0; i < 64; i++)
        {   
            this.anims.create({
                key: "unit" + i + "idle",
                frames: this.anims.generateFrameNumbers("unit" + i + "idle", { start: 0, end: 11 }),
                repeat: -1,
                frameRate: 40
            });
            if (irregulars.findIndex(e => e == i) != -1)
                continue;
            this.anims.create({
                key: "unit" + i + "atk",
                frames: this.anims.generateFrameNumbers("unit" + i + "atk", { start: 0, end: 12 }),
                repeat: 0,
                frameRate: 40
            });    
        }
        this.anims.create({
            key: "unit3atk",
            frames: this.anims.generateFrameNumbers("unit3atk", { start: 0, end: 24 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit8atk",
            frames: this.anims.generateFrameNumbers("unit8atk", { start: 0, end: 24 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit9atk",
            frames: this.anims.generateFrameNumbers("unit9atk", { start: 0, end: 18 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit21atk",
            frames: this.anims.generateFrameNumbers("unit21atk", { start: 0, end: 24 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit22atk",
            frames: this.anims.generateFrameNumbers("unit22atk", { start: 0, end: 18 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit39atk",
            frames: this.anims.generateFrameNumbers("unit39atk", { start: 0, end: 24 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit43atk",
            frames: this.anims.generateFrameNumbers("unit43atk", { start: 0, end: 24 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit46atk",
            frames: this.anims.generateFrameNumbers("unit46atk", { start: 0, end: 24 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "unit48atk",
            frames: this.anims.generateFrameNumbers("unit48atk", { start: 0, end: 24 }),
            repeat: 0,
            frameRate: 40
        });
        // 공격 프레임 속도 40 (프레임당 0.025초) 기준
        // 13프레임의 경우 0.325초 (1초에 3.07회)
        // 19프레임의 경우 0.475초 (1초에 2.10회)
        // 25프레임의 경우 0.625초 (1초에 1.6회)
        // 각각 저 횟수 이상으로 공격할 수 없음

        // 보스 몹 애니메이션 생성
        this.anims.create({
            key: "bearWalk",
            frames: this.anims.generateFrameNumbers("bearWalk", { start: 0, end: 42 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "bearDie",
            frames: this.anims.generateFrameNumbers("bearDie", { start: 0, end: 106 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "giantWalk",
            frames: this.anims.generateFrameNumbers("giantWalk", { start: 0, end: 11 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "giantDie",
            frames: this.anims.generateFrameNumbers("giantDie", { start: 0, end: 26 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "magicianWalk",
            frames: this.anims.generateFrameNumbers("magicianWalk", { start: 0, end: 26 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "magicianDie",
            frames: this.anims.generateFrameNumbers("magicianDie", { start: 0, end: 26 }),
            repeat: 1,
            frameRate: 40
        }); // => magician은 사망 모션 진행과 동시에 투명도를 0%까지 서서히 조절시켜야함

        this.anims.create({
            key: "slimeKingWalk",
            frames: this.anims.generateFrameNumbers("slimeKingWalk", { start: 0, end: 73 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "slimeKingDie",
            frames: this.anims.generateFrameNumbers("slimeKingDie", { start: 0, end: 136 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "stoneGolemWalk",
            frames: this.anims.generateFrameNumbers("stoneGolemWalk", { start: 0, end: 53 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "stoneGolemDie",
            frames: this.anims.generateFrameNumbers("stoneGolemDie", { start: 0, end: 46 }),
            repeat: -1,
            frameRate: 40
        });


        // 몹 애니메이션 생성
        this.anims.create({
            key: "BatSmallA",
            frames: this.anims.generateFrameNumbers("BatSmallA", { start: 0, end: 5 }),
            repeat: -1,
            frameRate: 6
        });

        this.anims.create({
            key: "WormA",
            frames: this.anims.generateFrameNumbers("WormA", { start: 0, end: 6 }),
            repeat: -1,
            frameRate: 7
        });

        this.anims.create({
            key: "BrainD",
            frames: this.anims.generateFrameNumbers("BrainD", { start: 0, end: 11 }),
            repeat: -1,
            frameRate: 12
        });

        this.anims.create({
            key: "CloudA",
            frames: this.anims.generateFrameNumbers("CloudA", { start: 0, end: 8 }),
            repeat: -1,
            frameRate: 9
        });

        this.anims.create({
            key: "DyeD",
            frames: this.anims.generateFrameNumbers("DyeD", { start: 0, end: 11 }),
            repeat: -1,
            frameRate: 12
        });

        this.anims.create({
            key: "EyeBallA",
            frames: this.anims.generateFrameNumbers("EyeBallA", { start: 0, end: 6 }),
            repeat: -1,
            frameRate: 7
        });

        this.anims.create({
            key: "GhastB",
            frames: this.anims.generateFrameNumbers("GhastB", { start: 0, end: 7 }),
            repeat: -1,
            frameRate: 8
        });

        this.anims.create({
            key: "HeadA",
            frames: this.anims.generateFrameNumbers("HeadA", { start: 0, end: 8 }),
            repeat: -1,
            frameRate: 9
        });

        this.anims.create({
            key: "MummyC",
            frames: this.anims.generateFrameNumbers("MummyC", { start: 0, end: 9 }),
            repeat: -1,
            frameRate: 10
        });

        this.anims.create({
            key: "PuddleA",
            frames: this.anims.generateFrameNumbers("PuddleA", { start: 7, end: 14 }),
            repeat: -1,
            frameRate: 8
        });

        this.anims.create({
            key: "ScorpionC",
            frames: this.anims.generateFrameNumbers("ScorpionC", { start: 0, end: 4 }),
            repeat: -1,
            frameRate: 5
        });

        this.anims.create({
            key: "SlimeSmallA",
            frames: this.anims.generateFrameNumbers("SlimeSmallA", { start: 0, end: 9 }),
            repeat: -1,
            frameRate: 10
        });

        this.anims.create({
            key: "TentacleC",
            frames: this.anims.generateFrameNumbers("TentacleC", { start: 0, end: 5 }),
            repeat: -1,
            frameRate: 6
        });
        // 이펙트 애니메이션 생성
        this.anims.create({
            key: "attack1",
            frames: this.anims.generateFrameNumbers("attack1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack2",
            frames: this.anims.generateFrameNumbers("attack2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack3",
            frames: this.anims.generateFrameNumbers("attack3", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack4",
            frames: this.anims.generateFrameNumbers("attack4", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack5_1",
            frames: this.anims.generateFrameNumbers("attack5_1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack5_2",
            frames: this.anims.generateFrameNumbers("attack5_2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack6",
            frames: this.anims.generateFrameNumbers("attack6", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack7_1",
            frames: this.anims.generateFrameNumbers("attack7_1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        
        this.anims.create({
            key: "attack7_2",
            frames: this.anims.generateFrameNumbers("attack7_1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack8",
            frames: this.anims.generateFrameNumbers("attack8", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack9",
            frames: this.anims.generateFrameNumbers("attack9", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack10",
            frames: this.anims.generateFrameNumbers("attack10", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack11",
            frames: this.anims.generateFrameNumbers("attack11", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack12",
            frames: this.anims.generateFrameNumbers("attack12", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack13",
            frames: this.anims.generateFrameNumbers("attack13", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack14",
            frames: this.anims.generateFrameNumbers("attack14", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack16",
            frames: this.anims.generateFrameNumbers("attack16", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack17",
            frames: this.anims.generateFrameNumbers("attack17", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack18",
            frames: this.anims.generateFrameNumbers("attack18", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack19_1",
            frames: this.anims.generateFrameNumbers("attack19_1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack19_2",
            frames: this.anims.generateFrameNumbers("attack19_2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack19_3",
            frames: this.anims.generateFrameNumbers("attack19_3", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "attack20",
            frames: this.anims.generateFrameNumbers("attack20", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "bigFireBall",
            frames: this.anims.generateFrameNumbers("bigFireBall", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "bigFireBall90",
            frames: this.anims.generateFrameNumbers("bigFireBall90", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "boom",
            frames: this.anims.generateFrameNumbers("boom", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "boom2",
            frames: this.anims.generateFrameNumbers("boom2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "boom3",
            frames: this.anims.generateFrameNumbers("boom3", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "boom5",
            frames: this.anims.generateFrameNumbers("boom5", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "buff1",
            frames: this.anims.generateFrameNumbers("buff1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "buff2",
            frames: this.anims.generateFrameNumbers("buff2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "buff3",
            frames: this.anims.generateFrameNumbers("buff3", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "electricBall",
            frames: this.anims.generateFrameNumbers("electricBall", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "fireFromBottom",
            frames: this.anims.generateFrameNumbers("fireFromBottom", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "fireShot1",
            frames: this.anims.generateFrameNumbers("fireShot1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "fireShot2",
            frames: this.anims.generateFrameNumbers("fireShot2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "fireShot3_1",
            frames: this.anims.generateFrameNumbers("fireShot3_1", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "fireShot3_2",
            frames: this.anims.generateFrameNumbers("fireShot3_2", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "greenBirdShot1",
            frames: this.anims.generateFrameNumbers("greenBirdShot1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "greenBirdShot2",
            frames: this.anims.generateFrameNumbers("greenBirdShot2", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "hitted",
            frames: this.anims.generateFrameNumbers("hitted", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "hitted2",
            frames: this.anims.generateFrameNumbers("hitted2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "hitted3",
            frames: this.anims.generateFrameNumbers("hitted3", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "orbPurple",
            frames: this.anims.generateFrameNumbers("orbPurple", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "orbRed",
            frames: this.anims.generateFrameNumbers("orbRed", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "pierce",
            frames: this.anims.generateFrameNumbers("pierce", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "purpleFire",
            frames: this.anims.generateFrameNumbers("purpleFire", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "purpleFire90",
            frames: this.anims.generateFrameNumbers("purpleFire90", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "purpleShot1",
            frames: this.anims.generateFrameNumbers("purpleShot1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "purpleShot2",
            frames: this.anims.generateFrameNumbers("purpleShot2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "purpleShot3",
            frames: this.anims.generateFrameNumbers("purpleShot3", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "blueShot1",
            frames: this.anims.generateFrameNumbers("blueShot1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "redShot1",
            frames: this.anims.generateFrameNumbers("redShot1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "redFire",
            frames: this.anims.generateFrameNumbers("redFire", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "redFire90",
            frames: this.anims.generateFrameNumbers("redFire90", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "redFire2",
            frames: this.anims.generateFrameNumbers("redFire2", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "redFire2_90",
            frames: this.anims.generateFrameNumbers("redFire2_90", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "shot",
            frames: this.anims.generateFrameNumbers("shot", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "thunder",
            frames: this.anims.generateFrameNumbers("thunder", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "tornado1",
            frames: this.anims.generateFrameNumbers("tornado1", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "tornado2",
            frames: this.anims.generateFrameNumbers("tornado2", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "tornadoOrg",
            frames: this.anims.generateFrameNumbers("tornadoOrg", { start: 0 }),
            repeat: 0,
            frameRate: 40
        });
        this.anims.create({
            key: "weaponProjectile1",
            frames: this.anims.generateFrameNumbers("weaponProjectile1", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "weaponProjectile2",
            frames: this.anims.generateFrameNumbers("weaponProjectile2", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "weaponProjectile3",
            frames: this.anims.generateFrameNumbers("weaponProjectile3", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "weaponProjectile4",
            frames: this.anims.generateFrameNumbers("weaponProjectile4", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "weaponProjectile5",
            frames: this.anims.generateFrameNumbers("weaponProjectile5", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });
        this.anims.create({
            key: "weaponProjectile6",
            frames: this.anims.generateFrameNumbers("weaponProjectile6", { start: 0 }),
            repeat: -1,
            frameRate: 40
        });


        this.anims.create({
            key: "bullet",
            frames: this.anims.generateFrameNumbers("bullet", { start: 0 }),
            repeat: 0,
            frameRate: 15
        });

        Game.onPreloadDone();
        Game.showScene("gameScene");
    }
}
