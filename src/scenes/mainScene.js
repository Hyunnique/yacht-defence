const Phaser = require('phaser');
const Config = require("../Config");

export default class MainScene extends Phaser.Scene{
    constructor() {
        super("mainScene");
    }

    create() {

        var bg = this.add.graphics();
        bg.fillStyle(0x000000,1);
        bg.fillRect(32, 32, 300, 200);
        //bg.setScrollFactor(0);
        bg.setDepth(50);
        console.log("success?");

        this.add.bitmapText(Config.width / 2, 150, "pixelFont", "MainScene", 20).setOrigin(0.5);
        
        this.add.sprite(Config.width / 2, Config.height / 2, "testwait");
        
        this.add.text(Config.width / 2, Config.height / 2, "Press W", {
            fontSize: `20px`
        });
        this.input.keyboard.on("keydown-W", () => this.scene.start("gameScene"));
    }

    update() {
        
    }
}