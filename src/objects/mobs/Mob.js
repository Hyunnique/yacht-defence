const Phaser = require("phaser");

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,num,spawn,end) {
        super(scene, spawn.x, spawn.y, "bat");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.Health = 300;
        this.scale = 2;
        this.m_speed = 150;
        this.mobNum = num;

        this.play("bat_anim");
        this.m_events = [];
        this.m_events.push(
            this.scene.time.addEvent({
                delay: 100,
                callback: () => { 
                    scene.physics.moveTo(this, end.x, end.y, this.m_speed);           
                },
                loop: true
            })
        )

        scene.events.on("update", (time, delta) => {
            this.update(time, delta);
        });
    }

    death()
    {
        this.scene.time.removeEvent(this.m_events);
        this.destroy();
    }

    showDamage(scene,attack) {
        var text = scene.add.text(this.body.x, this.body.y - 20, attack, {
            fontFamily: 'consolas',
            fontSize: '50px',
            color: '#F00'
        });
        scene.physics.world.enable(text);
        text.body.setAccelerationY(-100);
            
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                text.destroy();
            },
            loop: false
        });
    }
    
    bullseye(scene, projectile) {
        this.Health -= projectile.attack;
        this.showDamage(scene, projectile.attack);
        projectile.destroy();
        if (this.Health <= 0) {
            projectile.shooter.target.splice(projectile.shooter.target.findIndex(t => t.mobNum === this.mobNum), 1);
            this.death();
        }
    }
}