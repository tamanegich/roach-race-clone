export default class gameOverScreen extends Phaser.Scene {
    constructor() {
        super('gameOverScreen');
        this.scrollSpeed = 300;
    }

    preload() {
        this.load.image('sky', '/assets/tiles/sky.png');

        this.load.audio('pickupSound', '/assets/music/pickup.wav');
        this.load.audio('theme', '/assets/music/theme.mp3');

        this.load.spritesheet('roach',
            '/assets/sprite/roach.png',
            { frameWidth: 114, frameHeight: 86 }
        );
    }

    init(data) {
        this.soundVolume = data.soundVolume ?? 1;
        this.score = data.score ?? 0;
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        const { width, height } = this.scale;

        this.physics.world.setFPS(60);

        this.add.tileSprite(0, 0, width * 5, height, 'sky')
            .setOrigin(0, 0)

        this.textStyle = {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        };

        this.makeText = (x, y, text) => {
            return this.add.text(x, y, text, { ...this.textStyle}).setOrigin(0.5);
        };

        this.replayButton = this.makeText(width * 0.7, height / 2 - 30 , 'Грати знову').setOrigin(0.5).setInteractive();

        this.titleButton = this.makeText(width * 0.7, height / 2 + 30, 'До меню').setOrigin(0.5).setInteractive();

        this.showScore = this.makeText(width * 0.3, height / 2, 'Рахунок: ' + this.score).setOrigin(0.5);

        this.replayButton.on('pointerdown', () => {
            this.sound.play('pickupSound', { volume: 0.2 * this.soundVolume});
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.scene.start('gameScreen', { soundVolume: this.soundVolume ?? 1 });
            const theme = this.sound.get('theme');
            if (theme && theme.isPlaying) theme.stop();

        });

        this.titleButton.on('pointerdown', () => {
            this.sound.play('pickupSound', { volume: 0.2 * this.soundVolume});
            this.scene.start('titleScreen', { soundVolume: this.soundVolume ?? 1 });
            const theme = this.sound.get('theme');
            if (theme && theme.isPlaying) theme.stop();

        });
    }

    update(time, delta) {
        const dt = delta / 1000;
        this.children.getAt(0).tilePositionX += this.scrollSpeed * dt * 0.2;
    }
}