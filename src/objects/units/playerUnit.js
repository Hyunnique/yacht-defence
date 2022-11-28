import Homing from '../projectiles/homing.js';
import Penetrate from '../projectiles/penetrate.js';
import Bomb from '../projectiles/bomb.js'
import UnitEffect from './unitEffect.js';
import effectOffset from '../../assets/specsheets/effectOffsetSheet.json';
import Game from "../../Game.js";
const Config = require("../../Config");
const Phaser = require("phaser");


export default class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, db, index,id,playerNum) {
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
        this.atkSoundName = this.scene.sound.get(db.atkSoundName);
        this.hitSoundName = this.scene.sound.get(db.hitSoundName);
        this.effectName = db.effectName;
        this.tier = db.tier;
        this.index = index;
        this.id = id;
        this.playerNum = playerNum;

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

        this.selfBuffAtk = 0;
        this.selfBuffAspd = 0;
        this.selfBuffPenetration = 0;

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

        this.skill;

        this.scale = 1;
        this.alpha = 1;

        this.effectOffsetX = effectOffset[this.effectName].x;
        this.effectOffsetY = effectOffset[this.effectName].y;
        this.effectIsFlip = effectOffset[this.effectName].isFlip == 1 ? true : false;
        // console.log(this.effectOffsetX + " " + this.effectOffsetY + " " + effectOffset[this.effectName].isFlip);
        this.effect = new UnitEffect(scene, this, this.effectIsFlip, db.name);
        this.attackCount = 1;
        
        if (this.playerNum != this.scene.currentView) {
            this.setVisible(false);
            this.effect.setVisible(false);
        }
        
        if (this.scene.skillDB["unit" + this.id] != null || this.scene.skillDB["unit" + this.id] != undefined) {
            this.skillInfo = this.scene.skillDB["unit" + this.id];
            this.skillReady = true;
            this.skillInfo.callerID = this.index;
            this.skillInfo.callerType = this.id;
        }
        
        this.target = [];
        //this.setMotionSpeed();

        this.kills = 0;
        this.isTarget = false;

        this.pipelineInstance = scene.plugins.get('rexOutlinePipeline').add(this, {
            thickness: 4,
            outlineColor: Game.tierColors[this.tier - 1],
            quality: 1
        });

