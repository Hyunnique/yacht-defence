function importAll(r) {
    let arr = {};
    r.keys().map((item, index) => { arr[item.replace('./', '')] = r(item); });
    return arr;
}

const unitGIF = importAll(require.context("./assets/images/units", false, /\.gif$/));
import unitSpecSheets from "./assets/specsheets/unitSpecsheet.json";
import itemSpecSheets from "./assets/specsheets/shopItemSheet.json";

// 전역변수로 유지해서 Scene에서도 접근할 수 있게 함
var Game = {
    GameObject: null,
    GameConfig: null,
    Socket: null,
    shopOpen: false,
    
    Initialize(config) {
        this.GameConfig = config;

        this.resizeHandler(null);
        window.onresize = this.resizeHandler;

        this.Socket = io.connect("http://localhost:8080");
        this.serverEventHandler();
    },

    serverEventHandler() {
        this.Socket.on("matchmaking-wait", (msg) => {
            console.log("Waiting for players : " + msg);
        });

        this.Socket.on("matchmaking-done", (msg) => {
            console.log("matchmaking done!");
            this.GameObject = new Phaser.Game(this.GameConfig);
        });

        this.Socket.on("dicePhase-begin", (msg) => {
            document.getElementsByClassName("ui-choiceMessage-value")[0].innerText = msg.roundChoice;
            document.getElementsByClassName("ui-choiceMessage-value")[1].innerText = msg.roundChoice;
            this.showUI("diceScene-default");
        });
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
                this.Socket.emit("game-ready", true);
                this.clearUI();
                this.showUI("gameScene-topFloating");
                this.showUI("gameScene-bottomFloating");

                document.getElementsByClassName("ui-goldArea")[0].onclick = (e) => {};
                document.getElementsByClassName("ui-diceRerollButton")[0].onclick = (e) => {
                    this.Socket.emit("dicePhase-start", "true");
                    this.GameObject.scene.getScene("diceScene").rollDice();
                }

                Array.from(document.getElementsByClassName("ui-unitReward-unit")).forEach((e) => {
                    e.onclick = (g) => {
                        this.GameObject.scene.getScene("gameScene").receiveUnit(parseInt(e.attributes.idx.value));
                        this.hideUI("common-unitReward");
                        this.GameObject.scene.getScene("diceScene").scene.stop().resume("gameScene");
                        document.getElementsByClassName("ui-goldArea")[0].onclick = (e) => {
                            if (!this.shopOpen) {
                                this.openShop();
                                this.shopOpen = true;
                            }
                        }
                        document.getElementsByClassName("ui-shop-close")[0].onclick = (e) => {
                            this.closeShop();
                            this.shopOpen = false;
                        }
                    };
                });

                document.getElementsByClassName("ui-diceConfirmButton")[0].onclick = (e) => {
                    // 임시로 확정 버튼 누르면 바로 다음 단계 진행
                    
                    this.hideUI("diceScene-default");
                    this.showUI("diceScene-result");

                    setTimeout(() => {
                        this.hideUI("diceScene-result");
                        this.showUI("common-unitReward");

                        let currentTier = this.GameObject.scene.getScene("diceScene").currentTier;
                        let tier = {
                            "tier1": [2, 22, 26, 27],
                            "tier2": [24, 33, 34, 35, 38, 41, 43, 45, 50, 51, 55, 56],
                            "tier3": [3, 9, 10, 11, 13, 19, 23, 25, 31, 32, 40, 47, 52, 53, 57, 59, 60, 62, 63],
                            "tier4": [0, 1, 4, 5, 6, 7, 8, 14, 15, 16, 17, 18, 20, 21, 28, 29, 30, 36, 37, 39, 42, 44, 46 ,48, 49, 54, 58, 61]
                        }
                        let unitCount = tier["tier" + currentTier].length;
                        let unitArray = [];

                        for (let i = 0; i < 3; i++) {
                            while (true) {
                                let _r = Math.floor(Math.random() * unitCount);
                                let unitNo = tier["tier" + currentTier][_r];
                                if (!unitArray.includes(unitNo)) {
                                    unitArray.push(unitNo);
                                    break;
                                }
                            }
                        }

                        for (let i = 0; i < 3; i++) {
                            let unitType = ""
                            switch (unitSpecSheets["unit" + unitArray[i]].unitType) {
                                case 0:
                                    unitType = "공격형";
                                    break;
                                case 1:
                                    unitType = "밸런스형";
                                    break;
                                case 2: 
                                    unitType = "속도형";
                                    break;
                                case 3:
                                    unitType = "지원형";
                                    break;
                            }   
                            console.log(unitSpecSheets["unit" + unitArray[i]].name.length);
                            document.getElementsByClassName("ui-unitReward-unitDisplayImage")[i].style.backgroundImage = "url('" + unitGIF["unit_" + unitArray[i] + ".gif"] + "')";
                            document.getElementsByClassName("ui-unitReward-unitTitle")[i].innerText = unitSpecSheets["unit" + unitArray[i]].name;
                            if (unitSpecSheets["unit" + unitArray[i]].name.length >= 13) 
                                document.getElementsByClassName("ui-unitReward-unitTitle")[i].style.fontSize = (1.2 - 0.1*(unitSpecSheets["unit" + unitArray[i]].name.length - 12)) + "rem" 
                            document.getElementsByClassName("ui-unitReward-unitType")[i].innerText = unitType;
                            document.getElementsByClassName("ui-unitReward-unitSpec-atk")[i].innerText = "ATK : " + unitSpecSheets["unit" + unitArray[i]].attack;
                            document.getElementsByClassName("ui-unitReward-unitSpec-aspd")[i].innerText = "SPD : " + unitSpecSheets["unit" + unitArray[i]].aspd;
                            document.getElementsByClassName("ui-unitReward-unitSpec-range")[i].innerText = "RANGE : " + unitSpecSheets["unit" + unitArray[i]].range;
                            document.getElementsByClassName("ui-unitReward-unitSkill")[i].innerText = "";

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

    openShop() {
        this.showUI("common-shop");
        let itemArray = this.GameObject.scene.getScene("gameScene").itemList;

        for (let i = 0; i < 3; i++) {
            let itemType = itemSpecSheets["item" + itemArray[i]].itemType;
            document.getElementsByClassName("ui-shop-itemDisplayImage")[i].style.backgroundImage = "";
            document.getElementsByClassName("ui-shop-itemTitle")[i].innerText = itemSpecSheets["item" + itemArray[i]].name;

            let buffAtk = itemSpecSheets["item" + itemArray[i]].buffAtk;
            let buffAspd = itemSpecSheets["item" + itemArray[i]].buffAspd;
            let buffPenetration = itemSpecSheets["item" + itemArray[i]].buffPenetration;

            switch (itemType) {
                case 0:
                    document.getElementsByClassName("ui-shop-itemType")[i].innerText = "유닛 강화";
                    document.getElementsByClassName("ui-shop-itemSpec-atk")[i].innerText = "ATK : " + (buffAtk == 0 ? "-" : buffAtk + "%");
                    document.getElementsByClassName("ui-shop-itemSpec-aspd")[i].innerText = "SPD : " + (buffAspd == 0 ? "-" : buffAspd + "%");
                    document.getElementsByClassName("ui-shop-itemSpec-range")[i].innerText = "PEN : " + (buffPenetration == 0 ? "-" : buffPenetration + "%");
                    document.getElementsByClassName("ui-shop-itemSkill")[i].innerText = "";
                    break;
                case 1:
                    document.getElementsByClassName("ui-shop-itemType")[i].innerText = "특수 몬스터";
                    document.getElementsByClassName("ui-shop-itemSpec-atk")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSpec-aspd")[i].innerText = "보스 몬스터를 상대에게 소환";
                    document.getElementsByClassName("ui-shop-itemSpec-range")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSkill")[i].innerText = "";
                    break;
                case 2:
                    document.getElementsByClassName("ui-shop-itemType")[i].innerText = "일반 몬스터";
                    document.getElementsByClassName("ui-shop-itemSpec-atk")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSpec-aspd")[i].innerText = "몬스터를 상대에게 소환";
                    document.getElementsByClassName("ui-shop-itemSpec-range")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSkill")[i].innerText = "";
            }
            document.getElementsByClassName("ui-shop-item")[i].attributes.idx.value = itemArray[i];
        }
    },

    closeShop() {
        this.hideUI("common-shop");
    }
};

export default Game;