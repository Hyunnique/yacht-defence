const Phaser = require("phaser");
import { pathA, pathB, pathC, pathD, pathBoss } from "../points/mobPath";

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, mobData,num,mobRoute) {
        super(scene, -5000, -5000, mobData.mobAnim);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.isTarget = true;
        this.Health = mobData.Health;
        this.MaxHealth = mobData.Health;
        this.scale = mobData.scale;
        this.m_speed = mobData.m_speed;
        this.mobNum = num;
        this.moveType = mobRoute;

        this.deathSound = this.scene.sound.add(mobData.deathSound);
        this.healthBar = this.scene.add.image(this.x-48, this.y - 24, "healthBar").setOrigin(0,0.5);
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
        this.healthBar.setPosition(this.getCenter().x-48, this.getCenter().y - 24);
        const width = this.healthBar.displayWidth * (this.Health / this.MaxHealth);
        this.scene.tweens.add({
            targets: this.healthBar,
            displayWidth: width,
            ease: Phaser.Math.Easing.Sine.Out
        });

        if (this.Health <= 0)
            this.death();
        
        if (Phaser.Math.Distance.Between(this.x, this.y, 2400, 720) < 4) {
            this.scene.playerHealth--;
            this.death();
        }
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
        this.healthBar.destroy();
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
            projectile.explode();
        }
        else {
            this.Health -= projectile.attack;
            projectile.hit();
        }
    }
}