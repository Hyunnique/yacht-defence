const Phaser = require("phaser");
const Config = require("../../Config")
import playerUnit from "./playerUnit";

export default class shooter extends playerUnit{

    constructor(scene) {
        super(scene, 0, 0, "testwait");
        this.scale = 1;
        this.alpha = 1;
        this.attack = 100;
        this.aspd = 2.5;
        this.range = 300;
        this.offset = -300;
        this.idleAnim = "test_wait";
        this.attackType = 1;
        this.attackAnim = "test_atk";
        this.projectileName = "bullet";
        this.projectileAnimName = "bullet_anim";
        this.attackConfig = scene.anims.get(this.attackAnim);

        this.play(this.idleAnim);
        
        var attackConfig = scene.anims.get(this.attackAnim);
        attackConfig.frameRate *= this.aspd;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBodySize(this.range, this.range);
        this.setCircle(this.range);
        this.setOffset(this.offset, this.offset);

        this.activateAttack(scene);    
    }
}