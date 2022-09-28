const Config = require("../../Config");
const Phaser = require("phaser");

export default class Projectile extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter, target) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.attack = shooter.attack;
        this.speed = 98;
        this.scale = 0.4;
        this.alpha = 1;
        var bulletConfig = scene.textures.get(shooter.projectileName);
        
        this.setBodySize(28,28);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        scene.physics.world.enableBody(this);

        this.play(shooter.projectileAnimName);

        scene.events.on("update", (time, delta) => {
            try {
                this.setAngle(this, target);
                scene.physics.moveToObject(this, scene.mobPos(target.mobNum), this.speed);
            } catch (error) {
                this.destroy();
            }
        });
        
    }

    setAngle(shooter,target) {
        const angleToMob = Phaser.Math.Angle.Between(
            shooter.x,
            shooter.y,
            target.x,
            target.y
        );
        this.rotation = angleToMob;
        this.body.rotation = this.rotation;
        this.body.setAngularVelocity(0);
    }
}