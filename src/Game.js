function importAll(r) {
    let arr = {};
    r.keys().map((item, index) => { arr[item.replace('./', '')] = r(item); });
    return arr;
}

const unitGIF = importAll(require.context("./assets/images/units", false, /\.gif$/));
const icons = importAll(require.context("./assets/images/icons", false, /\.png$/));
import unitSpecSheets from "./assets/specsheets/unitSpecsheet.json";
import itemSpecSheets from "./assets/specsheets/shopItemSheet.json";

const playerColors = ["lightgreen", "lightcoral", "lightskyblue", "lightgoldenrodyellow"];

// 전역변수로 유지해서 Scene에서도 접근할 수 있게 함
var Game = {
    tierColors: [0xff1b1b, 0xffd700, 0xd5d5d5, 0x954c4c],
    tierColorsCss: ["#ff1b1b", "#ffd700", "#d5d5d5", "#954c4c"],
    MatchmakeJoined: false,
    ClientID: null,
    GameObject: null,
    GameConfig: null,
    Socket: null,

    PlayerDataInitiated: false,
    PlayerCount: 4,
    PlayerIndex: -1,
    PlayerData: null,
    ChatMessageTimer: null,
    TimelimitTimer: null,
    currentTimeLimit: 30,
    shopOpen: false,
    wasWatching: 0,
    
    bgmSoundConfig: {
        mute: false,
        volume: 0.2,
        loop: true
    },

    effectSoundConfig: {
        mute: false,
        volume: 0.3
    },

    shopBuff: {
        shopAtk: 0,
        shopPenetration: 0,
        shopAspd: 0
    },

    Initialize(config) {
        this.GameConfig = config;
        

        this.resizeHandler(null);
        window.onresize = this.resizeHandler;
        this.GameObject = new Phaser.Game(this.GameConfig);
        this.showUI("mainScene-default");

        this.Socket = io.connect("http://" + (process.env.HOST ? process.env.HOST : "localhost") + ":8080");
        
        document.getElementsByClassName("multi-matchmaking")[0].onclick = (e) => {
            
            if (!this.MatchmakeJoined) {
                this.MatchmakeJoined = true;
                this.ClientID = this.Socket.id;
                this.Socket.emit("connect-matchmaking", {
                    clientID: this.ClientID,
                    name: document.getElementsByClassName("multi-name")[0].value
                });
                
                this.Socket.io.on('reconnecting', () => {

                });

                this.Socket.io.on('reconnect', () => {
                    console.log("reconnected!");
                    this.Socket.emit('connect-reconnect', {
                        clientID: this.Socket.id,
                        beforeID: this.ClientID
                    });

                    this.ClientID = this.Socket.id;
                });

                this.serverEventHandler();
            }
        };
    },

    serverEventHandler() {
        this.Socket.io.on('connect', () => {
            ;
        });

        this.Socket.on("matchmaking-wait", (msg) => {
            console.log("Waiting for players : " + msg);
        });

        this.Socket.on("matchmaking-done", (msg) => {
            console.log("matchmaking done!");
            this.showScene("PreLoadScene");
            this.TimelimitTimer = setInterval(() => {
                if (this.currentTimeLimit > 0) this.currentTimeLimit--;
                document.getElementsByClassName("ui-phaseTimelimit-value")[0].innerText = this.currentTimeLimit;

                if (this.currentTimeLimit <= 5) document.getElementsByClassName("ui-phaseTimelimit-value")[0].style.color = "red";
                else document.getElementsByClassName("ui-phaseTimelimit-value")[0].style.color = "black";
            }, 1000);
        });

        this.Socket.on("game-defaultData", (msg) => {
            this.PlayerCount = msg.playerCount;
            this.PlayerIndex = msg.playerIndex;
        });

        this.Socket.on("game-wavedata", (msg) => {
            this.GameObject.scene.getScene("gameScene").currentRoundData = msg;
        });

        this.Socket.on("round-begin", (msg) => {
            this.GameObject.scene.getScene("gameScene").roundNum = msg.round;
            document.getElementsByClassName("ui-round-value")[0].innerText = (msg.round < 10 ? "0" + msg.round : msg.round);
        });

        this.Socket.on("chat-message", (msg) => {
            clearTimeout(this.ChatMessageTimer);
            document.getElementsByClassName("ui-chatMessages")[0].style.opacity = "1";
            this.ChatMessageTimer = setTimeout(() => {
                document.getElementsByClassName("ui-chatMessages")[0].style.opacity = "0";
            }, 4000);

            document.getElementsByClassName("ui-chatMessages")[0].innerHTML +=
            "<li class='ui-chatMessageData'><span class='ui-chatMessageData-name text-outline' style='color: " + playerColors[msg.playerIndex] + ";'>" + msg.name + "</span> : " + 
            "<span class='ui-chatMessageData-message text-outline'>" + msg.message + "</span></li>\n";
        });

        this.Socket.on("sync-playerData", (msg) => {
            this.PlayerData = msg;

            if (!this.PlayerDataInitiated) {
                this.PlayerDataInitiated = true;

                for (let i = 0; i < this.PlayerCount; i++) {
                    document.getElementsByClassName("ui-hpArea-playerText")[i].innerHTML = this.PlayerData[i].name;
                    if (i == this.PlayerIndex) {
                        document.getElementsByClassName("ui-hpArea-player")[i].onclick = (e) => {

                            for (let i = 0; i < this.PlayerCount; i++) 
                                //document.getElementsByClassName("ui-hpArea-player")[i].style.border = "none";
                            document.getElementsByClassName("ui-hpArea-player")[i].classList.add("text-outline-gold");

                            this.GameObject.scene.getScene("gameScene").cameras.main.scrollX = 0;
                            this.GameObject.scene.getScene("gameScene").cameras.main.scrollY = 0;
                            this.GameObject.scene.getScene("gameScene").cameras.main.setBounds(0, 0, 2400, 1440);

                            this.GameObject.scene.getScene("gameScene").mapOffsetX = 0;
                            this.GameObject.scene.getScene("gameScene").mapOffsetY = 0;
                        }
                        //document.getElementsByClassName("ui-hpArea-player")[i].style.border = "2px solid white";
                    }
                    else {
                        document.getElementsByClassName("ui-hpArea-player")[i].onclick = (e) => {
                            this.Socket.emit("player-requestUnitData", { playerIndex: i });
                            if (this.wasWatching != i)
                            {
                                this.GameObject.scene.getScene("gameScene").setVisibility(this.wasWatching, false);
                            }
                            this.wasWatching = i;
                            this.GameObject.scene.getScene("gameScene").setVisibility(this.wasWatching, true);
                            for (let i = 0; i < this.PlayerCount; i++) 
                                document.getElementsByClassName("ui-hpArea-player")[i].style.border = "none";
                            document.getElementsByClassName("ui-hpArea-player")[i].style.border = "2px solid gold";

                            this.GameObject.scene.getScene("gameScene").cameras.main.scrollX = 2400 * (i % 2);
                            this.GameObject.scene.getScene("gameScene").cameras.main.scrollY = 1440 * Math.floor(i / 2);
                            this.GameObject.scene.getScene("gameScene").cameras.main.setBounds(2400 * (i % 2), 1440 * Math.floor(i / 2), 2400, 1440);

                            this.GameObject.scene.getScene("gameScene").mapOffsetX = 2400 * (i % 2);
                            this.GameObject.scene.getScene("gameScene").mapOffsetY = 1440 * Math.floor(i / 2);
                        }
                    }
                }

                for (let i = this.PlayerCount; i < 4; i++) {
                    document.getElementsByClassName("ui-hpArea-player")[i].style.visibility = "hidden";
                } 
            }
            for (let i = 0; i < this.PlayerCount; i++) {
                document.getElementsByClassName("ui-hpArea-playerhp-bar")[i].style.width = Math.floor(msg[i].hp / msg[i].maxhp * 100) + "%";
                document.getElementsByClassName("ui-hpArea-playerhp-text")[i].innerHTML = Math.floor(msg[i].hp / msg[i].maxhp * 100) + "%";
            }
            document.getElementsByClassName("ui-gold")[0].innerText = msg[this.PlayerIndex].gold;
        });

        this.Socket.on("player-unitData", (msg) => {
            this.GameObject.scene.getScene("gameScene").removeOtherPlayerUnit();
            this.GameObject.scene.getScene("gameScene").spectate_player = msg;
            this.GameObject.scene.getScene("gameScene").placeOtherPlayerUnit();
        });
        
        this.Socket.on("dicePhase-begin", (msg) => {
            this.showScene("diceScene");

            document.getElementsByClassName("ui-phase-value")[0].innerText = "Dice";
            document.getElementsByClassName("ui-phaseTimelimit-value")[0].innerText = this.currentTimeLimit;
            this.currentTimeLimit = msg.timeLimit;
            document.getElementsByClassName("ui-diceConfirmText")[0].innerText = "-";
            
            document.getElementsByClassName("ui-choiceMessage-value")[0].innerText = msg.roundChoice;
            document.getElementsByClassName("ui-choiceMessage-value")[1].innerText = msg.roundChoice;
            this.showUI("diceScene-default");
        });

        this.Socket.on("dicePhase-confirmWait", (msg) => {
            document.getElementsByClassName("ui-diceConfirmText")[0].innerText = msg;
        });

        this.Socket.on("dicePhase-forceConfirm", (msg) => {
            this.Socket.emit('dicePhase-handInfo', {
                index: this.PlayerIndex,
                hand: this.GameObject.scene.getScene("diceScene").bestHand,
                handTier: this.GameObject.scene.getScene("diceScene").currentTier,
                choice: this.GameObject.scene.getScene("diceScene").choice
            });
        });

        this.Socket.on("dicePhase-result", (msg) => {

            this.diceConfirmed = false;
            
            for (let i = 0; i < 4; i++) {
                document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1].style.display = "none";
            }

            for (let i = 0; i < this.PlayerCount; i++) {
                document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1]
                .getElementsByTagName("td")[1].innerText = msg[i].name;
                document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1]
                .getElementsByTagName("td")[2].innerText = msg[i].choice + "(" + (msg[i].choiceDiff > 0 ? "+" : "") + msg[i].choiceDiff + ")";
                document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1]
                .getElementsByTagName("td")[3].innerText = msg[i].hand;

                switch (msg[i].handTier) {
                    case 1:
                        document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1]
                        .getElementsByTagName("td")[3].style.color = "#ff1b1b";
                        break;
                    case 2:
                        document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1]
                        .getElementsByTagName("td")[3].style.color = "#ffd700";
                        break;
                    case 3:
                        document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1]
                        .getElementsByTagName("td")[3].style.color = "#d5d5d5";
                        break;
                    default:
                        document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1]
                        .getElementsByTagName("td")[3].style.color = "#954c4c";
                        break;
                };

                document.getElementsByClassName("ui-resultTable")[0].getElementsByTagName("tr")[i+1].style.display = "table-row";
            }

            this.hideUI("diceScene-default");
            this.showUI("diceScene-result");

            setTimeout(() => {
                this.hideUI("diceScene-result");
                this.showUI("common-unitReward");

                let currentTier = this.GameObject.scene.getScene("diceScene").currentTier;
                let tier = {
                    "tier1": [2, 22, 24, 26, 27, 35],
                    "tier2": [33, 34, 38, 41, 43, 45, 50, 51, 52, 53, 55, 56],
                    "tier3": [3, 9, 10, 11, 12, 13, 19, 23, 25, 31, 32, 40, 42, 46, 47, 57, 59, 60, 62, 63],
                    "tier4": [0, 1, 4, 5, 6, 7, 8, 14, 15, 16, 17, 18, 20, 21, 28, 29, 30, 36, 37, 39, 44, 48, 49, 54, 58, 61]
                }
                let unitCount = tier["tier" + currentTier].length;
                let unitArray = []; //9

                for (let i = 0; i < 3; i++) {
                    switch (currentTier) {
                        case 1:
                            document.getElementsByClassName("ui-unitReward-unitTitle")[i].style.color = "#ff1b1b";
                            break;
                        case 2:
                            document.getElementsByClassName("ui-unitReward-unitTitle")[i].style.color = "#ffd700";
                            break;
                        case 3:
                            document.getElementsByClassName("ui-unitReward-unitTitle")[i].style.color = "#d5d5d5";
                            break;
                        default:
                            document.getElementsByClassName("ui-unitReward-unitTitle")[i].style.color = "#954c4c";
                            break;
                    }
                }
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
                            unitType = "근거리";
                            break;
                        case 1:
                            unitType = "추적형";
                            break;
                        case 2:
                            unitType = "관통형";
                            break;
                        case 3:
                            unitType = "폭발형";
                            break;
                        case 4:
                            unitType = "지원형";
                            break;
                    }

                    document.getElementsByClassName("ui-unitReward-unitDisplayImage")[i].style.backgroundImage = "url('" + unitGIF["unit_" + unitArray[i] + ".gif"] + "')";
                    document.getElementsByClassName("ui-unitReward-unitTitle")[i].innerText = unitSpecSheets["unit" + unitArray[i]].name;
                    if (unitSpecSheets["unit" + unitArray[i]].name.length >= 13) 
                        document.getElementsByClassName("ui-unitReward-unitTitle")[i].style.fontSize = (1.2 - 0.1*(unitSpecSheets["unit" + unitArray[i]].name.length - 12)) + "rem" 
                    document.getElementsByClassName("ui-unitReward-unitType")[i].innerText = unitType;
                    document.getElementsByClassName("ui-unitReward-unitSpec-atk")[i].innerText = "ATK : " + unitSpecSheets["unit" + unitArray[i]].attack;

                    if (unitSpecSheets["unit" + unitArray[i]].aspd < 0.6) {
                        document.getElementsByClassName("ui-unitReward-unitSpec-aspd")[i].innerText = "SPD : VERY SLOW";
                    }
                    else if (unitSpecSheets["unit" + unitArray[i]].aspd < 0.8) {
                        document.getElementsByClassName("ui-unitReward-unitSpec-aspd")[i].innerText = "SPD : SLOW";
                    }
                    else if (unitSpecSheets["unit" + unitArray[i]].aspd < 1.3) {
                        document.getElementsByClassName("ui-unitReward-unitSpec-aspd")[i].innerText = "SPD : NORMAL"
                    }
                    else if (unitSpecSheets["unit" + unitArray[i]].aspd < 1.6) {
                        document.getElementsByClassName("ui-unitReward-unitSpec-aspd")[i].innerText = "SPD : FAST"
                    }
                    else {
                        document.getElementsByClassName("ui-unitReward-unitSpec-aspd")[i].innerText = "SPD : VERY FAST"
                    }

                    switch (unitSpecSheets["unit" + unitArray[i]].rangeType) {
                        case 0:
                            document.getElementsByClassName("ui-unitReward-unitSpec-range")[i].innerText = "RANGE : VERY SHORT";
                            break;
                        case 1:
                            document.getElementsByClassName("ui-unitReward-unitSpec-range")[i].innerText = "RANGE : SHORT";
                            break;
                        case 2:
                            document.getElementsByClassName("ui-unitReward-unitSpec-range")[i].innerText = "RANGE : MEDIUM";
                            break;
                        case 3:
                            document.getElementsByClassName("ui-unitReward-unitSpec-range")[i].innerText = "RANGE : LONG";
                            break;
                    }
                    document.getElementsByClassName("ui-unitReward-unitSkill")[i].innerText = "";
                    document.getElementsByClassName("ui-unitReward-unit")[i].attributes.idx.value = unitArray[i];
                    document.getElementsByClassName("ui-unitReward-unit")[i].attributes.tier.value = currentTier;
                }
            }, 5000);
        });

        this.Socket.on('placePhase-begin', (msg) => {
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

            this.GameObject.scene.getScene("diceScene").scene.stop().resume("gameScene");
            this.GameObject.scene.getScene("gameScene").toPlacePhase();

            document.getElementsByClassName("ui-phase-value")[0].innerText = "Place";
            document.getElementsByClassName("ui-phaseTimelimit-value")[0].innerText = this.currentTimeLimit;
            this.currentTimeLimit = msg.timeLimit;

            for (let i = 0; i < 3; i++)
                document.getElementsByClassName("ui-shop-item")[i].style.display = "block";
        });

        this.Socket.on('placePhase-end', (msg) => {
            this.Socket.emit('player-unitData', this.GameObject.scene.getScene("gameScene").m_player.map(unit => {
                return {
                    x: unit.x,
                    y: unit.y,
                    id: unit.id
                };
            }));

            this.GameObject.scene.getScene("gameScene").toBattlePhase();
        });

        this.Socket.on('battlePhase-begin', (msg) => {
            document.getElementsByClassName("ui-goldArea")[0].onclick = (e) => {};
            this.hideUI("common-unitReward");
            this.hideUI("common-shop");
            document.getElementsByClassName("ui-phase-value")[0].innerText = "Defense";
            document.getElementsByClassName("ui-phaseTimelimit-value")[0].innerText = this.currentTimeLimit;
            this.currentTimeLimit = msg.timeLimit;
            this.updateMobCounter();
        });

        this.Socket.on('battlePhase-end', (msg) => {
            // ?
        });

        this.Socket.on('shop-itemSuccess', (msg) => {
            let soundidx = Math.floor(Math.random() * 3);

            this.GameObject.scene.getScene("gameScene").shopBuySound[soundidx].play(this.effectSoundConfig);
            
            

            this.hideUI("unitInfoArea");
            document.getElementsByClassName("ui-shop-item")[msg.uiIndex].style.display = "none";

            this.updateItemUI(msg);

            this.shopBuff.shopAtk += itemSpecSheets["item" + msg.purchased].buffAtk;
            this.shopBuff.shopAspd += itemSpecSheets["item" + msg.purchased].buffAspd;
            this.shopBuff.shopPenetration += itemSpecSheets["item" + msg.purchased].buffPenetration;

            this.GameObject.scene.getScene("gameScene").resetBuff();
            
            document.getElementsByClassName("ui-itemOverallArea-overall-atk")[0].innerText = "ATK: " + (this.shopBuff.shopAtk >= 0 ? "+" + this.shopBuff.shopAtk : this.shopBuff.shopAtk) + "%";
            document.getElementsByClassName("ui-itemOverallArea-overall-aspd")[0].innerText = "SPD: " + (this.shopBuff.shopAspd >= 0 ? "+" + this.shopBuff.shopAspd : this.shopBuff.shopAspd) + "%";
            document.getElementsByClassName("ui-itemOverallArea-overall-pen")[0].innerText = "PEN: " + (this.shopBuff.shopPenetration >= 0 ? "+" + this.shopBuff.shopPenetration : this.shopBuff.shopPenetration) + "%p";
        });

        this.Socket.on('shop-itemFailure', (msg) => {
            this.GameObject.scene.getScene("gameScene").shopBuyFail.play(this.effectSoundConfig);
        });

        this.Socket.on('lastChance-success', (msg) => {
            this.updateItemUI(msg);

            this.GameObject.scene.getScene("diceScene").itemUsed = true;
            this.GameObject.scene.getScene("diceScene").throwLeft++;
            this.GameObject.scene.getScene("diceScene").rollDice();
        })

        this.Socket.on('lastChance-Failure', (msg) => {
            
        })
    },

    onPreloadDone() {
        this.Socket.emit("game-ready", true);
    },

    resizeHandler(e) { // 2:1의 비율을 유지하면서 보여줄 수 있는 최대의 크기로 게임 출력
        if (window.innerWidth <= window.innerHeight * 2) {
            document.getElementById("ui-container").style.width = "90vw";
            document.getElementById("ui-container").style.height = "45vw";
        }
        else {
            document.getElementById("ui-container").style.width = "180vh";
            document.getElementById("ui-container").style.height = "90vh";
        }

        // 실제 게임 스크린 Width의 1%로 rem 지정해줌
        document.getElementsByTagName("html")[0].style.fontSize = (document.getElementById("ui-container").offsetWidth / 100) + "px";
    },

    showScene(sceneName) {
        switch (sceneName) {
            case "diceScene":
                this.GameObject.scene.getScene("gameScene").toDicePhase();
                this.clearUI();
                this.shopOpen = false;
                this.showUI("gameScene-topFloating");
                this.showUI("gameScene-midFloating");
                this.showUI("gameScene-bottomFloating");

                document.getElementsByClassName("ui-diceRerollButton")[0].style.color = 'black';
                document.getElementsByClassName("ui-diceRerollButton")[0].onclick = (e) => {
                    this.Socket.emit("dicePhase-start", "true");
                    this.GameObject.scene.getScene("diceScene").rollDice();
                }

                Array.from(document.getElementsByClassName("ui-unitReward-unit")).forEach((e) => {
                    e.onclick = (g) => {
                        this.GameObject.scene.getScene("gameScene").receiveUnit(parseInt(e.attributes.idx.value), parseInt(e.attributes.tier.value));
                        this.hideUI("common-unitReward");
                    };
                });

                // DicePhase - 주사위 확정 버튼 누르면
                document.getElementsByClassName("ui-diceConfirmButton")[0].onclick = (e) => {
                    if (!this.diceConfirmed) {
                        this.diceConfirmed = true;
                        this.Socket.emit('dicePhase-handConfirm', true);
                    }
                }
                break;
            case "gameScene":
                this.GameObject.scene.start(sceneName);
                this.clearUI();
                this.showUI("gameScene-topFloating");
                this.showUI("gameScene-bottomFloating");

                document.onkeydown = (e) => {
                    // console.log(e);
                    if (e.key == "Enter") {
                        if (document.activeElement === document.getElementsByClassName("ui-chatInput")[0]) {
                            if (document.getElementsByClassName("ui-chatInput")[0].value.trim() != "") {
                                this.Socket.emit('chat-message', {
                                    playerIndex: this.PlayerIndex,
                                    message: document.getElementsByClassName("ui-chatInput")[0].value
                                });
                            }

                            document.getElementsByClassName("ui-chatInput")[0].value = "";
                                document.getElementsByClassName("ui-chatInput")[0].style.backgroundColor = "rgba(255, 255, 255, 0)";
                            document.activeElement.blur();
                        } else {
                            document.getElementsByClassName("ui-chatInput")[0].focus();
                            document.getElementsByClassName("ui-chatInput")[0].style.backgroundColor = "rgba(255, 255, 255, 0.4)";
                            
                            document.getElementsByClassName("ui-chatMessages")[0].style.opacity = "1";
                        }
                    } else if (e.key == " ") {
                        if (document.activeElement === document.getElementsByClassName("ui-chatInput")[0]) {
                            document.getElementsByClassName("ui-chatInput")[0].value += " ";
                        }
                    }
                }
                break;
            default:
                this.GameObject.scene.start(sceneName);
                //this.showUI(sceneName + "-default");
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
        this.GameObject.scene.getScene("gameScene").shopSound.play(this.effectSoundConfig);
        let itemArray = this.GameObject.scene.getScene("gameScene").itemList;

        for (let i = 0; i < 3; i++) {
            let itemType = itemSpecSheets["item" + itemArray[i]].itemType;
            document.getElementsByClassName("ui-shop-itemDisplayImage")[i].style.backgroundImage = "url('" + icons["icon" + itemSpecSheets["item" + itemArray[i]].icon + ".png"] + "')";
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
                    break;
                case 1:
                    document.getElementsByClassName("ui-shop-itemType")[i].innerText = "특수 몬스터";
                    document.getElementsByClassName("ui-shop-itemSpec-atk")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSpec-aspd")[i].innerText = "보스 몬스터를 상대에게 소환";
                    document.getElementsByClassName("ui-shop-itemSpec-range")[i].innerText = "";
                    break;
                case 2:
                    document.getElementsByClassName("ui-shop-itemType")[i].innerText = "일반 몬스터";
                    document.getElementsByClassName("ui-shop-itemSpec-atk")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSpec-aspd")[i].innerText = "몬스터를 상대에게 소환";
                    document.getElementsByClassName("ui-shop-itemSpec-range")[i].innerText = "";
                    break;
                    
                case 6:
                    document.getElementsByClassName("ui-shop-itemType")[i].innerText = "보유 아이템";
                    document.getElementsByClassName("ui-shop-itemSpec-atk")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSpec-aspd")[i].innerText = "남은 기회가 0 일때";
                    document.getElementsByClassName("ui-shop-itemSpec-range")[i].innerText = "한번 더 굴립니다";
                    break;
                case 7:
                    document.getElementsByClassName("ui-shop-itemType")[i].innerText = "자동 사용 아이템";
                    document.getElementsByClassName("ui-shop-itemSpec-atk")[i].innerText = "";
                    document.getElementsByClassName("ui-shop-itemSpec-aspd")[i].innerText = "체력을 20% 회복";
                    document.getElementsByClassName("ui-shop-itemSpec-range")[i].innerText = "";
            }
            document.getElementsByClassName("ui-shop-itemSkill")[i].innerText = "PRICE : " + itemSpecSheets["item" + itemArray[i]].price;
            document.getElementsByClassName("ui-shop-item")[i].attributes.idx.value = itemArray[i];
            document.getElementsByClassName("ui-shop-item")[i].onclick = (e) => {
                this.Socket.emit("shop-itemBuy", {
                    playerIndex: this.PlayerIndex,
                    itemIndex: itemArray[i],
                    uiIndex: i
                });
            }
        }
    },

    closeShop() {
        this.hideUI("common-shop");
    },

    hitPlayerBase(damage) {
        this.Socket.emit("playerInfo-baseDamage", {
            index: this.PlayerIndex,
            damage,
        });
    },

    updateItemUI(msg) {
        let myItemUI = document.getElementsByClassName("ui-itemArea-itemList")[0];
        myItemUI.innerHTML = "";

        // itemType 0, 6만 패시브 아이템임
        Object.keys(msg.items)
        .filter((key) => [0, 6].includes(itemSpecSheets["item" + key].itemType))
        .forEach((key) => {
            if (msg.items[key] > 0)
                myItemUI.innerHTML += "<li class='ui-itemArea-itemList-item' idx=" + key + ">" + msg.items[key] + "</li>"
        })

        Array.from(document.getElementsByClassName("ui-itemArea-itemList-item")).forEach((e) => {
            e.style.backgroundImage = "url('" + icons["icon" + itemSpecSheets["item" + e.attributes["idx"].value].icon + ".png"] + "')";
        })
    },

    updateMobCounter() {
        document.getElementsByClassName("ui-monsterCount-value")[0].innerText = this.GameObject.scene.getScene("gameScene").mobCounter;
    },

    showUnitInfo(unit) {
        this.showUI("unitInfoArea");
        
        let unitType = "";
        switch (unitSpecSheets["unit" + unit.id].unitType) {
            case 0:
                unitType = "근거리";
                break;
            case 1:
                unitType = "추적형";
                break;
            case 2:
                unitType = "관통형";
                break;
            case 3:
                unitType = "폭발형";
                break;
            case 4:
                unitType = "지원형";
                break;
        }

        document.getElementsByClassName("ui-unitInfoArea-unitImage")[0].style.backgroundImage = "url('" + unitGIF["unit_" + unit.id + ".gif"] + "')";
        document.getElementsByClassName("ui-unitInfoArea-unitName")[0].innerText = unitSpecSheets["unit" + unit.id].name;
        document.getElementsByClassName("ui-unitInfoArea-unitName")[0].style.color = this.tierColorsCss[unit.tier - 1];
        document.getElementsByClassName("ui-unitInfoArea-unitAtk-value")[0].innerText = Math.floor(unit.attack);
        document.getElementsByClassName("ui-unitInfoArea-unitAspd-value")[0].innerText = unit.aspd.toFixed(2);
        document.getElementsByClassName("ui-unitInfoArea-unitRange-value")[0].innerText = Math.floor(unit.range);
        document.getElementsByClassName("ui-unitInfoArea-unitPenetration-value")[0].innerText = Math.floor(unit.penetration * 100) + "%";
        document.getElementsByClassName("ui-unitInfoArea-unitAttackType")[0].innerText = unitType;
    },

    hideUnitInfo() {
        this.hideUI("unitInfoArea");
    }
};

export default Game;    

