const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false // Change to true to see hitboxes
        }
    },
    scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);
