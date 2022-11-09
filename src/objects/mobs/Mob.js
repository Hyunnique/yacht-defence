const Phaser = require("phaser");
import { pathA, pathB, pathC, pathD, pathBoss } from "../points/mobPath";

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, mobData,num) {
        super(scene, -5000, -5000, mobData.mobAnim);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.isTarget = true;
        this.Health = mobData.Health;
        this.scale = mobData.scale;
        this.m_speed = mobData.m_speed;
        this.mobNum = num;
        this.moveType = mobData.moveType;

        this.deathSound = this.scene.sound.add(mobData.deathSound);

        this.play(mobData.mobAnim);

        switch (this.moveType) {
            case "A":
                this.path = pathA;
                break;
            case "B":
                this.path = pathB;
                break;
            case "C":
                this.path = pathC;
                break;
            case "D":
                this.path = pathD;
                break;
            case "X":
                this.path = pathBoss;
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
    }
    update()
    {
        if (this.Health <= 0)
            this.death();
    }

    death()
    {   
        this.deathSound.play({
            mute: false,
            volume: 0.7,
            rate: 1,
            loop: false
        });
        this.scene.events.off("update", this.update, this);
        this.scene.events.emit("mobDeath", this.mobNum);
        this.tween.remove();
        this.destroy();
    }
    
    hit(projectile) {
        if (projectile.shooter.projectileType == 1) {
            if (projectile.alreadyPenetrated.findIndex(e => e == this.mobNum) == -1) {
                projectile.alreadyPenetrated.push(this.mobNum);
                this.Health -= projectile.attack;
                projectile.hit();
            }
        }
        else if(projectile.shooter.projectileType == 2) {
            //projectile.explode();
        }
        else {
            this.Health -= projectile.attack;
            projectile.hit();
        }
    }
}