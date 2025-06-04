import Phaser from "phaser";

export default class gameScreen extends Phaser.Scene {
    constructor() {
        super('gameScreen');
        this.player;
        this.spaceKey;
        this.jumpCount = 0;
        this.maxJumps = 3;
        this.obstacles;
        this.lastObstacleTime = 0;
        this.scrollSpeed = 300;
    }
    preload() {
        this.load.image('sky', '/assets/tiles/sky.png');
        this.load.image('mountain', '/assets/tiles/mountains.png');
        this.load.image('ground', '/assets/tiles/ground.png');
        this.load.image('sun', '/assets/tiles/sun.png');

        this.load.image('fence', '/assets/tiles/fence.png');
        this.load.image('pit', '/assets/tiles/pit.png');

        this.load.image('apple', '/assets/tiles/apple.png');
        this.load.image('carrot', '/assets/tiles/carrot.png');

        this.load.audio('theme', '/assets/music/theme.mp3');
        this.load.audio('jumpSound', '/assets/music/jump.wav');
        this.load.audio('fallSound', '/assets/music/fall.wav');
        this.load.audio('pickupSound', '/assets/music/pickup.wav');

        this.load.spritesheet('roach',
            '/assets/sprite/roach.png',
            { frameWidth: 114, frameHeight: 86 }
        );
        this.load.spritesheet('griffin-sheet',
            '/assets/sprite/griffin-sheet.png',
            { frameWidth: 138, frameHeight: 116 }
        );
    }
    
