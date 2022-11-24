import Game from "../../Game";

const Phaser = require("phaser");

export default class Penetrate extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        this.scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.speed = 1200;
        this.scale = 0.4;
        this.alpha = 1;
        this.targetidx = 0;
        this.hitSoundName = shooter.hitSoundName;
        this.setBodySize(shooter.projectileWidth, shooter.projectileHeight);
        
        this.alreadyPenetrated = [];

        
        this.target = shooter.target;
        this.isTarget = false;

        this.play(shooter.projectileName);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);      

        this.flyto = new Phaser.Math.Vector2();

        this.setAngle(this, this.target[0].gameObject.getCenter());

        Phaser.Math.RotateTo(this.flyto, this.x, this.y, this.rotation, this.shooter.range);
        this.scene.physics.moveTo(this, this.flyto.x, this.flyto.y, this.speed);
        this.scene.events.on("update", this.update, this);
    }

    update()
    {
        if (Phaser.Math.Distance.Between(this.x, this.y, this.shooter.x, this.shooter.y) >= this.shooter.range)
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
        this.hitSoundName.play({
            mute: false,
            volume: 0.2 * Game.gameVolume,
            rate: 1,
            loop: false
        });
        this.attack *= 0.9;
    }
}