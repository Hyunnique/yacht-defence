const Config = require("../../Config");
const Phaser = require("phaser");

export default class UnitEffect extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, effectName) {
        super(scene, x, y, effectName);
    }

    playEffect() {
        this.play(effectName);
    }
}