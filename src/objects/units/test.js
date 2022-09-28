const Phaser = require("phaser");
const Config = require("../../Config")
import playerUnit from "./playerUnit";

export default class girl extends playerUnit{

    constructor(scene) {
        super(scene, 0, 0, "testwait");
        this.scale = 1;
        this.alpha = 1;
        this.attack = 100;
        this.aspd = 0.5;
        this.range = 30;
        this.attackType = 1;
        this.projectileName = "bullet";
        this.projectileAnimName = "bullet_anim";
        this.attackAnim = "test_atk";
        this.attackConfig = scene.anims.get(this.attackAnim);


        this.play("test_wait");

        
        var attackConfig = scene.anims.get(this.attackAnim);
        
        attackConfig.frameRate *= this.aspd;
        attackConfig.msPerFrame = 1000 / attackConfig.frames.length;

        scene.physics.world.enableBody(this);

        this.setBodySize(this.range, this.range);
        this.setCircle(100);
        this.setOffset(-60, -60);

        this.activateAttack(scene);
    }
}