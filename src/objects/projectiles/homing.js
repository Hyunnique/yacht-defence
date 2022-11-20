const Phaser = require("phaser");

export default class Homing extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        this.scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.speed = 750;
        this.scale = 0.4;
        this.alpha = 1;
        this.targetidx = 0;
        this.setBodySize(28, 28);

        this.target = [];
        this.isTarget = false;
        this.needSearch = false;

        this.play(shooter.projectileName);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.scene.events.on("update", this.update, this);
        this.scene.events.on("mobDeath", this.deleteTarget, this);
    }

    update() {
        this.target = this.shooter.target;
        this.flytoMob(this.scene, this.target[this.targetidx]);   
    }

    deleteTarget(mobNum) {
        this.target.splice(this.target.findIndex(e => e.mobNum == mobNum), 1);
        if (this.target.length == 0)
            this.destroy();
    }

    findNextTarget()
    {
        if (this.needSearch) {
            this.targetidx++;
            this.needSearch = false;
        }
        else
            this.destroy();
    }

    flytoMob() {
        try {
            this.setAngle(this, this.target[this.targetidx]);
            this.scene.physics.moveToObject(this, this.target[this.targetidx], this.speed);
        } catch (e){
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
        this.body.setAngularVelocity(0);
    }

    hit()
    {
        this.destroy();
    }
}