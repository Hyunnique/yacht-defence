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

        //초기 능력치
        this.originAttack = db.attack;
        this.originAspd = db.aspd;
        this.originPenetration = db.penetration;
        this.range = db.range;
        this.buffRange = db.buffRange;
        this.attackType = db.attackType;
        
        //연산 결과
        this.attack = db.attack;
        this.aspd = db.aspd;
        this.penetration = db.penetration;

        //애니메이션/이펙트/사운드 네임 저장
        this.idleAnim = db.idleAnim;
        this.attackAnim = db.attackAnim;
        this.atkSoundName = this.scene.sound.get(db.atkSoundName);
        this.hitSoundName = this.scene.sound.get(db.hitSoundName);
        this.effectName = db.effectName;

        this.tier = db.tier;
        this.index = index;
        this.id = id;


        this.playerNum = playerNum;
        this.roundNum = 0;
        this.attackReady = true;
        this.play(this.idleAnim, true);
        
        this.rangeView = this.scene.add.circle(this.x, this.y, this.range, 0xFF0000);
        
        this.rangeView.setAlpha(0);

        this.buffRangeView = this.scene.add.circle(this.x, this.y, this.buffRange, 0x00FF00);
        this.buffRangeView.setAlpha(0);

        if (this.range > this.buffRange) {
            this.rangeView.setDepth(1);
            this.buffRangeView.setDepth(2);
        }
        else if (this.range < this.buffRange) {
            this.rangeView.setDepth(2);
            this.buffRangeView.setDepth(1);
        }
        else
            this.rangeView.setStrokeStyle(8, 0xFF0000);
        
        //버프량(지원형)
        this.buffAtk = db.buffAtk;
        this.buffAspd = db.buffAspd;
        

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

        this.scale = 1;
        this.alpha = 1;

        this.calcedAttack;

        this.effectOffsetX = effectOffset[this.effectName].x;
        this.effectOffsetY = effectOffset[this.effectName].y;
        this.effectIsFlip = effectOffset[this.effectName].isFlip == 1 ? true : false;
        this.effect = new UnitEffect(scene, this, this.effectIsFlip, db.name);
        this.attackCount = 1;
        
        //현재 보는 중이 아니라면 렌더링 하지 않기
        if (this.playerNum != this.scene.currentView) {
            this.setVisible(false);
            this.effect.setVisible(false);
        }
        
        //스킬정보 받아오기
        if (this.scene.skillDB["unit" + this.id]) {
            this.skillInfo = this.scene.skillDB["unit" + this.id];
            this.skillReady = true;
            this.skillInfo.callerID = this.index;
            this.skillInfo.callerType = this.id;
        }
        
        this.target = [];

        this.kills = 0;

        //티어 식별용 테두리
        this.pipelineInstance = scene.plugins.get('rexOutlinePipeline').add(this, {
            thickness: 4,
            outlineColor: Game.tierColors[this.tier - 1],
            quality: 1
        });

        this.scene.physics.add.existing(this);
        this.setBodySize(64, 64, true);
        this.scene.add.existing(this);

        this.scene.events.on("update", this.update, this);
        this.on("animationcomplete", () => this.play(this.idleAnim), this);
        this.scene.events.on("spectateChange", this.setVisibility, this);

        if (this.skillInfo != null && ((this.skillInfo.skillType == "attackCount" && this.attackCount % this.skillInfo.doEveryNth == 0) && this.skillInfo.ofHealth == "self"))
            this.scene.events.on("nextRound",this.roundChecker, this);
    }

    update() {
        if (this.scene.PhaseText == "Battle Phase") {
            this.checkMob();
            if (this.skillReady && this.target.length > 0)
                this.doSkill();
            if (this.attackReady && this.target.length > 0)
                this.attackMob();
        }
    }

    moveMiscs()
    {
        this.rangeView.setX(this.x);
        this.rangeView.setY(this.y);
        this.buffRangeView.setX(this.x);
        this.buffRangeView.setY(this.y);
        this.effect.x = this.x + this.effectOffsetX;
        this.effect.y = this.y + this.effectOffsetY;

    }

    roundChecker() {
        this.attack = this.calcedAttack;
        this.roundNum = this.scene.roundNum;
        this.attackCount = 1;
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

    doSkill()
    {   
        if (this.skillInfo.skillType == "statBuff")
        {
            this.skillReady = false;

            this.selfBuffAspd = this.skillInfo.buffAspd;
            this.selfBuffAtk = this.skillInfo.buffAtk;
            this.selfBuffPenetration = this.skillInfo.buffPenetration / 100;
            
            this.updateBuff();

            //지속 시간 후 초기화(혹은 디버프)
            this.scene.time.delayedCall(1000 * this.skillInfo.duration, () => {
                this.selfBuffAspd = this.skillInfo.debuffAspd;
                this.selfBuffAtk = this.skillInfo.debuffAtk;
                this.selfBuffPenetration = this.skillInfo.debuffPenetration / 100;
                this.updateBuff();
            }, [], this);

            //쿨타임 후 다시 준비
            this.scene.time.delayedCall(1000 * this.skillInfo.coolDown, () => {
                this.skillReady = true;
            }, [], this);
        }
        if (this.skillInfo.skillType == "cooldown") {
            console.log("skill Fire!!");
            this.skillReady = false;
            if (this.attackType == 0) {
                var damage = 0;
                this.target.forEach(e => {
                    if (e.gameObject.Health) {
                        damage = Game.calcDamage(this.attack + this.skillInfo.ofHealth == "cur" ?
                            (e.gameObject.Health * this.skillInfo.value) :
                            this.skillInfo.ofHealth == "lost" ?
                                (this.attack * (1 - e.Health / e.MaxHealth) * this.skillInfo.value) :
                                (this.attack * (this.skillInfo.value / 100)), e.gameObject.defence, this.penetration);
                        e.gameObject.Health -= damage * e.gameObject.totalDebuffVal;
                    }
                });
            }
            else if (this.attackType == 1)
                this.shootProjectile(true);
            
            this.scene.time.delayedCall(1000 * this.skillInfo.coolDown, () => {
                console.log("skill Ready!");
                this.skillReady = true;
            }, [], this);
        }
    }
    

    checkMob() {
        this.target = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => {
            if (item.gameObject) return item.gameObject.isTarget;
            else return false;
        }).sort((a, b) => {
            if (a.gameObject.Health == b.gameObject.Health)
                return a.gameObject.mobNum - b.gameObject.mobNum;
            else
                return a.gameObject.Health - b.gameObject.Health;
        });
        
    }

    syncGlobalBuff(shopBuff,tierBuff)
    {
        if (!shopBuff && !tierBuff) {
            this.globalbuffAspd = Game.shopBuff.shopAspd;
            this.globalbuffedPenetration = Game.shopBuff.shopPenetration / 100;
            this.globalbuffAtk = (1 + Game.shopBuff.shopAtk / 100) * (1 + this.scene.tierBonus[this.tier - 1] / 100);
        }
        else {
            this.globalbuffAspd = shopBuff.shopAspd;
            this.globalbuffedPenetration = shopBuff.shopPenetration / 100;
            this.globalbuffAtk = (1 + shopBuff.shopAtk / 100) * (1 + tierBuff[this.tier - 1] / 100);
        }
    }
    
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
        this.attack = (1 + this.buffedAtk / 100) * this.globalbuffAtk * this.originAttack * (1 + this.selfBuffAtk / 100);
        this.calcedAttack = this.attack;
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

        //설정 스탯 초과분 확인
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
            overflow *= 100;
        }

        if (overflow < 0)
            overflow = 0;
        
        overflow *= this.skillInfo.value;

        //전환 스탯 설정(자버프류)
        if (to == "atk") {
            this.selfBuffAtk = overflow;
        }
        else if (to == "aspd") {
            this.selfBuffAtk = overflow;
        }
            
        else if (to == "pen") {
            //자릿수 맞추기 필요(아마 사용하지 않을듯.)
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

            var damage = 0;
            this.target.forEach(e => {
                if (e.gameObject.Health) {
                    if (this.skillInfo && this.skillInfo.skillType == "attackCount" && this.attackCount % this.skillInfo.doEveryNth == 0)
                        damage = Game.calcDamage(this.attack + this.skillInfo.ofHealth == "cur" ?
                            (e.gameObject.Health * this.skillInfo.value) :
                            this.skillInfo.ofHealth == "lost" ?
                                (this.attack * (1 - e.gameObject.Health / e.gameObject.MaxHealth) * (this.skillInfo.value / 100)) :
                                (this.attack * (this.skillInfo.value / 100)), e.gameObject.defence, this.penetration);
                    else
                        damage = Game.calcDamage(this.attack, e.gameObject.defence,this.penetration);
                    
                    e.gameObject.Health -= damage * e.gameObject.totalDebuffVal;

                    if (this.skillInfo) {
                        if(this.skillInfo.skillType == "DOT")
                            e.gameObject.dotDamageFactory(this);
                        if (this.skillInfo.skillType == "debuff")
                            e.gameObject.handleDebuff(this);
                     }
                }
            });
        }

        //투사체 스킬의 경우 투사체에 스킬 정보를 전달해야 함.
        else if (this.attackType == 1)
            this.shootProjectile((this.skillInfo && ((this.skillInfo.skillType == "attackCount" && this.attackCount % this.skillInfo.doEveryNth == 0) || this.skillInfo.skillType == "DOT" || this.skillInfo.skillType == "debuff")));
        
        this.attackCount++;

        if (this.skillInfo && ((this.skillInfo.skillType == "attackCount" && this.attackCount % this.skillInfo.doEveryNth == 0) && this.skillInfo.ofHealth == "self")) {
            this.attack = this.calcedAttack + Math.floor((this.calcedAttack) * (this.skillInfo.value / 100) * (this.attackCount - 1));
        }

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
        if (this.skillInfo && ((this.skillInfo.skillType == "attackCount" && this.attackCount % this.skillInfo.doEveryNth == 0) && this.skillInfo.ofHealth == "self"))
            this.scene.events.off("nextRound",this.roundChecker, this);
        this.rangeView.destroy();
        this.destroy();
    }
 
}