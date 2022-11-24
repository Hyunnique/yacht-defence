import Homing from '../projectiles/homing.js';
import Penetrate from '../projectiles/penetrate.js';
import Bomb from '../projectiles/bomb.js'
import UnitEffect from './unitEffect.js';
import effectOffset from '../../assets/specsheets/effectOffsetSheet.json';
import Game from "../../Game.js";
const Config = require("../../Config");
const Phaser = require("phaser");

export default class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, db, index) {
        super(scene, x, y, db.idleSprite);

        this.setOrigin(0.5, 0.5);
        this.setDepth(3);
        this.originAttack = db.attack;
        this.originAspd = db.aspd;
        this.originPenetration = db.penetration;
        this.attack = db.attack;
        this.aspd = db.aspd;
        this.penetration = db.penetration;
        this.range = db.range;
        this.buffRange = db.buffRange;
        this.attackType = db.attackType;
        this.idleAnim = db.idleAnim;
        this.attackAnim = db.attackAnim;
        this.atkSoundName = this.scene.sound.add(db.atkSoundName);
        this.hitSoundName = this.scene.sound.add(db.hitSoundName);
        this.effectName = db.effectName;
        this.tier = db.tier;
        this.index = index;
        this.attackReady = true;
        this.play(this.idleAnim,true);
        this.rangeView = this.scene.add.circle(this.x, this.y, this.range, 0xFF0000);
        this.rangeView.setDepth(1);
        this.rangeView.setAlpha(0);

        this.buffRangeView = this.scene.add.circle(this.x, this.y, this.buffRange, 0x00FF00);
        this.buffRangeView.setAlpha(0);
        this.buffRangeView.setDepth(2);

        if (this.range == this.buffRange)
            this.rangeView.setStrokeStyle(8, 0xFF0000);
        this.buffAtk = 0;
        this.buffAspd = 0;
    
        this.globalbuffAtk = Game.shopBuff.shopAtk;
        this.globalbuffAspd = Game.shopBuff.shopAspd;
        this.globalbuffedPenetration = Game.shopBuff.shopPenetration;

        this.buffedAtk = 0;
        this.buffedAspd = 0;

        this.projectileName = db.projectileName;
        this.projectileAnimName = db.projectileAnimName;
        this.projectileType = db.projectileType;
        this.projectileHitEffect = db.projecttileHitEffect;
        if (this.projectileType == 2) {
            this.explodeRange = db.explodeRange;
            this.projectileSpeed = db.projectileSpeed;
            this.explodeScale = db.explodeScale;
        }
        else if (this.projectileType == 1) {
            this.projectileWidth = db.projectileWidth;
            this.projectileHeight = db.projectileHeight;
        }
        
        this.isTarget = false;
        this.isBuffTarget = true;


        this.scale = 1;
        this.alpha = 1;
        this.shootSound = this.scene.sound.add("shoot");

        this.effectOffsetX = effectOffset[this.effectName].x;
        this.effectOffsetY = effectOffset[this.effectName].y;
        this.effectIsFlip = effectOffset[this.effectName].isFlip == 1 ? true : false;
        // console.log(this.effectOffsetX + " " + this.effectOffsetY + " " + effectOffset[this.effectName].isFlip);
        this.effect = new UnitEffect(scene, this, this.effectIsFlip, db.name);
        
        this.target = [];
        this.attackEvent;
        //this.setMotionSpeed();

        this.kills = 0;
        this.isTarget = false;

        this.setInteractive({ draggable: true });
        this.scene.physics.add.existing(this);
        this.setBodySize(64, 64, true);
        this.scene.add.existing(this);
        this.scene.events.on("update", this.update, this);
        this.on("animationcomplete", this.doIdle, this);
    }

    update() {
        this.rangeView.setX(this.x);
        this.rangeView.setY(this.y);
        this.buffRangeView.setX(this.x);
        this.buffRangeView.setY(this.y);
        this.effect.x = this.x + this.effectOffsetX;
        this.effect.y = this.y + this.effectOffsetY;
        this.checkMob();
        if (this.attackReady && this.target.length > 0)
            this.attackMob();     
    }

    doIdle()
    {
        this.play(this.idleAnim, true);
    }

    

    checkMob() {
        while (true) {
            try {
                this.target = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => item.gameObject.isTarget == true);
                this.target.sort((a, b) => {
                    if (a.gameObject.health == b.gameObject.health)
                        return a.gameObject.mobNum - b.gameObject.mobNum;
                    else
                        return a.gameObject.health - b.gameObject.health;
                });
            }
            catch (e) {
                continue;
            }
            finally { break; }
        }
        
    }

    syncGlobalBuff()
    {
        this.globalbuffAspd = Game.shopBuff.shopAspd;
        this.globalbuffedPenetration = Game.shopBuff.shopPenetration;
        this.globalbuffAtk = (Game.shopBuff.shopAtk + this.scene.tierBonus[this.tier - 1]) / 100;
    }
    
    //매 턴 시작시 전부 지우고 다시 전부 부여!!
    giveBuff() {
        var buffTargets = [];
        if (this.buffAspd != 0 || this.buffAtk != 0) {
            buffTargets = this.scene.physics.overlapCirc(this.x, this.y, this.buffRange).filter(item => item.gameObject.isBuffTarget == true);
            if (buffTargets.length == 0)
                return;
            buffTargets.forEach((e) => {
                e.gameObject.buffedAspd += this.buffAspd;
                e.gameObject.buffedAtk += this.buffAtk;
            });
        }
    }

    removeBuff()
    {
        this.buffedPenetration = 0;
        this.buffedAspd = 0;
        this.buffedAtk = 0;
    }


    updateBuff()
    {
        this.attack = (this.buffedAtk + this.globalbuffAtk + 1) * this.originAttack;
        this.aspd = ((100 + this.buffedAspd) / 100) * ((100 + this.globalbuffAspd)/100) * this.originAspd;
        this.penetration = this.originPenetration + this.globalbuffedPenetration;
        // this.setMotionSpeed();
    }

    // setMotionSpeed()
    // {
    //     this.attackConfig = this.scene.anims.get(this.attackAnim);
    //     this.attackConfig.frameRate *= this.aspd;
    // }

    attackMob()
    {   
        this.attackReady = false;
        this.atkSoundName.play({
            mute: false,
            volume: 0.2 * Game.gameVolume,
            rate: 1,
            loop: false
            });
        this.play(this.attackAnim, false);
        this.effect.playEffect();


        if (this.attackType == 0) {
            this.target.forEach(e => {
                e.gameObject.Health -= this.attack;
                if (e.gameObject.Health <= 0) {
                    this.kills++;
                }
            })
        }
        else if (this.attackType == 1) {
            // this.shootSound.play({
            // mute: false,
            // volume: 0.7,
            // rate: 1,
            // loop: false
            // });
            this.shootProjectile();
        }
        this.scene.time.delayedCall(1000 / this.aspd, () => {
            this.attackReady = true;
        }, [], this);
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

    remove() {
        this.scene.events.off("update", this.update, this);
        this.rangeView.destroy();
        this.scene.time.removeEvent(this.attackEvent);
        this.destroy();
    }
    
    calcDamage(mobDefence)
    {
        var defencePenValue = 1 - (mobDefence / 100) * (1 - this.penetration);
        return defencePenValue <= 0 ? 1 : this.attack * defencePenValue;
    }
}