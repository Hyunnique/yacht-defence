const Phaser = require("phaser");
import {
    pathA0,
    pathB0,
    pathC0,
    pathD0,
    pathBoss0,
} from "../points/mobPath";
import Game from "../../Game.js";

export default class Arrow extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, mobRoute) {
        super(scene, -5000, -5000, "arrow");
        scene.add.existing(this);
        this.scale = 1;
        this.m_speed = 3;
        this.moveType = mobRoute + 0;

        switch (this.moveType) {
            case "A0":
                this.path = pathA0;
                break;
            case "B0":
                this.path = pathB0;
                break;
            case "C0":
                this.path = pathC0; 
                break;
            case "D0":
                this.path = pathD0;
                break;
            case "X0":
                this.path = pathBoss0;
                break;
            default:
                break;
        }
        
        this.pathFollower = scene.plugins.get('rexPathFollower').add(this, {
            path: this.path,
            rotateToPath: true,
            spacedPoints: false
        });

        this.tween = scene.tweens.add({
            targets: this.pathFollower,
            t: 1,
            ease: 'Linear',
            duration: this.m_speed * 1000,
            repeat: 0,
            yoyo: false
        });
        this.scene.events.on("update", this.update, this);
    }
    update()
    {       
        if (this.tween.progress == 1) {
            this.tween.remove();
            this.destroy();
        }
    }
}