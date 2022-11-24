import Game from '../Game.js';

const Phaser = require('phaser');
const Config = require("../Config");

export default class diceScene extends Phaser.Scene{
    constructor() {
        super("diceScene");
    }

    handDice = [-1, -1, -1, -1, -1];    // 현재 굴릴 주사위 (-1은 굴리지 않은 상황)
    savedDice = [];                     // 굴리지 않을 주사위
    dices = [];                         // 주사위 전체
    throwLeft = 3;                      // 남은 던질 기회
    currentTier = -1;                   // 현재 나온 주사위로 계산된 최대 티어
    bestHand = "";                      // 현재 최고 족보
    predictMin = 0;                        // 예상 초이스값
    predictMax = 0;                        // 예상 초이스값

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
    
    rollable = true;                    // 지금 굴릴 수 있는 상황인지 여부
    

    create(){
        this.rollDiceSound = this.sound.add("rollDice");
        this.tier1Sound = this.sound.add("tier1");
        this.tier2Sound = this.sound.add("tier2");
        this.tier3Sound = this.sound.add("tier3");
        this.tier4Sound = this.sound.add("tier4");

        this.initThrow();
    }                                                                

    update() {
    }

    drawRolling() {
        this.rollDiceSound.play({
            mute: false,
            volume: 0.5,
            rate: 1,
            loop: false
        })
        this.rollable = false;
        document.getElementsByClassName("ui-keepArea")[0].innerHTML = "";
        for (let i = 0; i < this.savedDice.length; i++) {
            document.getElementsByClassName("ui-keepArea")[0].innerHTML += 
            "<div class='ui-dice ui-dice-" + this.savedDice[i] + "'>";
        }

        document.getElementsByClassName("ui-diceArea")[0].innerHTML = "";
        for (let i = 0; i < this.handDice.length; i++) {
            document.getElementsByClassName("ui-diceArea")[0].innerHTML += 
            "<div class='ui-dice ui-dice-animated-" + (i + 1) + "'>";
        }
    }

    drawResult() {
        this.rollDiceSound.stop();

        document.getElementsByClassName("ui-keepArea")[0].innerHTML = "";
        for (let i = 0; i < this.savedDice.length; i++) {
            document.getElementsByClassName("ui-keepArea")[0].innerHTML += 
            "<div class='ui-dice ui-dice-" + this.savedDice[i] + "' pos='keep' idx='" + i + "'>";
        }

        document.getElementsByClassName("ui-diceArea")[0].innerHTML = "";
        for (let i = 0; i < this.handDice.length; i++) {
            document.getElementsByClassName("ui-diceArea")[0].innerHTML += 
            "<div class='ui-dice ui-dice-" + this.handDice[i] + "' pos='hand' idx='" + i + "'>";
        }

        for (let i = 0; i < 5; i++) {
            document.getElementsByClassName("ui-dice")[i].onclick = 
            (e) => {
                let s_el = document.getElementsByClassName("ui-dice")[i];
                if (s_el.attributes.pos.value.startsWith("keep")) this.returnHandDice(parseInt(s_el.attributes.idx.value));
                else this.moveToSaveDice(parseInt(s_el.attributes.idx.value));
            };
        }

        document.getElementsByClassName("ui-choicePredict")[0].innerText = "Possible Choice : " + this.predictMin + " ~ " + this.predictMax;

        // this.checkDice();
        this.rollable = true;
    }
    
    /*
    timeCheck() {
        if (this.leftTime > 0) {
            this.leftTime--;
            document.getElementsByClassName("ui-timelimit-value")[0].innerText = this.leftTime;
            this.time.delayedCall(1000, this.timeCheck, [], this);
        }
    }
    */

    // diceScene 종료
    closeScene() {
        this.scene.stop().resume('gameScene');
    }
    // 처음으로 초기화
    initThrow() {
        this.handDice = [-1, -1, -1, -1, -1];    
        this.savedDice = [];                     
        this.dices = [];                         
        this.throwLeft = 3;                      
        this.currentTier = -1;
        this.predictMin = 5;
        this.predictMax = 30;
        this.itemUsed = false;
    
        this.one = 0;
        this.two = 0;
        this.three = 0;
        this.four = 0;
        this.five = 0;
        this.six = 0;
        
        this.choice = 0;                        
        this.double = 0;                         
        this.triple = 0;                         
        this.quadruple = 0                       
        this.quintuple = 0                       
        this.smallStraight = 0                   
        this.largeStraight = 0
        this.fullHouse = 0;  
        
        this.rollable = true;

        this.rollDice();
    }

