import Game from "../../Game";

const Phaser = require("phaser");

export default class Homing extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        this.scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.speed = 750;
        this.scale = 0.4;
        this.hitEffect = shooter.projectileHitEffect;
        this.isHit = false;
        this.hitSoundName = shooter.hitSoundName;
        this.setBodySize(28, 28);

        this.target = [];
        this.isTarget = false;

        this.play(shooter.projectileName);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.scene.events.on("update", this.update, this);
    }

    update() {
        this.flytoMob(this.shooter.target);
    }

    flytoMob(target) {
        if (target[0] != undefined) {
            this.setAngle(target[0]);
            try {
                this.scene.physics.moveTo(this, target[0].center.x, target[0].center.y, this.speed);    
            } catch (error) {
                this.hit();
            }            
        }
        else {
            this.hit();
        }
    }

    setAngle(target) {
        this.rotation = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            target.center.x,
            target.center.y
        );
        this.body.setAngularVelocity(0);
    }

    hit()
    {   
        this.scene.events.off('update', this.update, this);
        this.setDepth(2);
        this.rotation = 0;
        this.body.destroy();

        this.play(this.hitEffect);
        this.hitSoundName.play(Game.effectSoundConfig);
        var animConfig = this.scene.anims.get(this.hitEffect);
        var animtime = animConfig.frames.length * animConfig.msPerFrame;
        this.scene.time.delayedCall(animtime, () => { this.destroy() }, [], this.scene);
    }
}