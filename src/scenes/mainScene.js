const Phaser = require('phaser');
import Game from "../Game";
const Config = require("../Config");

export default class MainScene extends Phaser.Scene{
    constructor() {
        super("mainScene");
    }

    create() {

        var text = this.add.text(Config.width / 2, Config.height / 2, "Press W");
        this.input.keyboard.on("keydown-W", () => Game.showScene("gameScene"));
    }

    update() {
        
    }
}