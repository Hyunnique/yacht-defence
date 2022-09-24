const Phaser = require('phaser');
const Config = require("../Config");

export default class MainScene extends Phaser.Scene{
    constructor() {
        super("mainScene");
    }

    create() {

        this.add.text(Config.width / 2, Config.height / 2, "Press W", {
            fontSize: `20px`,
            color: 0xFFFFFF
        });
        this.input.keyboard.on("keydown-W", () => this.scene.start("gameScene"));
    }

    update() {
        
    }
}