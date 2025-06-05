export default class TitleScreen extends Phaser.Scene {
    constructor() {
        super('titleScreen');
        this.player;
        this.scrollSpeed = 300;
    }

    preload() {
        this.load.image('sky', '/assets/tiles/sky.png');
        this.load.image('mountain', '/assets/tiles/mountains.png');
        this.load.image('ground', '/assets/tiles/ground.png');
        this.load.image('sun', '/assets/tiles/sun.png');

        this.load.image('logo', '/assets/misc/заставка.png');

        this.load.audio('titleThemeMusic', '/assets/music/torallyNormalTitleTheme.mp3');
        this.load.audio('pickupSound', '/assets/music/pickup.wav');

        this.load.spritesheet('roach',
            '/assets/sprite/roach.png',
            { frameWidth: 114, frameHeight: 86 }
        );
    }

    create() {
        const { width, height } = this.scale;

        this.physics.world.setFPS(60);

        this.add.tileSprite(0, 0, width * 5, height, 'sky')
            .setOrigin(0, 0)

        this.add.tileSprite(0, 0, width * 5, height, 'mountain')
            .setOrigin(0, 0)

        this.add.tileSprite(0, 0, width * 5, height, 'ground')
            .setOrigin(0, 0)

        this.add.image(0, 0, 'sun')
            .setOrigin(0, 0)

        this.add.image(width / 2, height / 5, 'logo')

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('roach', {frames:[0,1,2,3,4,5,6,7,8,9,10,11]}),
            frameRate: 15,
            repeat: -1
        });

        this.player = this.physics.add.sprite(width * 0.5, 435, 'roach');
        this.player.play('run', true);

        this.ground = this.physics.add.staticGroup();
        this.ground.create(0, 745, 'ground').setOrigin(0, 0).setScale(width * 5);
        this.physics.add.collider(this.player, this.ground);

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

        this.startButton = this.makeText(width / 2, height / 2 + 20, 'Почати гру').setOrigin(0.5).setInteractive();

        this.settingsButton = this.makeText(width / 2, height / 2 + 70, 'Налаштування').setOrigin(0.5).setInteractive();

        this.startButton.on('pointerdown', () => {
            this.sound.play('pickupSound', { volume: 0.2 * this.soundVolume});
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.scene.start('gameScreen', { soundVolume: this.soundVolume ?? 1 });
            this.titleTheme.stop();
        });

        this.settingsButton.on('pointerdown', () => {
            this.sound.play('pickupSound', { volume: 0.2 * this.soundVolume});
            this.showSettings();
        });

        this.volumeText = this.makeText(width / 2, height / 2, 'Гучність: 100%').setOrigin(0.5).setVisible(false);

        this.adjustVolumeButton = this.makeText(width / 2, height / 2 + 50, 'Зменшити звук').setOrigin(0.5).setInteractive().setVisible(false);

        this.backButton = this.makeText(width / 2, height / 2 + 100, 'Назад').setOrigin(0.5).setInteractive().setVisible(false);

        this.soundVolume = 1;

        this.adjustVolumeButton.on('pointerdown', () => {
            this.toggleSound();
            this.sound.play('pickupSound', { volume: 0.2 * this.soundVolume});
        });

        this.backButton.on('pointerdown', () => {
            this.sound.play('pickupSound', { volume: 0.2 * this.soundVolume});
            this.showMainMenu();
        });
        this.titleTheme = this.sound.add('titleThemeMusic', { loop: true, volume: 0.2 * this.soundVolume});
        const unlockAudio = () => {
            if(!this.titleTheme.isPlaying) {
                this.titleTheme.play()
            }
            this.input.keyboard.off('keydown', unlockAudio);
            this.input.off('pointerdown', unlockAudio);
            this.input.off('pointerup', unlockAudio);
        }

        this.input.keyboard.on('keydown', unlockAudio);
        this.input.on('pointerdown', unlockAudio);
        this.input.on('pointerup', unlockAudio);

    }

    update(time, delta){
        const dt = delta / 1000;
        this.children.getAt(0).tilePositionX += this.scrollSpeed * dt * 0.2;
        this.children.getAt(1).tilePositionX += this.scrollSpeed * dt * 0.3;
        this.children.getAt(2).tilePositionX += this.scrollSpeed * dt;
    }

    toggleSound() {
        this.soundVolume = this.soundVolume === 0 ? 1 : this.soundVolume - 0.25;
        if (this.soundVolume < 0) this.soundVolume = 0;
        const percent = Math.round(this.soundVolume * 100);
        this.volumeText.setText(`Гучність: ${percent}%`);
        if (this.titleTheme && this.titleTheme.isPlaying) {
        this.titleTheme.setVolume(0.2 * this.soundVolume);
    }
    }

    showSettings() {

        this.startButton.setVisible(false);
        this.settingsButton.setVisible(false);

        this.volumeText.setVisible(true);
        this.adjustVolumeButton.setVisible(true);
        this.backButton.setVisible(true);
    }

    showMainMenu() {

        this.startButton.setVisible(true);
        this.settingsButton.setVisible(true);

        this.volumeText.setVisible(false);
        this.adjustVolumeButton.setVisible(false);
        this.backButton.setVisible(false);
    }
}
