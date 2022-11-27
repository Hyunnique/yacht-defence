const Phaser = require("phaser");
const offsetX = 3000;
const offsetY = 1840;

const pathA0 = new Phaser.Curves.Path(0, 312).lineTo(648, 312).lineTo(648, 1128).lineTo(1752, 1128).lineTo(1752, 720).lineTo(2400, 720);
const pathB0 = new Phaser.Curves.Path(0, 1128).lineTo(648, 1128).lineTo(648, 312).lineTo(1752, 312).lineTo(1752, 720).lineTo(2400, 720);
const pathC0 = new Phaser.Curves.Path(1224, 0).lineTo(1224, 312).lineTo(648, 312).lineTo(648, 1128).lineTo(1752, 1128).lineTo(1752, 720).lineTo(2400, 720);
const pathD0 = new Phaser.Curves.Path(1224, 1392).lineTo(1224, 1128).lineTo(648, 1128).lineTo(648, 312).lineTo(1752, 312).lineTo(1752, 720).lineTo(2400, 720);
const pathBoss0 = new Phaser.Curves.Path(0, 660).lineTo(2400, 660);

const pathA1 = new Phaser.Curves.Path(0 + offsetX, 312).lineTo(648 + offsetX, 312).lineTo(648 + offsetX, 1128).lineTo(1752 + offsetX, 1128).lineTo(1752 + offsetX, 720).lineTo(2400 + offsetX, 720);
const pathB1 = new Phaser.Curves.Path(0 + offsetX, 1128).lineTo(648 + offsetX, 1128).lineTo(648 + offsetX, 312).lineTo(1752 + offsetX, 312).lineTo(1752 + offsetX, 720).lineTo(2400 + offsetX, 720);
const pathC1 = new Phaser.Curves.Path(1224 + offsetX, 0).lineTo(1224 + offsetX, 312).lineTo(648 + offsetX, 312).lineTo(648 + offsetX, 1128).lineTo(1752 + offsetX, 1128).lineTo(1752 + offsetX, 720).lineTo(2400 + offsetX, 720);
const pathD1 = new Phaser.Curves.Path(1224 + offsetX, 1392).lineTo(1224 + offsetX, 1128).lineTo(648 + offsetX, 1128).lineTo(648 + offsetX, 312).lineTo(1752 + offsetX, 312).lineTo(1752 + offsetX, 720).lineTo(2400 + offsetX, 720);
const pathBoss1 = new Phaser.Curves.Path(0 + offsetX, 660).lineTo(2400 + offsetX, 660);

const pathA2 = new Phaser.Curves.Path(0, 312 + offsetY).lineTo(648, 312 + offsetY).lineTo(648, 1128 + offsetY).lineTo(1752, 1128 + offsetY).lineTo(1752, 720 + offsetY).lineTo(2400, 720 + offsetY);
const pathB2 = new Phaser.Curves.Path(0, 1128 + offsetY).lineTo(648, 1128 + offsetY).lineTo(648, 312 + offsetY).lineTo(1752, 312 + offsetY).lineTo(1752, 720 + offsetY).lineTo(2400, 720 + offsetY);
const pathC2 = new Phaser.Curves.Path(1224, 0 + offsetY).lineTo(1224, 312 + offsetY).lineTo(648, 312 + offsetY).lineTo(648, 1128 + offsetY).lineTo(1752, 1128 + offsetY).lineTo(1752, 720 + offsetY).lineTo(2400, 720 + offsetY);
const pathD2 = new Phaser.Curves.Path(1224, 1392 + offsetY).lineTo(1224, 1128 + offsetY).lineTo(648, 1128 + offsetY).lineTo(648, 312 + offsetY).lineTo(1752, 312 + offsetY).lineTo(1752, 720 + offsetY).lineTo(2400, 720 + offsetY);
const pathBoss2 = new Phaser.Curves.Path(0, 660 + offsetY).lineTo(2400, 660 + offsetY);

const pathA3 = new Phaser.Curves.Path(0 + offsetX, 312 + offsetY).lineTo(648 + offsetX, 312 + offsetY).lineTo(648 + offsetX, 1128 + offsetY).lineTo(1752 + offsetX, 1128 + offsetY).lineTo(1752 + offsetX, 720 + offsetY).lineTo(2400 + offsetX, 720 + offsetY);
const pathB3 = new Phaser.Curves.Path(0 + offsetX, 1128 + offsetY).lineTo(648 + offsetX, 1128 + offsetY).lineTo(648 + offsetX, 312 + offsetY).lineTo(1752 + offsetX, 312 + offsetY).lineTo(1752 + offsetX, 720 + offsetY).lineTo(2400 + offsetX, 720 + offsetY);
const pathC3 = new Phaser.Curves.Path(1224 + offsetX, 0 + offsetY).lineTo(1224 + offsetX, 312 + offsetY).lineTo(648 + offsetX, 312 + offsetY).lineTo(648 + offsetX, 1128 + offsetY).lineTo(1752 + offsetX, 1128 + offsetY).lineTo(1752 + offsetX, 720 + offsetY).lineTo(2400 + offsetX, 720 + offsetY);
const pathD3 = new Phaser.Curves.Path(1224 + offsetX, 1392 + offsetY).lineTo(1224 + offsetX, 1128 + offsetY).lineTo(648 + offsetX, 1128 + offsetY).lineTo(648 + offsetX, 312 + offsetY).lineTo(1752 + offsetX, 312 + offsetY).lineTo(1752 + offsetX, 720 + offsetY).lineTo(2400 + offsetX, 720 + offsetY);
const pathBoss3 = new Phaser.Curves.Path(0 + offsetX, 660 + offsetY).lineTo(2400 + offsetX, 660 + offsetY);

export {
    pathA0,
    pathB0,
    pathC0,
    pathD0,
    pathBoss0,
    pathA1,
    pathB1,
    pathC1,
    pathD1,
    pathBoss1,
    pathA2,
    pathB2,
    pathC2,
    pathD2,
    pathBoss2,
    pathA3,
    pathB3,
    pathC3,
    pathD3,
    pathBoss3
}