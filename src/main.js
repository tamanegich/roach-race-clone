import Phaser from "phaser";
import gameScreen from './scenes/gameScreen';
import titleScreen from './scenes/titleScreen';
import './style.css'

const config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 540,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200}
        }
    },
    scale: {
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
}

const game = new Phaser.Game(config)


game.scene.add('titleScreen', titleScreen);
game.scene.add('gameScreen', gameScreen)

game.scene.start('titleScreen');