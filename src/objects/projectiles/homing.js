import Game from "../../Game";

const Phaser = require("phaser");

export default class Homing extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter,skillInfo) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        if (shooter.playerNum == 0)
            this.scene.m_projectiles.add(this);
        else
            this.scene.spectate_player_projectiles[shooter.playerNum].add(this);
        this.shooter = shooter;
        this.speed = 750;
        this.scale = 0.4;
        this.hitEffect = shooter.projectileHitEffect;
        this.isHit = false;
        this.hitSoundName = shooter.hitSoundName;
        this.setBodySize(28, 28);
        this.setDepth(1000001);

        this.target = [];
        this.isTarget = false;
        this.isBuffTarget = false;

        if(shooter.playerNum != this.scene.currentView)
            this.setVisible(false);
        
        this.skillInfo = skillInfo;
        if (skillInfo && skillInfo.skillType == "DOT")
            this.skillInfo.callerID = shooter.index;

        this.play(shooter.projectileName);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.scene.events.on("update", this.update, this);
        this.scene.events.on("spectateChange", this.setVisibility, this);
    }

    

    update() {  
        this.flytoMob(this.shooter.target);
    }

    setVisibility() {
        this.setVisible(this.shooter.playerNum == this.scene.currentView);
    }

    flytoMob(target) {
        if (target[0] != undefined) {
            this.setAngle(target[0]);
            try {
                this.scene.physics.moveTo(this, target[0].center.x, target[0].center.y, this.speed);    
            } catch (error) {
                this.hit();
            }            
        }
        else {
            this.hit();
        }
    }

    setAngle(target) {
        this.rotation = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            target.center.x,
            target.center.y
        );
        this.body.setAngularVelocity(0);
    }

    hit()
    {   
        this.scene.events.off('update', this.update, this);
        this.scene.events.off("spectateChange", this.setVisibility, this);
        this.rotation = 0;
        this.body.destroy();

        this.play(this.hitEffect);
        
        if(this.shooter.playerNum == this.scene.currentView)
            this.hitSoundName.play(Game.effectSoundConfig);
        
        var animConfig = this.scene.anims.get(this.hitEffect);
        var animtime = animConfig.frames.length * animConfig.msPerFrame;
        this.scene.time.delayedCall(animtime, () => { this.destroy() }, [], this.scene);
    }
}