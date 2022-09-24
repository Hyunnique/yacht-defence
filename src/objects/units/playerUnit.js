const Config = require("../../Config")
const Phaser = require("phaser");

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name) {
        super(scene, x, y, name);
        this.attack = 0;
        this.aspd = 2.5;
        this.scale = 0.4;
        this.alpha = 1;
        this.attackReady = true;
        this.attackAnim = "";
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    attackMob(scene,mob)
    {
        if (this.attackReady === false)
            return;
        console.log(this.attackAnim);

        var attackConfig = scene.anims.get(this.attackAnim);

        console.log(this.aspd);
        console.log(attackConfig.frameRate);

        this.play(attackConfig, false);
        scene.add.bitmapText(Config.width / 2, 150, "pixelFont", this.attack, 20).setOrigin(0.5);
        mob.Health -= this.attack;
        if (mob.Health <= 0)
        {
            mob.death();    
        }
        this.attackReady = false;

        this.scene.time.addEvent({
            delay: 1000 / this.aspd,
            callback: () => {
                this.attackReady = true;
            },
            loop: false
        });
    }
}