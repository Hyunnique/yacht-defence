import Projectile from '../projectiles/projectile.js';
const Config = require("../../Config");
const Phaser = require("phaser");

export default class Playertest extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,x,y, db) {
        super(scene, x, y, db.idleSprite);

        this.attack = db.attack;
        this.aspd = db.aspd;
        this.range = db.range;
        this.attackType = db.attackType;
        this.idleAnim = db.idleAnim;
        this.attackAnim = db.attackAnim;
        this.projectileName = db.projectileName;
        this.projectileAnimName = db.projectileAnimName

        this.scale = 1;
        this.alpha = 1;
        this.offset = 0;        
        
        this.target = [];
        
        this.attackConfig = this.scene.anims.get(this.attackAnim);
        this.attackConfig.frameRate *= this.aspd;

        this.kills = 0;
        this.isTarget = false;

        this.setInteractive({ draggable: true });
        this.scene.add.existing(this);
        this.activateAttack();
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