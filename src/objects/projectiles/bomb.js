import Game from "../../Game";

const Phaser = require("phaser");

export default class Bomb extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        this.scene.m_projectiles.add(this);
        this.shooter = shooter;
        this.speed = shooter.projectileSpeed;
        this.scale = 0.4;
        this.alpha = 1;
        this.targetidx = 0;
        this.setBodySize(this.width/2, this.height/2);
        this.setDepth(2);
        this.hitEffect = shooter.projectileHitEffect;
        this.explodeRange = shooter.explodeRange;
        this.explodeScale = shooter.explodeScale;
        this.hitSoundName = shooter.hitSoundName;  
        this.isTarget = false;

        try {
            this.target = new Phaser.Math.Vector2(this.shooter.target[0].gameObject.getCenter());    
        } catch (error) {
            this.explode();
        }
        
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.scene.physics.world.enableBody(this);

        this.play(shooter.projectileName);

        this.setAngle(this, this.target);
        this.scene.physics.moveTo(this, this.target.x, this.target.y, this.speed);
        this.scene.events.on("update", this.update, this);
        
        
    }

    update()
    {
        var distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (distance < 20 || distance > this.shooter.range)
            this.explode();        
    }

    explode() {
        var targets = this.scene.physics.overlapCirc(this.x, this.y, this.explodeRange).filter(item => {
            if (item.gameObject) return item.gameObject.isTarget;
            else return false;
        });
        for (var i = 0; i < targets.length; i++)
        {
            try {
                targets[i].gameObject.Health -= this.shooter.calcDamage(targets[i].gameObject.defence);
                // if (element.gameObject.Health <= 0)
                //     this.shooter.kills++;
            }
            catch(e) {
                continue;
            }
        }
        this.scene.events.off("update", this.update, this);

        this.body.reset(this.x, this.y);
        this.rotation = 0;
        this.body.destroy();

        this.scale = this.explodeScale;
        this.play(this.hitEffect);
        this.hitSoundName.play(Game.effectSoundConfig);
        
        var animConfig = this.scene.anims.get(this.hitEffect);
        var animtime = animConfig.frames.length * animConfig.msPerFrame;
        this.scene.time.delayedCall(animtime, () => { this.destroy() }, [], this.scene);
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
        this.destroy();
    }
    
}