const Phaser = require("phaser");
import { pathA, pathB, pathC, pathD, pathBoss } from "../points/mobPath";

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,num) {
        super(scene, -5000, -5000, "bat");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.isTarget = true;
        this.Health = 300;
        this.scale = 2;
        this.m_speed = 60;
        this.mobNum = num;
        this.movePhase = 0;
        this.moveType = "D";

        this.deathSound = this.scene.sound.add("death");

        this.play("bat_anim");

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
    }

    death()
    {   
        this.deathSound.play({
            mute: false,
            volume: 0.7,
            rate: 1,
            loop: false
        });
        this.scene.events.emit("mobDeath", this.mobNum);
        this.tween.remove();
        this.destroy();
    }
    
    hit(projectile) {
        this.Health -= (projectile.attack * projectile.attackCount);
        if (this.Health <= 0) {
            this.death();
        }
        console.log(projectile);
        projectile.destroy();
    }
}