    create() {
        this.spaceKey = this.input.keyboard.addKey('space');
        const width = this.scale.width;
        const height = this.scale.height;

        this.physics.world.setFPS(60);

        this.add.tileSprite(0, 0, width * 5, height, 'sky')
            .setOrigin(0, 0)

        this.add.tileSprite(0, 0, width * 5, height, 'mountain')
            .setOrigin(0, 0)

        this.add.tileSprite(0, 0, width * 5, height, 'ground')
            .setOrigin(0, 0)

        this.add.image(0, 0, 'sun')
            .setOrigin(0, 0)

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('roach', {frames:[0,1,2,3,4,5,6,7,8,9,10,11]}),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('roach', {frames:[12,13,14,15,16]}),
            frameRate: 7,
            repeat: 0
        });

        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers('roach', {frames:[24,25,26,27]}),
            frameRate: 4,
            repeat: 0
        });
        
        this.anims.create({
            key: 'griffin',
            frames: this.anims.generateFrameNumbers('griffin-sheet', {frames:[0,1,2,3]}),
            frameRate: 7,
            repeat: -1
        });

        this.player = this.physics.add.sprite(width * 0.15, 420, 'roach');
        this.player.play('run', true);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(this.player.width * 0.6, this.player.height * 0.6);
        this.player.setOffset(this.player.width * 0.2, this.player.height * 0.2);
        this.player.setGravityY(1000);

        this.ground = this.physics.add.staticGroup();
        this.ground.create(0, 730, 'ground')
            .setOrigin(0, 0)
            .setScale(width * 5);
        this.physics.add.collider(this.player, this.ground);

        this.obstacles = this.physics.add.group();
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

        this.music = this.sound.add('theme', { loop: true, volume: 0.05});
        this.jumpSound = this.sound.add('jumpSound');
        this.fallSound = this.sound.add('fallSound');

        this.items = this.physics.add.group();
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
        this.obstacleSpeed = 300;
        this.nextObstacleDelay = Phaser.Math.Between(1500, 3500);

        this.nextItemTime = 0;

        this.score = 0;
        this.scoreText = this.add.text(this.scale.width - 200, 40, 'Score: 0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#FFFFFF'
        }).setOrigin(0, 0);

        this.scoreTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.gameOver) {
                    this.score++;
                    this.scoreText.setText('Score: ' + this.score);
                }
            },
            loop: true
        });

        this.items = this.physics.add.group();
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        this.nextItemTime = 0;

        this.cameras.main.setBounds(0, 0, width * 50, height)

        this.jumpCount = 0;
    }

    update(time, delta) {

        if (!this.musicStarted && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.music.play();
            this.musicStarted = true;
        }

        if (this.gameOver || !this.player.body) return;
        const dt = delta / 1000;
        this.player.setVelocityX(0);

        this.children.getAt(0).tilePositionX += this.scrollSpeed * dt * 0.2;
        this.children.getAt(1).tilePositionX += this.scrollSpeed * dt * 0.3;
        this.children.getAt(2).tilePositionX += this.scrollSpeed * dt;

        if (this.player.body.touching.down) {
            this.player.setVelocityY(0);
            this.player.play('run', true);
            this.jumpCount = 0;
        }

        if (!this.player.body.touching.down) {
            if (this.player.body.velocity.y > 300) {
                this.player.setVelocityY(600);
            }
        }

        const isJumpJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);
        
        if (isJumpJustDown && (this.player.body.touching.down || this.jumpCount < this.maxJumps)) {
            this.player.setVelocityY(-600);
            this.jumpSound.play({ volume: 0.5 });
            this.player.play('jump', true);
            this.jumpCount++;
        }

        if (this.jumpCount === this.maxJumps) {
            this.player.setY(430);
            this.player.setVelocityY(0);
            this.jumpCount = 0;
        }
        
        this.spawnObstacles(time);

        this.obstacles.children.iterate((obstacle) => {
            if (!obstacle || !obstacle.body) return;

            if (obstacle.texture.key === 'fence') {
                obstacle.setY(454);
            } else if (obstacle.texture.key === 'pit') {
                obstacle.setY(500);
            }

            if (obstacle.active) {
                obstacle.body.velocity.x = -this.obstacleSpeed;
            }
            if (!obstacle.scored && this.player.x > obstacle.x + obstacle.width) {
                this.score += 2;
                this.scoreText.setText('Score: ' + this.score);
                obstacle.scored = true;
            }

            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });

        this.spawnItems(time);
    }

    spawnObstacles(time) {
        if (time - this.lastObstacleTime > this.nextObstacleDelay) {
            this.lastObstacleTime = time;
            this.nextObstacleDelay = Phaser.Math.Between(500, 2000);

            const rand = Phaser.Math.Between(0, 2);
            let obstacle;

            if (rand === 0) {
                obstacle = this.obstacles.create(this.scale.width + 200, 454, 'fence');
                obstacle.setImmovable(true);
                obstacle.setSize(obstacle.width * 0.6, obstacle.height * 0.6);
                obstacle.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);
                obstacle.scored = false;

            } else if (rand === 1) {
                obstacle = this.obstacles.create(this.scale.width + 200, 30, 'pit');
                obstacle.setSize(obstacle.width * 0.6, 100);
                obstacle.setImmovable(true);
                obstacle.scored = false;

            } else {
                const griffinHeight = Phaser.Math.Between(150, 400);
                obstacle = this.obstacles.create(this.scale.width + 100, griffinHeight, 'griffin-sheet');
                obstacle.setImmovable(true);
                obstacle.setSize(obstacle.width * 0.6, obstacle.height * 0.6);
                obstacle.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);
                obstacle.anims.play('griffin', true);
                obstacle.scored = false;
            }

            obstacle.setImmovable(true);
            obstacle.body.allowGravity = false;
        }
    }

    spawnItems(time) {
        if (time > this.nextItemTime) {
            this.nextItemTime = time + Phaser.Math.Between(5000, 10000); // 5–10 секунд

            const itemKey = Phaser.Math.Between(0, 1) === 0 ? 'apple' : 'carrot';
            const y = Phaser.Math.Between(150, 350);
            const item = this.items.create(this.scale.width + 100, y, itemKey);
            item.setVelocityX(-this.scrollSpeed);
            item.setImmovable(true);
            item.body.allowGravity = false;
            item.type = itemKey;
        }

        this.items.children.iterate(item => {
            if (item && item.x < -50) item.destroy();
        });
    }

    collectItem(player, item) {
        this.sound.play('pickupSound', { volume: 0.5 });

        if (item.type === 'apple') {
            this.score += 20;
            this.showFloatingText("+20", player.x + 50, player.y - 20);
        } else if (item.type === 'carrot') {
            this.applyCarrotEffect();
        }

        this.scoreText.setText('Score: ' + this.score);
        item.destroy();
    }

    showFloatingText(text, x, y) {
        const bonusText = this.add.text(x, y, text, {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: bonusText,
            y: y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => bonusText.destroy()
        });
    }

    applyCarrotEffect() {
        if (this.carrotActive) return;
        this.carrotActive = true;

        const originalSpeed = this.obstacleSpeed;
        const originalScroll = this.scrollSpeed;

        this.obstacleSpeed *= 2;
        this.scrollSpeed *= 2;

        this.scoreTimer.timeScale = 3;

        this.time.delayedCall(5000, () => {
            this.obstacleSpeed = originalSpeed;
            this.scrollSpeed = originalScroll;
            this.scoreTimer.timeScale = 1;
            this.carrotActive = false;
        });
    }

    hitObstacle(player) {
        if (this.gameOver) return;
        this.gameOver = true;

        this.fallSound.play({ volume: 0.5 });
        player.anims.play('fall', true);

        player.setVelocity(200, -200);
        player.setDrag(100, 0);
        player.setCollideWorldBounds(true);
        player.body.allowGravity = true;
        this.obstacles.setVelocityX(0);
        this.items.setVelocityX(0);
    }
}