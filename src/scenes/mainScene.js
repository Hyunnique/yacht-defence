const Phaser = require('phaser');
import Game from "../Game";
const Config = require("../Config");

export default class MainScene extends Phaser.Scene{
    constructor() {
        super("mainScene");
    }
    
    preload() {
        this.load.audio("lobbyMusic", require("../assets/sounds/lobby.mp3"));
        this.load.image("mainBackground", require("../assets/images/main_background.png"));
    }


    create() {
        // var text = this.add.text(Config.width / 2, Config.height / 2, "Press W");
        this.background = this.add.tileSprite(960, 480, 1920, 960, "mainBackground");

        this.sound.pauseOnBlur = false;
        this.lobbyMusic = this.sound.add("lobbyMusic");
        this.lobbyMusic.play(Game.bgmSoundConfig);
    }

    update() {
        this.background.tilePositionX += 0.3;
    }
}
