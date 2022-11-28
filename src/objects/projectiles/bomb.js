import Game from "../../Game";

const Phaser = require("phaser");

export default class Bomb extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter, skillInfo) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);

        if (shooter.playerNum == 0)
            this.scene.m_projectiles.add(this);
        else
            this.scene.spectate_player_projectiles[shooter.playerNum].add(this);
        
        this.shooter = shooter;
        this.speed = shooter.projectileSpeed;
        this.scale = 0.4;
        this.setBodySize(this.width/2, this.height/2);
        this.setDepth(2);
        this.hitEffect = shooter.projectileHitEffect;
        this.explodeRange = shooter.explodeRange;
        this.explodeScale = shooter.explodeScale;
        this.hitSoundName = shooter.hitSoundName; 
        this.setDepth(1000001);

        this.skillInfo = skillInfo;
        
        if (skillInfo != null && skillInfo.skillType == "DOT") {

            this.skillInfo.callerID = shooter.index;
        }
        this.isTarget = false;
        this.isBuffTarget = false;

        if(shooter.playerNum != this.scene.currentView)
            this.setVisible(false);

        try {
            this.target = new Phaser.Math.Vector2(this.shooter.target[0].gameObject.getCenter());    
        } catch (error) {
            this.explode();
        }
        
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        this.play(shooter.projectileName);
        try {
            this.setAngle(this, this.target);
            this.scene.physics.moveTo(this, this.target.x, this.target.y, this.speed);
        }
        catch {
            this.explode();
        }
        
        this.scene.events.on("update", this.update, this);
        this.scene.events.on("spectateChange", this.setVisibility, this);
    }

    update()
    {        
        try {
            if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 20 || Phaser.Math.Distance.Between(this.x, this.y, this.shooter.x, this.shooter.y) > this.shooter.range)
                this.explode();
        }
        catch (e) {
            this.explode();
        }
    }

    setVisibility()
    {
        if (this.shooter.playerNum == this.scene.currentView)
            this.setVisible(true);
        else
            this.setVisible(false);
    }

    explode() {
        var targets = this.scene.physics.overlapCirc(this.x, this.y, this.explodeRange).filter(item => {
            if (item.gameObject) return item.gameObject.isTarget;
            else return false;
        });
        for (var i = 0; i < targets.length; i++)
        {
            try {
                if (this.skillInfo != null) {
                    if (this.skillInfo.skillType == "DOT") {
                        targets[i].gameObject.dotDamageFactory(this);
                    }
                    else if (this.skillInfo.skillType == "attackCount")
                        targets[i].gameObject.Health -= this.shooter.calcDamage(this.shooter.attack * (1 + this.skillInfo.value / 100), targets[i].gameObject.defence);
                    else if (this.skillInfo.skillType == "debuff") {
                        targets[i].gameObject.handleDebuff(this.shooter.id, this.skillInfo.value);
                        
                    }
                }
                targets[i].gameObject.Health -= this.shooter.calcDamage(this.shooter.attack, targets[i].gameObject.defence) * (1 + targets[i].gameObject.totalDebuffVal / 100);
            }
            catch(e) {
                continue;
            }
        }
        this.scene.events.off("update", this.update, this);
        this.scene.events.off("spectateChange", this.setVisibility, this);

        this.rotation = 0;
        this.body.destroy();

        this.scale = this.explodeScale;
        this.play(this.hitEffect);
        
        if(this.shooter.playerNum == this.scene.currentView)
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