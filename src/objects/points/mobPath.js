const Phaser = require("phaser");
const pathA = new Phaser.Curves.Path(0, 312).lineTo(648, 312).lineTo(648, 1128).lineTo(1752, 1128).lineTo(1752, 720).lineTo(2400, 720);
const pathB = new Phaser.Curves.Path(0, 1128).lineTo(648, 1128).lineTo(648, 312).lineTo(1752, 312).lineTo(1752, 720).lineTo(2400, 720);
const pathC = new Phaser.Curves.Path(1224, 0).lineTo(1224, 312).lineTo(1752, 312).lineTo(1752, 720).lineTo(2400, 720);
const pathD = new Phaser.Curves.Path(1224, 1392).lineTo(1224, 1128).lineTo(1752, 1128).lineTo(1752, 720).lineTo(2400, 720);
const pathBoss = new Phaser.Curves.Path(0, 720).lineTo(2400, 720);

export {
    pathA,
    pathB,
    pathC,
    pathD,
    pathBoss
}