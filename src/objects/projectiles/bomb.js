const Phaser = require("phaser");

export default class Bomb extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        this.scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.speed = 250;
        this.scale = 0.4;
        this.alpha = 1;
        this.targetidx = 0;
        this.setBodySize(28, 28);

        this.target = new Phaser.Math.Vector2(this.shooter.target[0].gameObject.getCenter());
        this.isTarget = false;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.scene.physics.world.enableBody(this);

        this.play(shooter.projectileAnimName);

        this.setAngle(this, this.target);
        this.scene.physics.moveTo(this, this.target.x, this.target.y, this.speed);
        this.scene.events.on("update", this.update, this);
    }

    update()
    {
        if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 4)
            this.explode();
        
    }

    explode()
    {
        var targets = this.scene.physics.overlapCirc(this.x, this.y, 80).filter(item => item.gameObject.isTarget == true);
            targets.forEach(element => {
                element.gameObject.Health -= projectile.shooter.calcDamage(element.gameObject.defence);
                if (element.gameObject.Health <= 0)
                    this.shooter.kills++;
            });
        this.scene.events.off("update", this.update, this);
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
        this.explode();
    }
}