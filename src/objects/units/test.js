const Phaser = require("phaser");
const Config = require("../../Config")
import playerUnit from "./playerUnit";

export default class girl extends playerUnit{

    constructor(scene) {
        super(scene, 0, 0, "testwait");
        this.scale = 1;
        this.alpha = 1;
        this.attack = 150;
        this.aspd = 2.5;
        this.attackAnim = "test_atk";
        this.play("test_wait");

        
        var attackConfig = scene.anims.get(this.attackAnim);
        attackConfig.frameRate *= this.aspd;

        scene.physics.world.enableBody(this);

        this.setBodySize(300, 300);
        this.setCircle(300);
    }
}