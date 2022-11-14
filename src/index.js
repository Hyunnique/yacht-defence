import Config from "./Config";
import Game from "./Game";

import DefaultCss from "../views/default.css";
import DiceSceneCss from "../views/diceScene.css";
import GameSceneCss from "../views/gameScene.css";
import SilverFont_ttf from "./assets/font/Silver.ttf";
import SilverFont_woff from "./assets/font/Silver.woff";

import Dice1 from "./assets/images/dice_1.png";
import Dice2 from "./assets/images/dice_2.png";
import Dice3 from "./assets/images/dice_3.png";
import Dice4 from "./assets/images/dice_4.png";
import Dice5 from "./assets/images/dice_5.png";

import DiceAnimation1 from "./assets/images/dice_animated_1.gif";
import DiceAnimation2 from "./assets/images/dice_animated_2.gif";
import DiceAnimation3 from "./assets/images/dice_animated_3.gif";
import DiceAnimation4 from "./assets/images/dice_animated_4.gif";
import DiceAnimation5 from "./assets/images/dice_animated_5.gif";

Game.Initialize(Config);
export default Game;