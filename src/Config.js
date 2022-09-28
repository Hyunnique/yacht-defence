import gameScene from "./scenes/gameScene";
import MainScene from "./scenes/mainScene";
import PreLoadScene from "./scenes/preloadScene";


const Config = {
    width: 1024,
    height: 768,
    backgroundColor: 0x000000,
    scene: [PreLoadScene,MainScene,gameScene],
    pixelArt: true,
    type: Phaser.AUTO,
    physics: {
        default: "arcade",
        arcade: {
            fps: 165,
            debug: true
        }
    }
};

export default Config;