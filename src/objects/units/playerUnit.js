import Homing from '../projectiles/homing.js';
import Penetrate from '../projectiles/penetrate.js';
import Bomb from '../projectiles/bomb.js'
const Config = require("../../Config");
const Phaser = require("phaser");

export default class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,x,y, db) {
        super(scene, x, y, db.idleSprite);

        this.originAttack = db.attack;
        this.originAspd = db.aspd;
        this.attack = db.attack;
        this.aspd = db.aspd;
        this.range = db.range;
        this.attackType = db.attackType;
        this.idleAnim = db.idleAnim;
        this.attackAnim = db.attackAnim;
        this.buffAtk = 0;
        this.buffAspd = 0;
        this.projectileName = "bullet";
        this.projectileAnimName = "bullet";
        this.projectileType = 1;
        
        this.isTarget = false;
        this.isBuffTarget = true;

        this.buffedAtk = 1;
        this.buffedAspd = 0;

        this.scale = 1;
        this.alpha = 1;      
        this.shootSound = this.scene.sound.add("shoot");
        
        this.target = [];
        
        this.setMotionSpeed();

        this.kills = 0;
        this.isTarget = false;

        this.setInteractive({ draggable: true });
        this.scene.physics.add.existing(this);
        this.setBodySize(64, 64, true);
        this.scene.add.existing(this);
        
        this.activateAttack();
        console.log(this);
    }

    checkMob() {
        this.target = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => item.gameObject.isTarget == true);
        return this.target;
    }
    
    //매 턴 시작시 전부 지우고 다시 전부 부여!!
    giveBuff()
    {
        if(this.buffAspd != 0 || this.buffAtk != 0)
        var buffTargets = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => item.gameObject.isBuffTarget == true);
        buffTargets.forEach((e) => {
            e.gameObject.buffedAspd += this.buffAspd;
            e.gameObject.buffedAtk += this.buffAtk;
            e.gameObject.updateBuff();
        })

    }

    removeBuff()
    {
        if(this.buffAspd != 0 || this.buffAtk != 0)
        var buffTargets = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => item.gameObject.isBuffTarget == true);
        buffTargets.forEach((e) => {
            e.gameObject.buffedAspd -= this.buffAspd;
            e.gameObject.buffedAtk -= this.buffAtk;
            e.gameObject.updateBuff();
        })
    }


    updateBuff()
    {
        this.attack = (this.buffedAtk + 1) * this.originAttack;
        this.aspd = this.buffedAspd + this.originAspd;
        this.setMotionSpeed();
    }

    setMotionSpeed()
    {
        this.attackConfig = this.scene.anims.get(this.attackAnim);
        this.attackConfig.frameRate *= this.aspd;
    }

    attackMob()
    {   
        if (this.target.length == 0)
        {
            this.play(this.idleAnim);
            return;
        }

        this.play(this.attackConfig, true);

        if (this.attackType == 0) {
            this.target.forEach(e => {
                e.gameObject.Health -= this.attack;
                if (e.gameObject.Health <= 0) {
                    this.kills++;
                    e.gameObject.death();
                    this.checkMob();
                }
            })
        }
        else if (this.attackType == 1) {
            this.shootSound.play({
            mute: false,
            volume: 0.7,
            rate: 1,
            loop: false
            });
            this.shootProjectile();
        }        
    }

    shootProjectile()
    {   
        if (this.projectileType == 0)
            return new Homing(this.scene, this);
        else if (this.projectileType == 1)
            return new Penetrate(this.scene, this);
        else if (this.projectileType == 2)
            return new Bomb(this.scene, this);
    }

    activateAttack()
    {
        this.scene.time.addEvent({
            delay: 1000 / this.aspd,
            callback: () => {
                this.checkMob();
                this.attackMob();
            },
            loop: true
        });
    }
}