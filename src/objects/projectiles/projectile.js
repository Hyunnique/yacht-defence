const Config = require("../../Config");
const Phaser = require("phaser");

export default class Projectile extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter, target) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.attack = shooter.attack;
        this.speed = 250;
        this.scale = 0.4;
        this.alpha = 1;
        this.targetidx = 0;
        this.setBodySize(28,28);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        scene.physics.world.enableBody(this);

        this.play(shooter.projectileAnimName);

        scene.events.on("update", () => {
            try {
                this.flytoMob(scene,target[this.targetidx]);
            } catch (error) {
                this.findNextTarget(target, this.targetidx);    
            }
        });
        
    }

    findNextTarget(target,targetidx)
    {
        if (target.length == 0)
        {
            this.destroy();
            return;
        }
        while (target.length >= targetidx && target[targetidx].scene === undefined) {
            targetidx++;
        }
        
        return target[targetidx];
    }

    flytoMob(scene,target) {
        this.setAngle(this, target);
        scene.physics.moveToObject(this, target, this.speed);
    }

    setAngle(shooter,target) {
        const angleToMob = Phaser.Math.Angle.Between(
            shooter.x,
            shooter.y,
            target.x,
            target.y
        );
        this.rotation = angleToMob;
        this.body.setAngularVelocity(10);
    }
}