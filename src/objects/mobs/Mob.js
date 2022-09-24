const Phaser = require("phaser");

export default class Mob extends Phaser.Physics.Arcade.Sprite {

    constructor(scene) {
        super(scene, -300, -300, "bat");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.Health = 300;
        this.scale = 2;
        this.m_speed = 150;

        this.play("bat_anim");
        this.m_events = [];
        this.m_events.push(
            this.scene.time.addEvent({
                delay: 100,
                callback: () => { 
                    scene.physics.moveToObject(this, scene.m_player, this.m_speed);
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
}