import gameScene from "./scenes/gameScene";
import MainScene from "./scenes/mainScene";
import PreLoadScene from "./scenes/preloadScene";
import diceScene from "./scenes/diceScene";
import PathFollowerPlugin from 'phaser3-rex-plugins/plugins/pathfollower-plugin.js';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import SoundFadePlugin from 'phaser3-rex-plugins/plugins/soundfade-plugin.js';

const Config = {
    backgroundColor: 0xFFFFFF,
    scene: [MainScene,PreLoadScene,gameScene,diceScene],
    pixelArt: true,
    type: Phaser.WEBGL,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "ui-container",
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
            },
            {
            key: 'rexOutlinePipeline',
            plugin: OutlinePipelinePlugin,
            start: true
            },
            {
                key: 'rexSoundFade',
                plugin: SoundFadePlugin,
                start: true
            }
        ]
    }
};

export default Config;