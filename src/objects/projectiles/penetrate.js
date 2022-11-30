import Game from "../../Game";

const Phaser = require("phaser");

export default class Penetrate extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, shooter,skillInfo) {
        super(scene, shooter.x, shooter.y, shooter.projectileName);
        if (shooter.playerNum == 0)
            this.scene.m_projectiles.add(this);
        else
            this.scene.spectate_player_projectiles[shooter.playerNum].add(this);

        this.shooter = shooter;
        this.speed = 1200;
        this.scale = 0.55;
        this.alpha = 1;
        this.targetidx = 0;
        this.hitSoundName = shooter.hitSoundName;
        this.setBodySize(this.width, this.height);
        
        this.alreadyPenetrated = [];
        this.setDepth(1000001);

        this.target = shooter.target;
        this.isTarget = false;
        this.isBuffTarget = false;

        this.offsetX = 2400 * (shooter.playerNum % 2);
        this.offsetY = 1536 * Math.floor(shooter.playerNum / 2);

        this.skillInfo = skillInfo;

        if (skillInfo && skillInfo.skillType == "DOT") {
            this.skillInfo.callerID = shooter.index;
        }
        else
            this.skillInfo = skillInfo;
        this.play(shooter.projectileName);
        
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);    
        
        if(shooter.playerNum != this.scene.currentView)
            this.setVisible(false);
        
        this.flyto = new Phaser.Math.Vector2();
        
        try {
            this.setAngle(this, this.target[0].gameObject.getCenter().x, this.target[0].gameObject.getCenter().y);
        }
        catch (e) {
            this.destroy();
        }

        Phaser.Math.RotateTo(this.flyto, this.x, this.y, this.rotation, this.shooter.range);
        this.scene.physics.moveTo(this, this.flyto.x, this.flyto.y, this.speed);
        this.scene.events.on("update", this.update, this);
        this.scene.events.on("spectateChange", this.setVisibility, this);
    }

    update()
    {   
        if (this.x >= (this.offsetX + 2400) || this.x <= this.offsetX || this.y >= (this.offsetY + 1536) || this.y <= this.offsetY) {
            this.scene.events.off("update", this.update, this);
            this.scene.events.off("spectateChange", this.setVisibility, this);
            this.destroy();
        }
    }

    setVisibility() {
        this.setVisible(this.shooter.playerNum == this.scene.currentView);
    }

    setAngle(shooter,x,y) {
        this.rotation = Phaser.Math.Angle.Between(
            shooter.x,
            shooter.y,
            x,
            y
        );
        this.body.setAngularVelocity(0);
    }

    hit()
    {
        if (this.shooter.playerNum == this.scene.currentView)
            this.hitSoundName.play(Game.effectSoundConfig);
        this.attack *= 0.9;
    }
}