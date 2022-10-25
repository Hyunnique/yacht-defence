const Phaser = require("phaser");
const Config = require("../../Config")
import playerUnit from "./playerUnit";

export default class girl extends playerUnit{

    constructor(scene) {
        super(scene, 0, 0, "testwait2");
        this.scale = 0.15;
        this.alpha = 1;
        this.attack = 100;
        this.aspd = 1.5;
        this.range = 300;
        this.attackType = 0;
        this.attackAnim = "test_atk";
        this.attackConfig = scene.anims.get(this.attackAnim);


        this.play("test_wait2");

        
        var attackConfig = scene.anims.get(this.attackAnim);
        attackConfig.frameRate *= this.aspd;

        scene.physics.world.enableBody(this);

        this.setBodySize(this.range, this.range);
        this.setCircle(300);
        this.setOffset(-75,-75);

        this.activateAttack(scene);
    }
}