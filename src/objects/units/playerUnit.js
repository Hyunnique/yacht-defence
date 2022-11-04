import Projectile from '../projectiles/projectile.js';
const Config = require("../../Config");
const Phaser = require("phaser");

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name) {
        super(scene, x, y, name);
        this.attack = 0;
        this.aspd = 2.5;
        this.scale = 0.4;
        this.alpha = 1;
        this.offset = 0;
        this.attackReady = false;
        this.idleAnim = "";
        this.attackAnim = "";
        this.projectileName = "";
        this.target = [];
        this.range = 1;
        this.attackConfig = "";
        this.projectileAnimName = "";
        this.kills = 0;
        this.attackType = 0;
        this.isTarget = false;
        this.setInteractive({ draggable: true });
        //this.activateAttack(); db-베이스로 변형시에 바꿔주세요.
    }

    checkMob() {
        this.target = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => item.gameObject.isTarget == true);
        return this.target;
    }

    attackMob()
    {   
        if (this.target.length == 0)
        {
            this.play(this.idleAnim);
            return;
        }

        this.play(this.attackConfig, true);

        if (this.attackType === 0) {
            this.target.forEach(e => {
                e.Health -= this.attack;
                e.showDamage(this.scene,this.attack);
                if (e.Health <= 0) {
                    this.kills++;
                    e.death();
                    this.checkMob();
                }
            })
        }
        else if (this.attackType === 1) {
            this.shootProjectile();
        }        
    }

    shootProjectile()
    {
        return new Projectile(this.scene, this);
    }

    activateAttack()
    {
        this.scene.time.addEvent({
            delay: 1000 / this.aspd,
            callback: () => {
                this.checkMob();
                this.attackMob();
            },
            loop: true
        });
    }
}