    rollDice() {
        var num = this.handDice.length;
    // 손 안의 주사위 개수만큼 다시 굴림
        if (this.throwLeft > 0 && this.rollable) {
            this.throwLeft--;
            this.handDice.length = 0;
            for (let i = 0; i < num; i++) {
                let r = Math.random() * 6 + 1;
                this.handDice.push(Math.floor(r));
            }
            this.drawRolling();
            this.time.delayedCall(1000, () => {
                this.predictChoice();
                this.drawResult();
                this.checkDice();
            }, [], this);
            
            document.getElementsByClassName("ui-rollcount-value")[0].innerText = this.throwLeft;

            if (this.throwLeft == 0) {
                if (!Game.PlayerData[Game.PlayerIndex].items[20] || Game.PlayerData[Game.PlayerIndex].items[20] == 0 || this.itemUsed)
                    document.getElementsByClassName("ui-diceRerollButton")[0].style.color = 'red';
                else   
                    document.getElementsByClassName("ui-diceRerollButton")[0].style.color = 'green';
            }
        }
        else if (this.throwLeft == 0 && this.rollable && !this.itemUsed) {
            Game.Socket.emit("dicePhase-lastChance", {
                playerIndex: Game.PlayerIndex,
            })
        }
    }

    // 가능한 지금 굴리는 추사위로 가능한 초이스값 계산
    predictChoice() {
        let saveSum = this.savedDice.reduce((a, b) => a + b, 0);
        this.predictMin = saveSum + this.handDice.length;
        this.predictMax = saveSum + this.handDice.length * 6;
    }

    // 선택한 주사위를 굴릴 주사위에서 제외
    moveToSaveDice(idx) {
        if (idx >= this.handDice.length) return;
        let temp = this.handDice[idx];
        let tempArr = this.handDice;
        tempArr.splice(idx, 1);
        this.handDice = [...tempArr];
        this.savedDice = [...this.savedDice, temp];
        this.predictChoice();
        this.drawResult();
    }

    // 선택한 주사위를 굴릴 주사위로 포함
    returnHandDice(idx) {
        if (idx >= this.savedDice.length) return;
        let temp = this.savedDice[idx];
        let tempArr = this.savedDice;
        tempArr.splice(idx, 1);
        this.savedDice = [...tempArr];
        this.handDice = [...this.handDice, temp];
        this.predictChoice();
        this.drawResult();
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

        if (this.quintuple) {
            this.currentTier = 1;
            this.bestHand = "Yacht!";
        }
        else if (this.quadruple) {
            this.currentTier = 2;
            this.bestHand = "4 of A Kind";
        }
        else if (this.largeStraight) {
            this.currentTier = 2;
            this.bestHand = "L. Straight";
        }
        else if (this.fullHouse) {
            this.currentTier = 3;
            this.bestHand = "Full House";
        }
        else if (this.smallStraight) {
            this.currentTier = 3;
            this.bestHand = "S. Straight";
        }
        else {
            this.currentTier = 4;
            this.bestHand = "-";
        }

        document.getElementsByClassName("ui-bestHand-value")[0].innerText = this.bestHand;
        document.getElementsByClassName("ui-currentChoice-value")[0].innerText = this.choice;

        switch (this.currentTier) {
            case 1:
                document.getElementsByClassName("ui-bestHand-value")[0].style.color = "#ff1b1b";
                this.tier1Sound.play({
                    mute: false,
                    volume: 0.5 * Game.gameVolume,
                    rate: 1,
                    loop: false
                })
                break;
            case 2:
                document.getElementsByClassName("ui-bestHand-value")[0].style.color = "#ffd700";
                this.tier2Sound.play({
                    mute: false,
                    volume: 0.5 * Game.gameVolume,
                    rate: 1,
                    loop: false 
                })
                break;
            case 3:
                document.getElementsByClassName("ui-bestHand-value")[0].style.color = "#d5d5d5";
                this.tier3Sound.play({
                    mute: false,
                    volume: 0.5 * Game.gameVolume,
                    rate: 1,
                    loop: false
                })
                break;
            default:
                document.getElementsByClassName("ui-bestHand-value")[0].style.color = "#954c4c";
                this.tier4Sound.play({
                    mute: false,
                    volume: 0.5 * Game.gameVolume,
                    rate: 1,
                    loop: false
                })
                break;
        };
    }
    
}
