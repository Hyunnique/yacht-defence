const Config = require("../../Config");
const Phaser = require("phaser");

export default class UnitEffect extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, attacker) {
        super(scene, attacker.x, attacker.y, attacker.effectName);
        this.attacker = attacker;
        scene.add.existing(this);
        this.alpha = 0;
    }

    playEffect()
    {
        console.log(this);
        this.alpha = 1;
        this.play(this.attacker.effectName);
    }
}