import Config from "./Config";
import Game from "./Game";

import DefaultCss from "../views/default.css";
import CommonCss from "../views/common.css";
import MainSceneCss from "../views/mainScene.css";
import DiceSceneCss from "../views/diceScene.css";
import GameSceneCss from "../views/gameScene.css";
import SilverFont_ttf from "./assets/font/Silver.ttf";
import SilverFont_woff from "./assets/font/Silver.woff";

function importAll(r) {
    let arr = {};
    r.keys().map((item, index) => { arr[item.replace('./', '')] = r(item); });
    return arr;
}

const images = importAll(require.context("./assets/images", false, /\.(png|jpe?g|svg|gif)$/));
const unitSpriteSheets = importAll(require.context("./assets/spritesheets/units", false, /\.png$/));

Game.Initialize(Config);
export default Game;