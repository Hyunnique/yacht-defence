const Config = require("../../Config");
const Phaser = require("phaser");

export default class UnitEffect extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, attacker) {
        super(scene, attacker.centerX, attacker.centerY, attacker.effectName);
        this.attacker = attacker;
        scene.add.existing(this);
        this.alpha = 0;
        this.flipX = true;
        this.depth = 1;
    }

    playEffect()
    {
        this.alpha = 1;
        this.play(this.attacker.effectName);
    }
}