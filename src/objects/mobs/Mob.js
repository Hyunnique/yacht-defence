const Phaser = require("phaser");
import { pathA, pathB, pathBoss } from "../points/mobPath";

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,num) {
        super(scene, -5000, -5000, "bat");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.isTarget = true;
        this.isBoss = false;
        this.Health = 300;
        this.scale = 2;
        this.m_speed = 60;
        this.mobNum = num;
        this.movePhase = 0;
        this.moveType = "B";
        this.play("bat_anim");

        this.path = this.isBoss ? pathBoss : (this.moveType == "A" ? pathA : pathB);
        
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
        this.scene.events.emit("mobDeath", this.mobNum);
        this.tween.remove();
        this.destroy();
    }

    showDamage(scene, attack, attackCount) {
        for (var i = 0; i < attackCount; i++) {
            var text = scene.add.text(this.body.x, this.body.y - 20 - (50*i), attack, {
                fontFamily: 'consolas',
                fontSize: '50px',
                color: '#F00'
            });
            var dmgPath = new Phaser.Curves.Path(this.body.x, this.body.y - 20 - (50 * i)).lineTo(this.body.x, this.body.y - 120 - (50 * i));
            var dmgTextFollower = this.scene.plugins.get('rexPathFollower').add(text, {
                path: dmgPath,
                rotateToPath: false,
                spacedPoints: false
            })
            
            text.tween = text.scene.tweens.add({
                targets: dmgTextFollower,
                t: 1,
                yoyo: false,
                duration: 2000,
                ease: Phaser.Math.Easing.Sine.Out,
                repeat: 1,
                onComplete: () => {
                    text.tween.remove();
                    text.destroy();
                }
            });
        }
    }
    
    bullseye(projectile) {
        this.Health -= (projectile.attack * projectile.attackCount);
        this.showDamage(this.scene, projectile.attack,projectile.attackCount);
        if (this.Health <= 0) {
            this.death();
        }
        console.log(projectile);
        projectile.destroy();
    }

    checkPhase() {
        if (!this.isBoss) {
            if (this.x ==  this.points.firstPointA.x && this.y ==  this.points.firstPointA.y)
                this.movePhase = this.moveType == "A" ? 1 : 2;
            else if (this.x ==  this.points.firstPointB.x && this.y ==  this.points.firstPointB.y)
                this.movePhase = this.moveType == "A" ? 2 : 1;
            else if ((this.x ==  this.points.secondPointA.x && this.y ==  this.points.secondPointA.y) || (this.x ==  this.points.secondPointB.x && this.y ==  this.points.secondPointB.y))
                this.movePhase = 3;
            else if (this.x ==  this.points.secondJunction.x && this.y ==  this.points.secondJunction.y)
                this.movePhase = 4;
        }
    }
}