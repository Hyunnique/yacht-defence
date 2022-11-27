const waveGenerator = require("./GenerateMobWave");

const SpecsheetGen = require('../src/assets/specsheets/mobSpecSheetGen.json');
const ShopItemSheet = require('../src/assets/specsheets/shopItemSheet.json');
const db = require('../schemas');

module.exports = {
    Socket: null,
    latestRoomId: 10000,
    singlePlayerRoomId: 100000,
    Rooms: {},
    socketMap: {},

    init(socket) {
        this.Socket = socket;
        this.createRoom(this.latestRoomId, (process.env.PLAYERS ? process.env.PLAYERS : 4));
        this.connectionHandler();

        /*
        for (let i = 1; i <= 50; i++) {
            console.log("Round " + i + "--");
            console.log("Round Cost : " + this.Rooms[10001].generatorInfo.cost);
            console.log("HPFactor : " + this.Rooms[10001].generatorInfo.hpFactor);

            let result = this.generateWaveInfo(10001);
            this.Rooms[10001].roundInfo.num++;
        }
        */
    },

    createRoom(roomId, maxPlayers) {
        this.Rooms[roomId] = {
            roomId: roomId,
            players: [],
            maxPlayers: maxPlayers,
            timer: {},
            roundInfo: {
                num: 1,
                choice: -1
            },
            generatorInfo: {
                sheet: JSON.parse(JSON.stringify(SpecsheetGen)),
                cost: 20,
                hpFactor: 1
            }
        };
    },

    getRoomId(socketID) {
        return this.socketMap[socketID].roomId;
    },

    getRoomIndex(socketID) {
        return this.socketMap[socketID].roomIndex;
    },

    generateWaveInfo(roomId) {
        let waveResult = waveGenerator(this.Rooms[roomId].generatorInfo.sheet, this.Rooms[roomId].roundInfo.num, this.Rooms[roomId].generatorInfo.cost, this.Rooms[roomId].generatorInfo.hpFactor);

        if (this.Rooms[roomId].roundInfo.num % 10 == 0) {
            this.Rooms[roomId].generatorInfo.cost = Math.floor(this.Rooms[roomId].generatorInfo.cost * 1.3 + (30 * Math.pow(1.06, this.Rooms[roomId].roundInfo.num)));
        } else {
            this.Rooms[roomId].generatorInfo.cost = Math.floor(this.Rooms[roomId].generatorInfo.cost * 1.06 + (30 * Math.pow(1.06, this.Rooms[roomId].roundInfo.num)));
        }

        this.Rooms[roomId].generatorInfo.hpFactor = (this.Rooms[roomId].generatorInfo.hpFactor * 1.055 + (0.05 * Math.pow(1.06, this.Rooms[roomId].roundInfo.num))).toFixed(2);

        this.emitAll(roomId, 'game-wavedata', waveResult);

        return waveResult;
    },

    createTimer(roomId, name, duration, callback) {
        this.Rooms[roomId].timer[name] = setTimeout(() => {
            callback();
            delete this.Rooms[roomId].timer[name];
        }, duration);
    },

    zerofyArray(players, index) {
        if (index == 0) return players;
        else {
            let playersCopy = players.map(x => x);

            [playersCopy[0], playersCopy[index]] = [playersCopy[index], playersCopy[0]];
            return playersCopy;
        }
    },

    zerofyNumber(target, index) {
        if (target == index) return 0;
        else if (index == 0) return target;
        else return index;
    },

    emitAll(roomId, eventName, eventMessage) {
        for (let player of this.Rooms[roomId].players) {
            player.socket.emit(eventName, eventMessage);
        }
    },

    emitAllZerofy(roomId, eventName, eventMessage) {
        for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
            this.Rooms[roomId].players[i].socket.emit(eventName, this.zerofyArray(eventMessage, i));
        }
    },

    connectionHandler() {
        this.Socket.on('connection', (socket) => {
            socket.on('connect-matchmaking', (msg) => {

                let { clientID, name } = msg;

                let currentRoomId;
                
                if (msg.isSinglePlayer) {
                    currentRoomId = this.singlePlayerRoomId++;
                    this.createRoom(currentRoomId, 1);
                } else {
                    currentRoomId = this.latestRoomId;
                }

                let socketRoomIndex = this.Rooms[currentRoomId].players.length;

                this.Rooms[currentRoomId].players.push({ // Initialize Player Object
                    name: name,
                    socket: socket,
                    flags: {},
                    hp: 100,
                    maxhp: 100,
                    dead: false,
                    gold: 0,
                    units: [],
                    items: {},
                    unitTierCount: [0, 0, 0, 0],
                    handCount: {
                        "Yacht!": 0,
                        "4 of A Kind": 0,
                        "L. Straight": 0,
                        "Full House": 0,
                        "S. Straight": 0,
                        "Bull's-Eye": 0,
                        "-": 0
                    },
                    shopBuffs: { 
                        shopAtk: 0,
                        shopPenetration: 0,
                        shopAspd: 0
                    },
                    tierBuffs: [0, 0, 0, 0],
                    currentHand: "",
                    currentHandTier: 3,
                    currentChoice: -1
                });

                this.socketMap[clientID] = {
                    roomId: currentRoomId,
                    roomIndex: socketRoomIndex,
                    matchmaked: (msg.isSinglePlayer ? true : false)
                };

                if (this.Rooms[currentRoomId].players.length == this.Rooms[currentRoomId].maxPlayers) {

                    for (let i = 0; i < this.Rooms[currentRoomId].players.length; i++) {
                        this.socketMap[this.Rooms[currentRoomId].players[i].socket.id].matchmaked = true;
                    }

                    this.emitAll(currentRoomId, 'matchmaking-done', this.currentRoomId);
                    if (!msg.isSinglePlayer) this.createRoom(++(this.latestRoomId), (process.env.PLAYERS ? process.env.PLAYERS : 4)); // 다음 매칭을 위해 미리 방을 생성해둠
                } else {
                    this.emitAll(currentRoomId, 'matchmaking-wait', this.Rooms[currentRoomId].players.length + " / " + this.Rooms[currentRoomId].maxPlayers);
                }

                this.attachEventListeners(socket, currentRoomId);
            });

            socket.on('connect-reconnect', (msg) => {
                
                beforeID = msg.beforeID;
                clientID = socket.id;
                
                if (!this.socketMap[beforeID]) {
                    socket.disconnect();
                    return;
                }

                this.socketMap[clientID] = this.socketMap[beforeID];
                delete this.socketMap[beforeID];

                this.Rooms[this.getRoomId(clientID)].players[this.getRoomIndex(clientID)].socket = socket;

                this.attachEventListeners(socket, this.getRoomId(clientID));
            });

            socket.on('disconnect', () => {
                // disconnected
                if (!this.socketMap[socket.id]) return;
                
                if (!this.socketMap[socket.id].matchmaked) {
                    // 만약 아직 매칭이 안된 상태에서 끊어지면
                    // 큐에서 쫒아내고 삭제

                    this.Rooms[this.getRoomId(socket.id)].players.splice(this.getRoomIndex(socket.id), 1);

                    this.emitAll(this.getRoomId(socket.id), 'matchmaking-wait', this.Rooms[this.getRoomId(socket.id)].players.length + " / " + this.Rooms[this.getRoomId(socket.id)].maxPlayers);
                }
            });
        });
    },

    attachEventListeners(socket, roomId) {
        this.onGameReady(socket, roomId);
        this.onDiceConfirm(socket, roomId);
        this.onDiceResult(socket, roomId);
        this.onBattlePhaseDone(socket, roomId);
        this.onPlayerBaseDamage(socket, roomId);
        this.onShopItemBuy(socket, roomId);
        this.onChatMessage(socket, roomId);
        this.onDiceLastChance(socket, roomId);
        this.onReceiveUnitData(socket, roomId);
    },

    syncPlayerInfo(roomId) {
        this.emitAllZerofy(roomId, 'sync-playerData', this.Rooms[roomId].players.map(x => {
            return {
                "name": x.name,
                "hp": x.hp,
                "maxhp": x.maxhp,
                "dead": x.dead,
                "gold": x.gold,
                "items": x.items,
                "units": x.units,
            }
        }));
    },

    onGameReady(socket, roomId) {
        socket.on('game-ready', (msg) => {
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].flags.gameLoaded = true;

            if (this.Rooms[roomId].players.filter(x => x.flags.gameLoaded).length >= this.Rooms[roomId].players.length) {
                this.roundBegin(roomId);
            }
        });
    },

    roundBegin(roomId) {
        this.syncPlayerInfo(roomId);

        this.emitAll(roomId, 'round-begin', {
            round: this.Rooms[roomId].roundInfo.num,
        });

        this.Rooms[roomId].players.forEach(x => {
            x.flags.handConfirm = false;
            x.flags.handReceived = false;
        });
        
        this.Rooms[roomId].roundInfo.choice = Math.floor(Math.random() * 25) + 5;

        this.emitAll(roomId, 'dicePhase-begin', {
            roundChoice: this.Rooms[roomId].roundInfo.choice,
            timeLimit: 30,
        });

        this.createTimer(roomId, "dicePhaseEnd", 30000, () => {
            this.onDiceTimeEnd(roomId);
        });
    },

    onDiceConfirm(socket, roomId) {
        socket.on('dicePhase-handConfirm', (msg) => {
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].flags.handConfirm++;

            if (this.Rooms[roomId].players.filter(x => x.flags.handConfirm).length >= this.Rooms[roomId].players.length) {
                clearTimeout(this.Rooms[roomId].timer["dicePhaseEnd"]);
                delete this.Rooms[roomId].timer["dicePhaseEnd"];
                this.onDiceTimeEnd(roomId);
            }
            else {
                this.emitAll(roomId, 'dicePhase-confirmWait', this.Rooms[roomId].players.filter(x => x.flags.handConfirm).length + " / " + this.Rooms[roomId].players.length);
            }
        });
    },

    onDiceTimeEnd(roomId) {
        this.emitAll(roomId, 'dicePhase-forceConfirm', true);
    },

    onDiceResult(socket, roomId) {
        socket.on('dicePhase-handInfo', (msg) => {
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].currentHand = msg.hand;
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].currentChoice = msg.choice;
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].currentHandTier = msg.handTier;

            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].flags.handReceived = true;

            if (this.Rooms[roomId].players.filter(x => x.flags.handReceived).length >= this.Rooms[roomId].players.length) {

                // Choice 결과 계산

                let resultArray = [];

                for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
                    resultArray.push({ idx: i, name: this.Rooms[roomId].players[i].name, hand: this.Rooms[roomId].players[i].currentHand, choice: this.Rooms[roomId].players[i].currentChoice, handTier: this.Rooms[roomId].players[i].currentHandTier, choiceDiff: this.Rooms[roomId].players[i].currentChoice - this.Rooms[roomId].roundInfo.choice });
                }

                resultArray.sort((a, b) => {
                    return Math.abs(a.choiceDiff) - Math.abs(b.choiceDiff);
                });

                const choiceRewardByPlayers = [
                    [10],
                    [15, 5],
                    [15, 10, 5],
                    [20, 15, 5, 0]
                ];

                let latestChoiceDiffResult = -1;
                let latestChoiceReward = -1;
                for (let i = 0; i < resultArray.length; i++) {
                    // 동률일 경우 모두 높은 골드로 지급
                    if (latestChoiceDiffResult != -1 && latestChoiceDiffResult == Math.abs(resultArray[i].choiceDiff)) {
                        this.Rooms[roomId].players[resultArray[i].idx].gold += latestChoiceReward;
                        resultArray[i].rewardGold = latestChoiceReward;
                    } else {
                        this.Rooms[roomId].players[resultArray[i].idx].gold += choiceRewardByPlayers[resultArray.length - 1][i];
                        resultArray[i].rewardGold = choiceRewardByPlayers[resultArray.length - 1][i];
                    }

                    latestChoiceDiffResult = Math.abs(resultArray[i].choiceDiff);
                    latestChoiceReward = resultArray[i].rewardGold;
                }

                this.syncPlayerInfo(roomId);

                this.emitAll(roomId, 'dicePhase-result', resultArray);
                this.createTimer(roomId, "dicePhaseResultWait", 5000, () => {
                    this.onPlacePhaseBegin(roomId);
                });
            }
        });
    },

    onPlacePhaseBegin(roomId) {
        this.emitAll(roomId, 'placePhase-begin', {
            timeLimit: 20,
        });

        this.generateWaveInfo(roomId);
        
        this.createTimer(roomId, "placePhaseEnd", 20000, () => {
            this.emitAll(roomId, 'placePhase-end', true);
            this.onBattlePhaseBegin(roomId);
        });
    },

    onBattlePhaseBegin(roomId) {
        this.Rooms[roomId].players.forEach(x => {
            x.flags.battlePhaseDone = false;
        });

        this.emitAll(roomId, 'battlePhase-begin', {
            timeLimit: 0,
        });
    },

    onBattlePhaseDone(socket, roomId) {
        socket.on('battlePhase-done', (msg) => {
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].flags.battlePhaseDone = true;

            if (this.Rooms[roomId].players.filter(x => x.flags.battlePhaseDone).length >= this.Rooms[roomId].players.length) {
                this.emitAll(roomId, 'battlePhase-end', true);
                this.Rooms[roomId].roundInfo.num++;
                this.roundBegin(roomId);
            }
        });
    },

    onPlayerBaseDamage(socket, roomId) {
        socket.on('playerInfo-baseDamage', (msg) => {
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].hp -= msg;
            if (this.Rooms[roomId].players[this.getRoomIndex(socket.id)].hp <= 0) {
                this.Rooms[roomId].players[this.getRoomIndex(socket.id)].hp = 0;
                
                if (!this.Rooms[roomId].players[this.getRoomIndex(socket.id)].dead) this.onPlayerDeath(socket, roomId);
            }
            this.syncPlayerInfo(roomId);
        });
    },

    onShopItemBuy(socket, roomId) {
        socket.on('shop-itemBuy', (msg) => {
            let shopItem = ShopItemSheet["item" + msg.itemIndex];
            if (this.Rooms[roomId].players[this.getRoomIndex(socket.id)].gold >= shopItem.price && !(this.Rooms[roomId].players[this.getRoomIndex(socket.id)].dead)) {
                this.Rooms[roomId].players[this.getRoomIndex(socket.id)].gold -= shopItem.price;

                if (msg.itemIndex == 21) {
                    this.Rooms[roomId].players[this.getRoomIndex(socket.id)].hp = this.Rooms[roomId].players[this.getRoomIndex(socket.id)].hp + 20 > 100 ? 100 : this.Rooms[roomId].players[this.getRoomIndex(socket.id)].hp + 20;
                }
                else if (!this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items[msg.itemIndex]) {
                    this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items[msg.itemIndex] = 1;
                } else {
                    this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items[msg.itemIndex]++;
                }
                socket.emit('shop-itemSuccess', {
                    uiIndex: msg.uiIndex,
                    items: this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items,
                    purchased: msg.itemIndex
                });

                this.syncPlayerInfo(roomId);
            } else {
                socket.emit('shop-itemFailure', msg.uiIndex);
            }
        });
    },

    onChatMessage(socket, roomId) {
        socket.on('chat-message', (msg) => {

            for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
                let chatter = -1;
                if (this.getRoomIndex(socket.id) == i) chatter = 0;
                else if (this.getRoomIndex(socket.id) == 0) chatter = i;
                else chatter = this.getRoomIndex(socket.id);

                this.Rooms[roomId].players[i].socket.emit('chat-message', {
                    playerIndex: chatter,
                    name: this.Rooms[roomId].players[this.getRoomIndex(socket.id)].name + (this.Rooms[roomId].players[this.getRoomIndex(socket.id)].dead ? " (사망)" : ""),
                    message: msg
                });
            }
        });
    }, 

    onDiceLastChance(socket, roomId) {
        socket.on('dicePhase-lastChance', (msg) => {
            if (!this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items[20] || this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items[20] == 0) {
                socket.emit('lastChance-Failure', true);
            }
            else {
                this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items[20]--;
                socket.emit('lastChance-success', {
                    items: this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items
                })
            }
        });
    },

    onReceiveUnitData(socket, roomId) {
        socket.on('player-syncFieldStatus', (msg) => {
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].units = msg.units;
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].shopBuffs = msg.shopBuffs;
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].tierBuffs = msg.tierBuffs;
            this.Rooms[roomId].players[this.getRoomIndex(socket.id)].unitTierCount = msg.tierCnt;

            for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
                if (i == this.getRoomIndex(socket.id)) continue;

                this.Rooms[roomId].players[i].socket.emit('sync-playerFieldStatus', {
                    index: this.zerofyNumber(i, this.getRoomIndex(socket.id)),
                    units: msg.units,
                    items: this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items,
                    shopBuffs: msg.shopBuffs,
                    tierBuffs: msg.tierBuffs,
                    tierCnt: msg.tierCnt,
                });
            }
        });
    },

    onPlayerDeath(socket, roomId) {
        let s_player = this.Rooms[roomId].players[this.getRoomIndex(socket.id)];
        s_player.dead = true;
        

        for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
            this.Rooms[roomId].players[i].socket.emit('player-death', this.zerofyNumber(socket.id, i));
        }

        new db.PlayData({
            name: s_player.name,
            rounds: this.Rooms[roomId].roundInfo.num - 1,
            unit1Tier: s_player.unitTierCount[0],
            unit2Tier: s_player.unitTierCount[1],
            unit3Tier: s_player.unitTierCount[2],
            unit4Tier: s_player.unitTierCount[3],
            handYacht: s_player.handCount["Yacht!"],
            handFourKinds: s_player.handCount["4 of A Kind"],
            handLStraight: s_player.handCount["L. Straight"],
            handFullHouse: s_player.handCount["Full House"],
            handSStraight: s_player.handCount["S. Straight"],
            choiceBullsEye: s_player.handCount["Bull's-Eye"]
        }).save();
    }
};

    