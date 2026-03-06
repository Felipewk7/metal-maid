class WeaponDrop extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // type should be 'MACHINEGUN' or 'SHOTGUN'
        let texture = type === 'MACHINEGUN' ? 'drop_machinegun' : 'drop_shotgun';
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.weaponType = type;
        this.setGravityY(500);
        this.setBounceY(0.4);

        // Floating animation
        scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect(player) {
        player.changeWeapon(this.weaponType);

        // Small effect when collected
        let text = this.scene.add.text(this.x, this.y - 20, this.weaponType, { font: '12px Courier', fill: '#0ff' });
        this.scene.tweens.add({
            targets: text,
            y: this.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });

        this.destroy();
    }
}
