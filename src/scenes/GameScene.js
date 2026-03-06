class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        // Default to level 1 if no data is passed
        this.currentLevel = data.level || 1;
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e'); // Dark blue/purple neon background

        // Physics Groups
        this.platforms = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.weaponDrops = this.physics.add.group();

        // UI
        this.weaponUI = this.add.text(10, 10, 'Weapon: PISTOL (Infinite)', { font: '20px Courier', fill: '#0ff' }).setScrollFactor(0);
        this.healthUI = this.add.text(10, 40, 'Health: 3', { font: '20px Courier', fill: '#0ff' }).setScrollFactor(0);

        let levelNames = {
            1: "Level 1: A Fachada",
            2: "Level 2: O Salão Principal",
            3: "Level 3: A Cozinha",
            4: "Level 4: O Estoque",
            5: "Level 5: Suíte VIP (Boss)"
        };
        this.levelUI = this.add.text(400, 10, levelNames[this.currentLevel], { font: '24px Courier', fill: '#ff00ff' }).setOrigin(0.5, 0).setScrollFactor(0);

        // Player
        // We will position player based on the level logic below
        this.player = new Player(this, 100, 300);

        // Build Level Layouts
        this.buildLevel(this.currentLevel);

        // Physics Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.weaponDrops, this.platforms);

        // Player collects drop
        this.physics.add.overlap(this.player, this.weaponDrops, (player, drop) => drop.collect(player), null, this);

        // Player gets hit by enemy body
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (!enemy.isDead && !player.isDead) player.hit(1);
        }, null, this);

        // Bullets hit enemies
        this.physics.add.overlap(this.player.bulletsGroup, this.enemies, (bullet, enemy) => {
            if (bullet.active && !enemy.isDead) {
                enemy.takeDamage(bullet.damage);
                bullet.setActive(false).setVisible(false).body.stop();
            }
        }, null, this);

        // Bullets hit walls (platforms)
        this.physics.add.collider(this.player.bulletsGroup, this.platforms, (bullet, platform) => {
            if (bullet.active) {
                bullet.setActive(false).setVisible(false).body.stop();
            }
        });

        // Event listeners
        this.events.on('ammoChanged', (ammo, type) => {
            let ammoText = ammo === -1 ? 'Infinite' : ammo;
            this.weaponUI.setText(`Weapon: ${type.toUpperCase()} (${ammoText})`);
        });

        this.events.on('playerHit', (health) => {
            this.healthUI.setText(`Health: ${health}`);
        });

        this.events.on('playerDied', () => {
            this.time.delayedCall(2000, () => {
                this.scene.restart({ level: this.currentLevel });
            });
        });

        // Set camera bounds (assuming level width is 1600 for scrolling)
        this.physics.world.setBounds(0, 0, 1600, 600);
        this.cameras.main.setBounds(0, 0, 1600, 600);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Level end trigger
        this.levelFinishTrigger = this.add.zone(1550, 300, 100, 600);
        this.physics.world.enable(this.levelFinishTrigger);
        this.levelFinishTrigger.body.setAllowGravity(false);
        this.levelFinishTrigger.body.moves = false;
        this.physics.add.overlap(this.player, this.levelFinishTrigger, this.completeLevel, null, this);
    }

    buildLevel(level) {
        // Common floor for all levels for safety
        for (let i = 0; i < 16; i++) {
            this.platforms.create(i * 100 + 50, 584, 'platform').setScale(1).refreshBody();
        }

        switch (level) {
            case 1: // Fachada (Linear)
                this.platforms.create(400, 450, 'platform');
                this.platforms.create(800, 350, 'platform');
                this.spawnEnemy(600, 500);
                this.spawnEnemy(900, 500);
                this.spawnDrop(800, 300, 'MACHINEGUN');
                break;
            case 2: // Salão (Mesas)
                for (let i = 1; i < 5; i++) {
                    this.platforms.create(300 * i, 450, 'platform'); // Mesas
                    this.spawnEnemy(300 * i, 400); // Em cima da mesa
                }
                this.spawnEnemy(700, 500); // no chao
                this.spawnDrop(600, 400, 'SHOTGUN');
                break;
            case 3: // Cozinha (Obstaculos)
                this.platforms.create(500, 400, 'platform');
                this.platforms.create(500, 200, 'platform'); // teto estreito
                this.spawnEnemy(600, 500);
                this.spawnEnemy(700, 500);
                this.spawnEnemy(1000, 500);
                this.spawnDrop(500, 350, 'MACHINEGUN');
                break;
            case 4: // Estoque (Verticalidade)
                this.platforms.create(300, 450, 'platform');
                this.platforms.create(200, 300, 'platform');
                this.platforms.create(500, 200, 'platform');
                this.platforms.create(800, 300, 'platform');
                this.platforms.create(1100, 400, 'platform');

                this.spawnEnemy(300, 400);
                this.spawnEnemy(500, 150);
                this.spawnEnemy(800, 250);
                this.spawnEnemy(1100, 350);

                this.spawnDrop(200, 250, 'SHOTGUN');
                this.spawnDrop(800, 250, 'MACHINEGUN');
                break;
            case 5: // VIP Suite (Boss)
                this.platforms.create(400, 400, 'platform');
                this.platforms.create(800, 400, 'platform');
                this.spawnDrop(200, 500, 'SHOTGUN');
                this.spawnDrop(1400, 500, 'MACHINEGUN');

                // Spawn Boss (scaling enemy, higher health)
                let boss = this.spawnEnemy(1000, 500);
                boss.health = 50;
                boss.setScale(2);
                boss.setTint(0xff0000); // Red boss
                boss.speed = 150; // Faster
                break;
        }
    }

    spawnEnemy(x, y) {
        let enemy = new Enemy(this, x, y);
        this.enemies.add(enemy);
        return enemy;
    }

    spawnDrop(x, y, type) {
        let drop = new WeaponDrop(this, x, y, type);
        this.weaponDrops.add(drop);
    }

    update(time, delta) {
        if (this.player) this.player.update(time, delta);

        // Update all enemies
        this.enemies.children.each((enemy) => {
            if (enemy.active) enemy.update();
        });
    }

    completeLevel() {
        if (this.levelFinishTrigger.active) {
            this.levelFinishTrigger.destroy(); // trigger only once

            let text = this.add.text(this.cameras.main.scrollX + 400, 300, 'STAGE CLEAR!', { font: '48px Courier', fill: '#0f0', backgroundColor: '#000' }).setOrigin(0.5);

            this.time.delayedCall(2000, () => {
                if (this.currentLevel < 5) {
                    this.scene.restart({ level: this.currentLevel + 1 });
                } else {
                    text.setText('GAME CLEARED!');
                    // Let them stare at the glory
                }
            });
        }
    }
}
