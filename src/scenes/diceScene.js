const Phaser = require('phaser');
const Config = require("../Config");

class Button {
    constructor(x, y, label, scene, callback) {
        const button = scene.add.text(x, y, label)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#000' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => button.setStyle({ fill: '#FFF' }));
    }
}   


export default class diceScene extends Phaser.Scene{
    constructor() {
        super("diceScene");
    }

    handDice = [-1, -1, -1, -1, -1];    // 현재 굴릴 주사위 (-1은 굴리지 않은 상황)
    savedDice = [];                     // 굴리지 않을 주사위
    dices = [];                         // 주사위 전체

    one = 0;
    two = 0;
    three = 0;
    four = 0;
    five = 0;
    six = 0;
    // 각 눈의 수
    
    choice = 0;                         // 초이스 값
    double = 0;                         // 같은 눈 2개
    triple = 0;                         // 같은 눈 3개
    quadruple = 0                       // 같은 눈 4개
    quintuple = 0                       // 같은 눈 5개
    smallStraight = 0                   
    largeStraight = 0
    fullHouse = 0;                      // 특수 족보 유무
    

    throwLeft = 3;                      // 남은 던질 기회
    drawed = false;                     // update 함수에서 주사위 그림 렌더링 했는지 확인할 변수 (나중에 방식에 따라 지워버려도 됌)

    leftText;
    choiceText;
    bestScore;
    testText;
    // 임시로 기능 표현을 위해 사용한 변수들 

    create(){
        const roll = new Button(1200, 675, 'Roll', this, () => this.rollDice(this.handDice.length));
        const init = new Button(1200, 640, "init", this, () => this.initThrow());

        this.imageGroup = this.add.group();
        this.input.on('gameobjectup', (pointer, gameObject) => gameObject.emit('clicked', gameObject), this);

        this.bestScore = this.add.text(100, 100, "Best : - ", {
            font: "14px Arial",
            fill: "#000",
            align: "center"
        })
        this.choiceText = this.add.text(100, 140, "Choice : 0", {
            font: "14px Arial",
            fill: "#000",
            align: "center"
        })
        this.leftText = this.add.text(100, 180, String(this.throwLeft) + " left", {
            font: "14px Arial",
            fill: "#000",
            align: "center"
        });
        // this.testText = this.add.text(0, 100, "-", {
        //     font: "14px Arial",
        //     fill: "#ffffff",
        //     align: "center"
        // })
        
        // this.add.sprite(1200, 300, "diceroll").play("dice_roll");
    }                                                                

    update() {
        if (!this.drawed) {
            this.imageGroup.clear(true);

            this.leftText.setText(String(this.throwLeft) + " left")
            // this.testText.setText(this.dices)
            // this.testText.setText(this.one)

            if (this.quintuple) this.bestScore.setText("Best : Yacht");
            else if (this.quadruple) this.bestScore.setText("Best : 4 kind of");
            else if (this.largeStraight) this.bestScore.setText("Best : Large straight");
            else if (this.fullHouse) this.bestScore.setText("Best : Full House");
            else if (this.smallStraight) this.bestScore.setText("Best : Small straight");
            else this.bestScore.setText("Best : - ");

            this.choiceText.setText("Choice : " + String(this.choice));

            let xPos = 150;
            for (let i = 0; i < this.handDice.length; i++) {
                if (this.handDice[i] != -1) {
                    let temp = this.add.image(xPos, 360, "dice" + String(this.handDice[i]))
                    temp.setInteractive();
                    temp.on('clicked', () => this.moveToSaveDice(i), this);
                    this.imageGroup.add(temp);
                }
                xPos += 100;
            }

            xPos = 150;
            for (let i = 0; i < this.savedDice.length; i++) {
                if (this.savedDice[i] != -1) {
                    let temp = this.add.image(xPos, 540, "dice" + String(this.savedDice[i]));
                    temp.setInteractive();
                    temp.on('clicked', () => this.returnHandDice(i), this);
                    this.imageGroup.add(temp);
                }
                xPos += 100;
            }
            this.drawed = true;
        }
    }

    // 처음으로 초기화
    initThrow() {
        this.throwLeft = 3;
        this.handDice = [-1, -1, -1, -1, -1];
        this.savedDice = [];
        this.dices = [];
        this.checkDice();

        this.drawed = false;
    }

    rollDice() {
        var num = this.handDice.length;
    // 손 안의 주사위 개수만큼 다시 굴림
        if (this.throwLeft > 0) {
            this.throwLeft--;
            this.handDice.length = 0;
            for (let i = 0; i < num; i++) {
                let r = Math.random() * 6 + 1;
                this.handDice.push(Math.floor(r));
            }
            this.checkDice();

            this.drawed = false;
        }
    }

    // 선택한 주사위를 굴릴 주사위에서 제외
    moveToSaveDice(idx) {
        if (idx >= this.handDice.length) return;

        let temp = this.handDice[idx];
        let tempArr = this.handDice;
        tempArr.splice(idx, 1);
        this.handDice = [...tempArr];
        this.savedDice = [...this.savedDice, temp];
        this.drawed = false;
    }

    // 선택한 주사위를 굴릴 주사위로 포함
    returnHandDice(idx) {
        if (idx >= this.savedDice.length) return;

        let temp = this.savedDice[idx];
        let tempArr = this.savedDice;
        tempArr.splice(idx, 1);
        this.savedDice = [...tempArr];
        this.handDice = [...this.handDice, temp];
        this.drawed = false;
    }

    // 현재 나온 주사위로 족보 및 촏이스 계산
    checkDice() {
        this.one = 0;
        this.two = 0;
        this.three = 0;
        this.four = 0;
        this.five = 0;
        this.six = 0;
        this.dices = [...this.handDice, ...this.savedDice];
        for (let i = 0; i < this.dices.length; i++) {
            switch (this.dices[i]) {
                case 1:
                    this.one++;
                    break;
                case 2:
                    this.two++;
                    break;
                case 3:
                    this.three++;
                    break;
                case 4:
                    this.four++;
                    break;
                case 5:
                    this.five++;
                    break;
                case 6:
                    this.six++;
                    break;
                default:
                    break;
            }
        }
        this.choice = this.one + this.two * 2 + this.three * 3 + this.four * 4 + this.five * 5 + this.six * 6;
        this.double = (this.one == 2 || this.two == 2 || this.three == 2 || this.four == 2 || this.five == 2 || this.six == 2);
        this.triple = (this.one == 3 || this.two == 3 || this.three == 3 || this.four == 3 || this.five == 3|| this.six == 3);
        this.quadruple = (this.one == 4 || this.two == 4 || this.three == 4 || this.four == 4 || this.five == 4 || this.six == 4);
        this.quintuple = (this.one == 5 || this.two == 5 || this.three == 5 || this.four == 5 || this.five == 5 || this.six == 5);
        this.smallStraight = ((this.three >= 1 && this.four >= 1) && ((this.one >=1 && this.two >=1) || (this.two>=1 && this.five >= 1) || (this.five>=1 && this.six>=1)));
        this.largeStraight = ((this.two == 1 && this.three == 1 && this.four == 1) && ((this.one == 1 && this.five == 1) || (this.five == 1 && this.six == 1)));
        this.fullHouse = this.double && this.triple;
    }
    
}
