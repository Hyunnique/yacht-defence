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
        if (Phaser.Math.Distance.Between(this.x, this.y, this.shooter.x, this.shooter.y) > this.shooter.range)
            this.hit();
    }

    flytoMob(target) {
        if (target[0] != undefined) {
            this.setAngle(this, target[0]);
            console.log(target);
            this.scene.physics.moveTo(this, target[0].center.x, target[0].center.y, this.speed);
        }
        else {
            this.hit();
        }
    }

    setAngle(shooter,target) {
        const angleToMob = Phaser.Math.Angle.Between(
            shooter.x,
            shooter.y,
            target.x,
            target.y
        );
        this.rotation = angleToMob;
        this.body.setAngularVelocity(0);
    }

    hit()
    {   
        this.scene.events.off('update', this.update, this);
        this.setDepth(2);
        this.angle = 0;
        this.body.destroy();

        this.play(this.hitEffect);
        this.hitSoundName.play({
            mute: false,
            volume: 0.2 * Game.gameVolume,
            rate: 1,
            loop: false
        });
        var animConfig = this.scene.anims.get(this.hitEffect);
        var animtime = animConfig.frames.length * animConfig.msPerFrame;
        this.scene.time.delayedCall(animtime, () => { this.destroy() }, [], this.scene);
    }
}