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
        this.scale = 0.4;
        this.alpha = 1;
        this.targetidx = 0;
        this.hitSoundName = shooter.hitSoundName;
        this.setBodySize(shooter.projectileWidth, shooter.projectileHeight);
        
        this.alreadyPenetrated = [];

        this.target = shooter.target;
        this.isTarget = false;
        this.isBuffTarget = false;

        this.offsetX = this.scene.mapOffsetX * (shooter.playerNum % 2);
        this.offsetY = this.scene.mapOffsetY * Math.floor(shooter.playerNum / 2);
        
        this.skillInfo = skillInfo;

        if (skillInfo != null && skillInfo.skillType == "DOT") {
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
            this.setAngle(this, this.target[0].x, this.target[0].y);
        }
        catch(e) {
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
        if (this.shooter.playerNum == this.scene.currentView)
            this.setVisible(true);
        else
            this.setVisible(false);
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
        this.hitSoundName.play(Game.effectSoundConfig);
        this.attack *= 0.9;
    }
}