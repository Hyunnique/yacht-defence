const Config = require("../../Config");
const Phaser = require("phaser");

export default class UnitEffect extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, attacker) {
        super(scene, attacker.x, attacker.y, attacker.effectName);
    }
}