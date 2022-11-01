const Phaser = require("phaser");
import { pathA, pathB, pathBoss } from "../points/mobPath";

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,num) {
        super(scene, 50, 50, "bat");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isBoss = false;
        this.Health = 300;
        this.scale = 2;
        this.m_speed = 40;
        this.mobNum = num;
        this.movePhase = 0;
        this.moveType = "B";
        this.play("bat_anim");
        console.log(this);

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

    death(scene)
    {
        this.tween.remove();
        this.destroy();
    }

    showDamage(scene,attack) {
        var text = scene.add.text(this.body.x, this.body.y - 20, attack, {
            fontFamily: 'consolas',
            fontSize: '50px',
            color: '#F00'
        });
        scene.physics.world.enable(text);
        text.body.setAccelerationY(-100);
            
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                text.destroy();
            },
            loop: false
        });
    }
    
    bullseye(scene, projectile) {
        this.Health -= projectile.attack;
        this.showDamage(scene, projectile.attack);
        projectile.destroy();
        if (this.Health <= 0) {
            projectile.shooter.target.splice(projectile.shooter.target.findIndex(t => t.mobNum === this.mobNum), 1);
            this.death(scene);
        }
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