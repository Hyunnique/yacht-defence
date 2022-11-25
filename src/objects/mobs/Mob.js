const Phaser = require("phaser");
import { pathA, pathB, pathC, pathD, pathBoss } from "../points/mobPath";
import Game from "../../Game.js";

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, mobData,num,mobRoute,hpFactor) {
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
        this.damage = mobData.damage;
        this.mobNum = num;
        this.moveType = mobRoute;
        this.deathCalled = false;
        this.isBoss = mobData.boss;
        this.dotDamageDict = {};

        this.deathSound = this.scene.sound.add(mobData.deathSound);
        this.healthBar = this.scene.add.image(this.x-48, this.y - 24, "healthBar").setOrigin(0,0.5);
        this.play(mobData.mobAnim);
        this.flipX = !mobData.boss;

        switch (this.moveType) {
            case "A":
                this.path = pathA;
                break;
            case "B":
                this.path = pathB;
                break;
            case "C":
                this.path = pathC; 
                // this.m_speed /= 2;
                break;
            case "D":
                this.path = pathD;
                // this.m_speed /= 2;
                break;
            case "X":
                this.path = pathBoss;
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

        this.healthBarWidth = this.healthBar.displayWidth;
        // this.scene.tweens.add({
        //     targets: this.healthBar,
        //     displayWidth: this.healthBarWidth
        // });

        this.scene.events.on("update", this.update, this);
    }
    update()
    {   
        this.healthBar.setPosition(this.getCenter().x-48, this.getCenter().y - 24);
        this.healthBar.displayWidth = this.healthBarWidth * (this.Health / this.MaxHealth);

        if (this.Health <= 0 && !this.deathCalled) {
            this.death();
        }
        else if (Phaser.Math.Distance.Between(this.x, this.y, 2400, 720) < 1 && !this.deathCalled) {
            Game.hitPlayerBase(this.damage);
            this.deathCalled = true;
            this.death();
        }
    }

    death()
    {
        // this.deathSound.play(Game.effectSoundConfig);
        this.scene.events.off("update", this.update, this);
        this.scene.mobCounter--;
        Game.updateMobCounter();
        this.body.enable = false;

        this.healthBar.destroy();
        this.tween.remove();
        this.body.destroy();
        this.play(this.deathAnimName);

        var animConfig = this.scene.anims.get(this.deathAnimName);
        var animtime = animConfig.frames.length * animConfig.msPerFrame;
        this.scene.time.delayedCall(animtime, () => {
            this.scene.events.emit("mobAnimDone");
            this.destroy();
        }, [], this.scene);
    }
    
    hit(projectile) {
        if (projectile.shooter.projectileType == 1) {
            if (projectile.alreadyPenetrated.findIndex(e => e == this.mobNum) == -1) {
                projectile.alreadyPenetrated.push(this.mobNum);
                this.Health -= projectile.shooter.calcDamage(this.defence);
                projectile.hit();
            }
        }
        else if(projectile.shooter.projectileType == 2) {
            projectile.explode();
        }
        else {
            this.Health -= projectile.shooter.calcDamage(this.defence);
            projectile.hit();
        }
    }

    dotDamageFactory(dotDamageConfig) {
        if (this.dotDamageDict[dotDamageConfig.callerID] == undefined) {
            this.dotDamageDict[dotDamageConfig.callerID] = this.scene.time.addEvent({
                delay: dotDamage.delay,
                repeatCount: dotDamageConfig.duation * (1000 / dotDamage.delay),
                callback: () => this.Health -= dotDamageConfig.damage,
                startAt: 0
            });
        }
        else {
            this.scene.time.delayedCall(dotDamage.getRemaining(), () => {
                this.dotDamageDict[dotDamageConfig.callerID].reset(dotDamageConfig);
            }, [], this);
        }
    }
}