class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Here we will generate graphics on the fly so we don't need real images immediately.
        // But for when you have real assets, they would be loaded here:
        // this.load.image('bgm_maid_cafe', 'assets/audio/bgm_maid_cafe.mp3');

        let loadingText = this.add.text(400, 300, 'Loading...', { font: '20px Courier', fill: '#ffffff' });
        loadingText.setOrigin(0.5, 0.5);
    }

    create() {
        // Create generated textures for placeholders

        // 1. Player Graphics
        let gPlayer = this.make.graphics();
        gPlayer.fillStyle(0x00f3ff, 1); // Neon blue
        gPlayer.fillRect(0, 0, 32, 48); // Body
        gPlayer.generateTexture('player_idle', 32, 48);
        gPlayer.clear();

        // 2. Enemy (Maid) Graphics
        let gEnemy = this.make.graphics();
        gEnemy.fillStyle(0xff00b3, 1); // Neon pink
        gEnemy.fillRect(0, 0, 32, 48);
        gEnemy.generateTexture('enemy_maid', 32, 48);
        gEnemy.clear();

        // 3. Bullet Graphics
        let gBullet = this.make.graphics();
        gBullet.fillStyle(0xffff00, 1); // Yellow bullet
        gBullet.fillRect(0, 0, 8, 4);
        gBullet.generateTexture('bullet', 8, 4);
        gBullet.clear();

        // 4. Weapon Drop (Machine Gun)
        let gMgDrop = this.make.graphics();
        gMgDrop.fillStyle(0x00ff00, 1); // Green box
        gMgDrop.fillRect(0, 0, 24, 16);
        gMgDrop.generateTexture('drop_machinegun', 24, 16);
        gMgDrop.clear();

        // 5. Weapon Drop (Shotgun)
        let gSgDrop = this.make.graphics();
        gSgDrop.fillStyle(0xff0000, 1); // Red box
        gSgDrop.fillRect(0, 0, 24, 16);
        gSgDrop.generateTexture('drop_shotgun', 24, 16);
        gSgDrop.clear();

        // 6. Platform / Environment
        let gPlat = this.make.graphics();
        gPlat.fillStyle(0x333333, 1);
        gPlat.lineStyle(2, 0x00ff00, 1); // Green border
        gPlat.strokeRect(0, 0, 100, 32);
        gPlat.fillRect(0, 0, 100, 32);
        gPlat.generateTexture('platform', 100, 32);
        gPlat.clear();

        this.scene.start('GameScene');
    }
}
