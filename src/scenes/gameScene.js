import girl from '../objects/units/test.js';
import Mob from '../objects/mobs/Mob.js';
import shooter from '../objects/units/test2.js';
import Projectile from '../objects/projectiles/projectile.js';
const Phaser = require('phaser');
const Config = require("../Config");

export default class gameScene extends Phaser.Scene{
    constructor() {
        super("gameScene");
    }

    create(){
        this.sound.pauseOnBlur = false;
        this.globalnum = 1;
        this.spawnpoint = {
            x: -500,
            y: -200
        }

        this.endpoint = {
            x: 500,
            y: -200
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
        //this.m_mobs.add(new Mob(this));

        this.m_projectiles = this.physics.add.group();

        this.m_player = new shooter(this);
        this.cameras.main.startFollow(this.m_player);

        this.physics.add.overlap(this.m_player, this.m_mobs, (player, mob) => {
            player.addMobtoTarget(this, mob);
            player.attackMob(this);
        }, null, this);

        this.physics.add.overlap(this.m_projectiles, this.m_mobs, (projectile, mob) => mob.bullseye(this,projectile), null, this);
        
        //this.logMob();
    }

    addMob() {
        this.time.addEvent({
            delay: 1000,
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

    mobPos(id)
    {
        return this.m_mobs.getChildren().find(e => e.mobNum === id);
    }
}