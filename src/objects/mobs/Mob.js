const Phaser = require("phaser");
import {
    pathA0,
    pathB0,
    pathC0,
    pathD0,
    pathBoss0,
    pathA1,
    pathB1,
    pathC1,
    pathD1,
    pathBoss1,
    pathA2,
    pathB2,
    pathC2,
    pathD2,
    pathBoss2,
    pathA3,
    pathB3,
    pathC3,
    pathD3,
    pathBoss3
} from "../points/mobPath";
import Game from "../../Game.js";

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, mobData,num,mobRoute,hpFactor,playerNum) {
        super(scene, -5000, -5000, mobData.mobAnim);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.isTarget = true;
        this.Health = mobData.health * hpFactor;
        this.MaxHealth = mobData.health * hpFactor;
        this.scale = mobData.scale;
        this.m_speed = mobData.m_speed;
        this.deathAnimName = mobData.deathAnimName;
        this.defence = mobData.defence;
        //this.damage = mobData.damage;
        this.mobNum = num;
        this.moveType = mobRoute + playerNum;
        this.deathCalled = false;
        this.isBoss = mobData.boss;
        this.dotDamageDict = {};
        this.playerNum = playerNum;
        

        this.deathSound = this.scene.sound.add(mobData.deathSound);
        
        this.play(mobData.mobAnim);
        this.flipX = !mobData.boss;

        
        if (!this.isBoss) {
            this.healthBar = this.scene.add.image(this.x-48, this.y - 24, "healthBar").setOrigin(0,0.5);
            this.healthBarWidth = this.healthBar.displayWidth;
            if (playerNum != 0)
                this.healthBar.setVisible(false);
        }
        else if (this.isBoss && this.playerNum == 0) {
            Game.showUI("bossArea");
            document.getElementsByClassName("ui-bossArea-bosshp-bar")[0].style.width = (this.Health / this.MaxHealth) * 100 + "%";
            document.getElementsByClassName("ui-bossArea-bosshp-text")[0].innerText = this.Health.toLocaleString() + "/" + this.MaxHealth.toLocaleString();
        }
        
        if (this.playerNum != 0) {
            this.setVisible(false);      
        }

        switch (this.moveType) {
            case "A0":
                this.path = pathA0;
                break;
            case "B0":
                this.path = pathB0;
                break;
            case "C0":
                this.path = pathC0; 
                break;
            case "D0":
                this.path = pathD0;
                break;
            case "X0":
                this.path = pathBoss0;
                this.flipX = false;
                break;
            case "A1":
                this.path = pathA1;
                break;
            case "B1":
                this.path = pathB1;
                break;
            case "C1":
                this.path = pathC1; 
                break;
            case "D1":
                this.path = pathD1;
                break;
            case "X1":
                this.path = pathBoss1;
                this.flipX = false;
                break;
            case "A2":
                this.path = pathA2;
                break;
            case "B2":
                this.path = pathB2;
                break;
            case "C2":
                this.path = pathC2; 
                break;
            case "D2":
                this.path = pathD2;
                break;
            case "X2":
                this.path = pathBoss2;
                this.flipX = false;
                break;
            case "A3":
                this.path = pathA3;
                break;
            case "B3":
                this.path = pathB3;
                break;
            case "C3":
                this.path = pathC3; 
                break;
            case "D3":
                this.path = pathD3;
                break;
            case "X3":
                this.path = pathBoss3;
                this.flipX = false;
                break;
            default:
                break;
        }
        
        this.pathFollower = scene.plugins.get('rexPathFollower').add(this, {
            path: this.path,
            rotateToPath: false,
            spacedPoints: false
        });

        this.tween = scene.tweens.add({
            targets: this.pathFollower,
            t: 1,
            ease: 'Linear',
            duration: this.m_speed * 1000,
            repeat: 0,
            yoyo: false
        });
        this.scene.events.on("update", this.update, this);
        this.scene.events.on("spectateChange", this.setVisibility, this);
    }
    update()
    {       
        if (!this.isBoss) {
            
            this.healthBar.setPosition(this.getCenter().x-48, this.getCenter().y - 24);
            this.healthBar.displayWidth = this.healthBarWidth * (this.Health / this.MaxHealth);
        }
        else {
            if (this.playerNum == this.scene.currentView) {
                if (this.Health <= 0) {
                    document.getElementsByClassName("ui-bossArea-bosshp-bar")[0].style.width =  "0%";
                    document.getElementsByClassName("ui-bossArea-bosshp-text")[0].innerText = "0";
                }
                else {
                    document.getElementsByClassName("ui-bossArea-bosshp-bar")[0].style.width =  (this.Health / this.MaxHealth) * 100  + "%";
                    document.getElementsByClassName("ui-bossArea-bosshp-text")[0].innerText = Math.floor(this.Health).toLocaleString() + "/" + this.MaxHealth.toLocaleString();
                }
            }
        }

        if (this.Health <= 0 && !this.deathCalled) {
            this.death();
        }
        else if (this.tween.progress == 1 && !this.deathCalled) {
            if(this.playerNum == 0) {
                let b_Damage = 2;

                if (this.isBoss) b_Damage = 20;
                else if (this.scene.roundNum <= 10) b_Damage = 2;
                else if (this.scene.roundNum <= 25) b_Damage = 3;
                else b_Damage = 4;

                Game.hitPlayerBase(b_Damage);
            }

            this.deathCalled = true;
            this.death();
        }
    }

    setVisibility()
    {
        if (this.playerNum == this.scene.currentView) {
            this.setVisible(true);
            if (this.healthBar)
                this.healthBar.setVisible(true);
        }
        else {
            this.setVisible(false);
            if (this.healthBar)
                this.healthBar.setVisible(false);
        }
    }

    death()
    {
        // this.deathSound.play(Game.effectSoundConfig);
        this.scene.events.off("update", this.update, this);
        this.scene.events.off("spectateChange", this.setVisibility, this);
        if (this.playerNum == 0) {
            this.scene.mobCounter--;
            Game.updateMobCounter();
        }
        this.body.enable = false;

        if (!this.isBoss) this.healthBar.destroy();

        this.tween.remove();
        this.body.destroy();
        this.play(this.deathAnimName);
        if (this.playerNum == 0) {
            var animConfig = this.scene.anims.get(this.deathAnimName);
            var animtime = animConfig.frames.length * animConfig.msPerFrame;
            this.scene.time.delayedCall(animtime, () => {
                this.scene.events.emit("mobAnimDone");
                this.destroy();
            }, [], this.scene);
        }
        else {
            this.destroy();
        }
    }
    
    hit(projectile) {
        if (projectile.shooter.projectileType == 1) {
            if (projectile.alreadyPenetrated.findIndex(e => e == this.mobNum) == -1) {
                projectile.alreadyPenetrated.push(this.mobNum);
                if (projectile.skillInfo != null)
                    this.Health -= projectile.shooter.calcDamage(projectile.shooter.attack + (projectile.skillInfo.ofHealth == "cur" ? this.Health : this.MaxHealth) * (projectile.skillInfo.value / 100), this.defence);
                else
                    this.Health -= projectile.shooter.calcDamage(projectile.shooter.attack, this.defence);
                projectile.hit();
            }
        }
        else if(projectile.shooter.projectileType == 2) {
            projectile.explode();
        }
        else {
            if (projectile.skillInfo != null)
                this.Health -= projectile.shooter.calcDamage(projectile.shooter.attack + (projectile.skillInfo.ofHealth == "cur" ? this.Health : this.MaxHealth) * (projectile.skillInfo.value / 100), this.defence);
            else
                this.Health -= projectile.shooter.calcDamage(projectile.shooter.attack,this.defence);
            projectile.hit();
        }
    }

    dotDamageFactory(projectile,dotDamageConfig) {
        if (this.dotDamageDict[dotDamageConfig.callerID] == undefined) {
            var damage = dotDamageConfig.ofHealth == "cur" ? projectile.shooter.attack + (this.Health * dotDamageConfig.value) : dotDamageConfig.ofHealth == "max" ? projectile.shooter.attack + (this.MaxHealth * dotDamageConfig.value) : dotDamageConfig.damage;
            this.dotDamageDict[dotDamageConfig.callerID] = this.scene.time.addEvent({
                delay: dotDamageConfig.delay * 1000,
                repeat: dotDamageConfig.duration / dotDamageConfig.delay,
                callback: () => {
                    this.Health -= dotDamageConfig.ofHealth == "fix" ? damage : projectile.shooter.calcDamage(damage, this.defence);
                },
                startAt: 0
            });
        }
        else {
            this.dotDamageDict[dotDamageConfig.callerID].addEvent(this.dotDamageDict[dotDamageConfig.callerID]);
        }
    }
}