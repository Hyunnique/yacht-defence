function importAll(r) {
    let arr = {};
    r.keys().map((item, index) => { arr[item.replace('./', '')] = r(item); });
    return arr;
}

const unitGIF = importAll(require.context("./assets/images/units", false, /\.gif$/));
import unitSpecSheets from "./assets/specsheets/unitSpecsheet.json";

// 전역변수로 유지해서 Scene에서도 접근할 수 있게 함
var Game = {
    GameObject: null,
    Socket: null,
    
    Initialize(config) {
        this.GameObject = new Phaser.Game(config);

        this.resizeHandler(null);
        window.onresize = this.resizeHandler;

        this.Socket = io.connect("http://localhost:8080");
    },

    resizeHandler(e) { // 2:1의 비율을 유지하면서 보여줄 수 있는 최대의 크기로 게임 출력
        if (window.innerWidth <= window.innerHeight * 2) {
            document.getElementById("ui-container").style.width = "100vw";
            document.getElementById("ui-container").style.height = "50vw";
        }
        else {
            document.getElementById("ui-container").style.width = "200vh";
            document.getElementById("ui-container").style.height = "100vh";
        }

        // 실제 게임 스크린 Width의 1%로 rem 지정해줌
        document.getElementsByTagName("html")[0].style.fontSize = (document.getElementById("ui-container").offsetWidth / 100) + "px";
    },

    showScene(sceneName) {
        switch (sceneName) {
            case "diceScene":
                this.clearUI();
                this.showUI("gameScene-topFloating");
                this.showUI("gameScene-bottomFloating");
                this.showUI("diceScene-default");

                document.getElementsByClassName("ui-diceRerollButton")[0].onclick = (e) => {
                    this.GameObject.scene.getScene("diceScene").rollDice();
                }

                Array.from(document.getElementsByClassName("ui-unitReward-unit")).forEach((e) => {
                    e.onclick = (g) => {
                        this.GameObject.scene.getScene("gameScene").receiveUnit(parseInt(e.attributes.idx.value));
                        this.hideUI("common-unitReward");
                        this.GameObject.scene.getScene("diceScene").scene.stop().resume("gameScene");
                    };
                });

                document.getElementsByClassName("ui-diceConfirmButton")[0].onclick = (e) => {
                    // 임시로 확정 버튼 누르면 바로 다음 단계 진행
                    
                    this.hideUI("diceScene-default");
                    this.showUI("diceScene-result");

                    setTimeout(() => {
                        this.hideUI("diceScene-result");
                        this.showUI("common-unitReward");

                        let unitCount = Object.keys(unitSpecSheets).length;
                        let unitArray = [];

                        for (let i = 0; i < 3; i++) {
                            while (true) {
                                let _r = Math.floor(Math.random() * unitCount);
                                if (!unitArray.includes(_r)) {
                                    unitArray.push(_r);
                                    break;
                                }
                            }
                        }

                        for (let i = 0; i < 3; i++) {
                            document.getElementsByClassName("ui-unitReward-unitDisplayImage")[i].style.backgroundImage = "url('" + unitGIF["unit_" + unitArray[i] + ".gif"] + "')";
                            document.getElementsByClassName("ui-unitReward-unitTitle")[i].innerText = unitSpecSheets["unit" + unitArray[i]].idleSprite;
                            document.getElementsByClassName("ui-unitReward-unitType")[i].innerText = "?";
                            document.getElementsByClassName("ui-unitReward-unitSpec-atk")[i].innerText = "ATK : " + unitSpecSheets["unit" + unitArray[i]].attack;
                            document.getElementsByClassName("ui-unitReward-unitSpec-aspd")[i].innerText = "SPD : " + unitSpecSheets["unit" + unitArray[i]].aspd;
                            document.getElementsByClassName("ui-unitReward-unitSpec-range")[i].innerText = "RANGE : " + unitSpecSheets["unit" + unitArray[i]].range;
                            document.getElementsByClassName("ui-unitReward-unitSkill")[i].innerText = "Skills : -";

                            document.getElementsByClassName("ui-unitReward-unit")[i].attributes.idx.value = unitArray[i];
                        }
                    }, 3000);
                }
                break;
            case "gameScene":
                this.GameObject.scene.start(sceneName);
                this.clearUI();
                this.showUI("gameScene-topFloating");
                this.showUI("gameScene-bottomFloating");
                break;
            default:
                this.GameObject.scene.start(sceneName);
                this.showUI(sceneName + "-default");
                break;
        }
    },

    clearUI() {
        let sheets = document.getElementsByClassName("ui-sheet");
        for (let i=0; i<sheets.length; i++) {
            sheets[i].style.display = "none";
        }
    },

    showUI(uiName) {
        document.getElementsByClassName("ui-" + uiName)[0].style.display = "block";
    },

    hideUI(uiName) {
        document.getElementsByClassName("ui-" + uiName)[0].style.display = "none";
    },
};

export default Game;