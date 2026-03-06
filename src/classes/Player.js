class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_idle');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(800); // Higher gravity for snappier jumps
        this.setDragX(1000); // Friction when not pressing keys

        // Weapon System
        this.weapons = {
            PISTOL: { type: 'pistol', damage: 1, fireRate: 400, ammo: -1 }, // -1 means infinite
            MACHINEGUN: { type: 'machinegun', damage: 0.5, fireRate: 100, ammo: 100 },
            SHOTGUN: { type: 'shotgun', damage: 5, fireRate: 800, ammo: 30 }
        };

        this.currentWeapon = this.weapons.PISTOL;
        this.lastFired = 0;

        // Input Controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.fireKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // State variables
        this.health = 3;
        this.isDead = false;

        // For bullets
        this.bulletsGroup = scene.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 50
        });
    }

    update(time, delta) {
        if (this.isDead) return;

        // Ensure movement works with either A/D or Arrow Keys
        let movingLeft = this.cursors.left.isDown || this.keyA.isDown;
        let movingRight = this.cursors.right.isDown || this.keyD.isDown;
        let isJumping = Phaser.Input.Keyboard.JustDown(this.cursors.space);

        // Movement
        if (movingLeft) {
            this.setVelocityX(-250);
            this.setFlipX(true);
        } else if (movingRight) {
            this.setVelocityX(250);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        // Jumping
        if (isJumping && this.body.touching.down) {
            this.setVelocityY(-600);
        }

        // Shooting
        if (this.scene.input.activePointer.isDown || this.fireKey.isDown) {
            this.shoot(time);
        }
    }

    shoot(time) {
        if (time < this.lastFired) return;

        let weapon = this.currentWeapon;

        // Check ammo
        if (weapon.ammo === 0) {
            this.currentWeapon = this.weapons.PISTOL;
            weapon = this.currentWeapon;
        }

        // Firing logic based on weapon type
        if (weapon.type === 'pistol' || weapon.type === 'machinegun') {
            this.fireBullet(weapon);
        } else if (weapon.type === 'shotgun') {
            // Fires 3 bullets in a spread
            this.fireBullet(weapon, -0.15); // Upward angle
            this.fireBullet(weapon, 0);     // Straight
            this.fireBullet(weapon, 0.15);  // Downward angle
        }

        // Setup cooldown and ammo
        this.lastFired = time + weapon.fireRate;
        if (weapon.ammo > 0) {
            weapon.ammo--;
            // UI text update happens in GameScene
            this.scene.events.emit('ammoChanged', weapon.ammo, weapon.type);
        }
    }

    fireBullet(weapon, angleOffset = 0) {
        let bullet = this.bulletsGroup.get(this.x, this.y);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);

            // Calculate direction based on player facing
            let direction = this.flipX ? -1 : 1;

            // Apply velocity
            let speed = 600;
            bullet.body.velocity.x = speed * direction;
            bullet.body.velocity.y = speed * angleOffset * direction; // slight spread

            // Adjust bullet position to gun barrel
            bullet.x += direction * 20;

            bullet.body.setAllowGravity(false);

            // Store damage in the bullet object for collision logic
            bullet.damage = weapon.damage;

            // Automatically destroy generic bullets off-screen
            this.scene.time.delayedCall(1500, () => {
                if (bullet) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                    bullet.body.stop();
                }
            });
        }
    }

    hit(damage) {
        if (this.isDead) return;
        this.health -= damage;
        this.scene.events.emit('playerHit', this.health);

        if (this.health <= 0) {
            this.die();
        } else {
            // Flash red
            this.setTint(0xff0000);
            this.scene.time.delayedCall(200, () => this.clearTint());
        }
    }

    die() {
        this.isDead = true;
        this.setTint(0x555555);
        this.setVelocity(0, 0);
        this.setRotation(Math.PI / 2); // Rotate 90 degrees to "fall"
        this.scene.events.emit('playerDied');
    }

    changeWeapon(weaponType) {
        if (this.weapons[weaponType]) {
            this.currentWeapon = this.weapons[weaponType];

            // Reset ammo if picking up same weapon to refill
            if (weaponType === 'MACHINEGUN') this.currentWeapon.ammo = 100;
            if (weaponType === 'SHOTGUN') this.currentWeapon.ammo = 30;

            this.scene.events.emit('ammoChanged', this.currentWeapon.ammo, this.currentWeapon.type);
        }
    }
}
