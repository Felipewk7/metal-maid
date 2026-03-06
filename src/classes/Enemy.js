class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy_maid');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(800);

        this.health = 5;
        this.speed = 100;
        this.playerTarget = scene.player;
        this.isDead = false;
    }

    update() {
        if (this.isDead) return;

        // Basic AI: Move towards player if within range
        let distance = Phaser.Math.Distance.Between(this.x, this.y, this.playerTarget.x, this.playerTarget.y);

        if (distance < 400 && distance > 30) {
            // Chase
            if (this.playerTarget.x < this.x) {
                this.setVelocityX(-this.speed);
                this.setFlipX(false);
            } else {
                this.setVelocityX(this.speed);
                this.setFlipX(true);
            }
        } else {
            // Idle or attack (if close enough, physics overlap will handle damage)
            this.setVelocityX(0);
        }
    }

    takeDamage(damage) {
        if (this.isDead) return;

        this.health -= damage;

        // Flash white
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(100, () => this.clearTint());

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.setVelocity(0, 0);
        this.body.enable = false;

        // simple death animation (fade out and move up)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 50,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
