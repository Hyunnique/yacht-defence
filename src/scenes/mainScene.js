const Phaser = require('phaser');
import Game from "../Game";
const Config = require("../Config");

export default class MainScene extends Phaser.Scene{
    constructor() {
        super("mainScene");
    }
    
    preload() {
        this.load.image("mainBackground", require("../assets/images/main_background.png"));
    }


    create() {
        // var text = this.add.text(Config.width / 2, Config.height / 2, "Press W");
        //this.input.keyboard.on("keydown-W", () => Game.showScene("gameScene"));
        this.background = this.add.tileSprite(960, 480, 1920, 960, "mainBackground");
    }

    update() {
        this.background.tilePositionX += 0.3;
    }
}
