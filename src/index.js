import Config from "./Config";
import Game from "./Game";

import DefaultCss from "../views/default.css";
import DiceSceneCss from "../views/diceScene.css";
import GameSceneCss from "../views/gameScene.css";
import SilverFont_ttf from "./assets/font/Silver.ttf";
import SilverFont_woff from "./assets/font/Silver.woff";

import DiceAnimation1 from "./assets/images/dice_animated_1.gif";
import DiceAnimation2 from "./assets/images/dice_animated_2.gif";
import DiceAnimation3 from "./assets/images/dice_animated_3.gif";
import DiceAnimation4 from "./assets/images/dice_animated_4.gif";
import DiceAnimation5 from "./assets/images/dice_animated_5.gif";

Game.Initialize(Config);
export default Game;