import gameScene from "./scenes/gameScene";
import MainScene from "./scenes/mainScene";
import PreLoadScene from "./scenes/preloadScene";
import PathFollowerPlugin from 'phaser3-rex-plugins/plugins/pathfollower-plugin.js';


const Config = {
    backgroundColor: 0xFFFFFF,
    scene: [PreLoadScene,MainScene,gameScene],
    pixelArt: true,
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "ui-container",
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 960
    },
    parent: "ui-container",
    physics: {
        default: "arcade",
        arcade: {
            fps: 60,
            debug: false
        }
    },
    plugins: {
        global: [{
            key: 'rexPathFollower',
            plugin: PathFollowerPlugin,
            start: true
        }]
    }
};

export default Config;