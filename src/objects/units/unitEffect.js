const Config = require("../../Config");
const Phaser = require("phaser");

export default class UnitEffect extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, attacker, isFlip, name) {
        super(scene, attacker.centerX, attacker.centerY, attacker.effectName);
        this.attacker = attacker;
        scene.add.existing(this);
        this.alpha = 0;
        this.flipX = isFlip;
        this.depth = 1;
        this.scene = scene;
        
        if (name == "타이사마") this.scale = 3
    }

    playEffect()
    {
        this.alpha = 1;
        this.play(this.attacker.effectName);
    }
}