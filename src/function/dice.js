export default class Dice {
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
    double = false;                         // 같은 눈 2개
    triple = false;                         // 같은 눈 3개
    quadruple = false;                       // 같은 눈 4개
    quintuple = false;                       // 같은 눈 5개
    smallStraight = false;                   
    largeStraight = false;
    fullHouse = false;                      // 특수 족보 유무
    

    throwLeft = 3;                      // 남은 던질 기회

    leftText;
    choiceText;
    bestScore;
    testText;

    // 손 안의 주사위 개수만큼 다시 굴림
    rollDice(dicesKept) {
        var throwLeft = 5 - dicesKept.length;
        while (throwLeft--) 
            dicesKept.push(Math.floor(Math.random() * 6 + 1));
        this.checkDice(dicesKept);
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

    // 현재 나온 주사위로 족보 및 촏이스 계산
    checkDice(dices) {
        this.one = 0;
        this.two = 0;
        this.three = 0;
        this.four = 0;
        this.five = 0;
        this.six = 0;
        for (let i = 0; i < dices.length; i++) {
            switch (dices[i]) {
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