        this.scene.physics.add.existing(this);
        this.setBodySize(64, 64, true);
        this.scene.add.existing(this);
        this.scene.events.on("update", this.update, this);
        this.on("animationcomplete", this.doIdle, this);
        this.scene.events.on("spectateChange", this.setVisibility, this);
    }

    update() {
        this.rangeView.setX(this.x);
        this.rangeView.setY(this.y);
        this.buffRangeView.setX(this.x);
        this.buffRangeView.setY(this.y);
        this.effect.x = this.x + this.effectOffsetX;
        this.effect.y = this.y + this.effectOffsetY;

        this.checkMob();
        if (this.skillReady && this.target.length > 0)
            this.doSkill();
        if (this.attackReady && this.target.length > 0)
            this.attackMob(); 
    }

    setVisibility() {
        if (this.playerNum == this.scene.currentView) {
            this.setVisible(true);
            this.effect.setVisible(true);
        }
        else {
            this.setVisible(false);
            this.effect.setVisible(false);
        }
    }

    doIdle()
    {
        this.play(this.idleAnim, true);
    }

    doSkill()
    {   
        if (this.skillInfo.skillType == "DOT")
        {
            this.skillReady = false;
            
            this.scene.time.delayedCall(1000 * this.skillInfo.coolDown, () => {
                this.skillReady = true;
            }, [], this);
        }
        else if (this.skillInfo.skillType == "statBuff")
        {
            this.skillReady = false;
            this.selfBuffAspd = this.skillInfo.buffAspd;
            this.selfBuffAtk =  this.skillInfo.buffAtk
            this.selfBuffPenetration = this.skillInfo.buffPenetration  / 100;
            this.updateBuff();
            this.scene.time.delayedCall(1000 * this.skillInfo.duration, () => {
                this.selfBuffAspd = this.skillInfo.debuffAspd;
                this.selfBuffAtk = this.skillInfo.debuffAtk;
                this.selfBuffPenetration = this.skillInfo.debuffPenetration / 100;
                this.updateBuff();
            }, [], this);
            this.scene.time.delayedCall(1000 * this.skillInfo.coolDown, () => {
                this.skillReady = true;
            }, [], this);
        }
    }
    

    checkMob() {
        while (true) {
            try {
                this.target = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => item.gameObject.isTarget == true);
                this.target.sort((a, b) => {
                    if (a.gameObject.Health == b.gameObject.Health)
                        return a.gameObject.mobNum - b.gameObject.mobNum;
                    else
                        return a.gameObject.Health - b.gameObject.Health;
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
        this.globalbuffedPenetration = Game.shopBuff.shopPenetration / 100;
        this.globalbuffAtk = (1 + Game.shopBuff.shopAtk / 100)*(1 + this.scene.tierBonus[this.tier - 1] / 100);
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

    syncGivenGlobalBuff(shopBuff,tierBuffs)
    {
        this.globalbuffAspd = shopBuff.shopAspd;
        this.globalbuffedPenetration = shopBuff.shopPenetration / 100;
        this.globalbuffAtk = (1 + shopBuff.shopAtk / 100)*(1 + tierBuffs[this.tier - 1] / 100);
    }

    updateBuff()
    {
        this.attack = (1 + this.buffedAtk / 100) * this.globalbuffAtk * this.originAttack * (1 + this.selfBuffAtk / 100);
        this.aspd = (1 + this.buffedAspd / 100) * (1 + this.globalbuffAspd / 100) * this.originAspd * (1 + this.selfBuffAspd/100);
        this.penetration = this.originPenetration + this.globalbuffedPenetration + this.selfBuffPenetration;
        if (this.penetration > 1) this.penetration = 1;
        else if (this.penetration < 0) this.penetration = 0;
        if (this.skillInfo && this.skillInfo.skillType == "statFix")
            this.statFixer();
    }

    statFixer() {
        var from = this.skillInfo.from;
        var fromVal = this.skillInfo.fromVal;
        var to = this.skillInfo.to;

        var overflow = 0;
        if (from == "atk") {
            overflow = this.attack - fromVal;
            this.attack = fromVal;
        }
        else if (from == "aspd") {
            overflow = this.aspd - fromVal;
            this.aspd = fromVal;
        }
        else if (from == "pen") {
            overflow = this.penetration - fromVal;
            this.penetration = fromVal;
        }

        if (overflow < 0)
            overflow = 0;
        overflow *= this.skillInfo.value;

        if (to == "atk") {
            this.selfBuffAtk = overflow;
        }
        else if (to == "aspd") {
            this.selfBuffAtk = overflow;
        }
            
        else if (to == "pen") {
            //자릿수 맞추기 필요
            //this.penetration += overflow;
        }
         
        if(from != "atk") this.attack = (1 + this.buffedAtk / 100) * this.globalbuffAtk * this.originAttack * (1 + this.selfBuffAtk / 100);
        if(from != "aspd")this.aspd = (1 + this.buffedAspd / 100) * (1 + this.globalbuffAspd / 100) * this.originAspd * (1 + this.selfBuffAspd/100);
        if(from != "pen") this.penetration = this.originPenetration + this.globalbuffedPenetration + this.selfBuffPenetration;
        
        if (this.penetration > 1) this.penetration = 1;
        else if (this.penetration < 0) this.penetration = 0;        
    }

    attackMob() {
        this.attackReady = false;
        if (this.playerNum == this.scene.currentView)
            this.atkSoundName.play(Game.effectSoundConfig);
        this.play(this.attackAnim, false);
        this.effect.playEffect();
     
        if (this.attackType == 0) {
            if (this.skillInfo != null && this.skillInfo.skillType == "attackCount" && this.attackCount % this.skillInfo.doEveryNth == 0) {
                this.target.forEach(e => {
                    if (e.gameObject.Health)
                        e.gameObject.Health -= this.calcDamage(this.attack + this.skillInfo.skillType == "cur" ?
                            (e.gameObject.Health * this.skillInfo.value) :
                            this.skillInfo.skillType == "lost" ?
                                (this.attack * (1 - e.Health / e.MaxHealth) * this.skillInfo.value) :
                                (this.attack * (this.skillInfo.value / 100)), e.gameObject.defence);
                });
            }
            else {
                this.target.forEach(e => {
                    if (e.gameObject.Health)
                        e.gameObject.Health -= this.calcDamage(this.attack, e.gameObject.defence);
                    if (this.skillInfo != null) {
                        if(this.skillInfo.skillType == "DOT")
                            e.gameObject.dotDamageFactoryMili(this);
                        if (this.skillInfo.skillType == "debuff")
                            e.gameObject.handleDebuff(this.skillInfo);
                     }
                });
            }
        }
        else if (this.attackType == 1) {
            if (this.skillInfo != null && ((this.skillInfo.skillType == "attackCount" && this.attackCount % this.skillInfo.doEveryNth == 0) || this.skillInfo.skillType == "DOT"))
            {
                this.shootProjectile(true);
            }
            else
                this.shootProjectile(false);
        }
        this.attackCount++;
        this.scene.time.delayedCall(1000 / this.aspd, () => {
            this.attackReady = true;
        }, [], this);
    }

    shootProjectile(bool)
    {   
        if (this.projectileType == 0)
            return new Homing(this.scene, this, bool ? this.skillInfo : null);
        else if (this.projectileType == 1)
            return new Penetrate(this.scene, this, bool ? this.skillInfo : null);
        else if (this.projectileType == 2)
            return new Bomb(this.scene, this, bool ? this.skillInfo : null);
    }

    remove() {
        this.scene.events.off("update", this.update, this);
        this.scene.events.off("spectateChange", this.setVisibility, this);
        this.rangeView.destroy();
        this.destroy();
    }
 
    calcDamage(damage,mobDefence)
    {
        var defencePenValue = 1 - (mobDefence / 100) * (1 - this.penetration);
        return defencePenValue <= 0 ? 1 : damage * defencePenValue;
    }
}