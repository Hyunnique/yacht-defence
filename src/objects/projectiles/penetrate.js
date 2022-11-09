const Phaser = require("phaser");

export default class Penetrate extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        this.scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.attack = shooter.attack;
        this.speed = 1014;
        this.scale = 0.4;
        this.alpha = 1;
        this.targetidx = 0;
        this.setBodySize(28, 28);

        this.target = [];
        this.isTarget = false;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.scene.physics.world.enableBody(this);

        this.play(shooter.projectileAnimName);

        this.flyto = Phaser.Math.RotateTo(new Phaser.Math.Vector2, shooter.x, shooter.y, this.rotation, this.shooter.range);
        this.scene.physics.moveTo(this, flyto.x, flyto.y, this.speed);
        this.scene.events.on("update", this.update, this);
    }

    update()
    {
        if (Phaser.Math.Distance(this.x, this.y, this.shooter.x, this.shooter.y) >= this.shooter.range)
            this.destroy();
    }

    setAngle(shooter,target) {
        this.rotation = Phaser.Math.Angle.Between(
            shooter.x,
            shooter.y,
            target.x,
            target.y
        );
        this.body.setAngularVelocity(0);
    }

    hit()
    {
        this.attack *= 0.8;
    }
}