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
        this.attackReady = false;
        this.attackAnim = "";
        this.projectileName = "";
        this.target = [];
        this.range = 1;
        this.attackConfig = "";
        this.projectileAnimName = "";
        this.kills = 0;
        this.attackType = 0;

        scene.add.existing(this);
        scene.physics.add.existing(this,true);

        
    }

    checkMob() {
        this.target.forEach(e => { 
            if (Phaser.Math.Distance.Between(this.body.x, this.body.y, e.body.x, e.body.y) > this.range) 
            {
                var x = this.target.findIndex(t => t.mobNum === e.mobNum);
                this.target.at(x).body.debugBodyColor = 0xFF0000;
                this.target.splice(this.target.findIndex(t => t.mobNum === e.mobNum), 1);
            }
        });
    }

    addMobtoTarget(scene,mob)
    {
        if (this.target.findIndex(t => t.mobNum === mob.mobNum) === -1) {
            this.target.push(mob);
            mob.body.debugBodyColor = 0xFFFFFF;
        }
    }

    attackMob(scene)
    {
        if (this.attackReady === false || this.target.length === 0)
            return;
        this.attackReady = false;
        this.play(this.attackConfig, true);

        if (this.attackType === 0) {
            this.target.forEach(e => {
                e.Health -= this.attack;
                e.showDamage(scene,this.attack);
                if (e.Health <= 0) {
                    this.kills++;
                    this.target.splice(this.target.findIndex(t => t.mobNum === e.mobNum), 1);
                    e.death();
                }
            })
        }
        else if (this.attackType === 1) {
            this.target.sort((a, b) => a.Health - b.Health);
            var bullet = new Projectile(scene,this, this.target.at(0));
        }        
    }

    activateAttack(scene)
    {
        scene.time.addEvent({
            delay: 10,
            callback: () => {
                this.checkMob();
            },
            loop: true
        });
        scene.time.addEvent({
            delay: 1000 / this.aspd,
            callback: () => {
                //console.log(this.attackConfig);
                this.attackReady = true;
                this.attackMob(scene);
            },
            loop: true
        });
    }
}