import gameScene from "./scenes/gameScene";
import MainScene from "./scenes/mainScene";
import PreLoadScene from "./scenes/preloadScene";
import PathFollowerPlugin from 'phaser3-rex-plugins/plugins/pathfollower-plugin.js';


const Config = {
    width: 1920,
    height: 960,
    backgroundColor: 0xFFFFFF,
    scene: [PreLoadScene,MainScene,gameScene],
    pixelArt: true,
    type: Phaser.AUTO,
    physics: {
        default: "arcade",
        arcade: {
            fps: 60,
            debug: true
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