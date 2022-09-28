const Config = require("../../Config");
const Phaser = require("phaser");

export default class Projectile extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter, target) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.attack = shooter.attack;
        this.speed = 200;
        this.scale = 0.4;
        this.alpha = 1;
        var bulletConfig = scene.textures.get(shooter.projectileName);
        this.setAngle(shooter,target);
        this.setBodySize(64, 64);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        scene.physics.world.enableBody(this);

        this.play(shooter.projectileAnimName);
        try {
            
            scene.physics.moveToObject(this, target, this.speed);    
        } catch (error) {
            this.destroy();
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
        this.body.rotation = this.rotation;
        this.body.setAngularVelocity(0);
    }
}