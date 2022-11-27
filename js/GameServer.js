const waveGenerator = require("./GenerateMobWave");

const SpecsheetGen = require('../src/assets/specsheets/mobSpecSheetGen.json');
const Specsheet = require('../src/assets/specsheets/mobSpecsheet.json');
const ShopItemSheet = require('../src/assets/specsheets/shopItemSheet.json');
const { Layer } = require("koa-router");

module.exports = {
    Socket: null,
    latestRoomId: 10000,
    Rooms: {},
    socketMap: {},

    init(socket) {
        this.Socket = socket;
        this.createRoom();
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

    createRoom() {
        this.latestRoomId++;

        this.Rooms[this.latestRoomId] = {
            roomId: this.latestRoomId,
            players: [],
            maxPlayers: (process.env.PLAYERS ? parseInt(process.env.PLAYERS) : 1), // Configurable for development or singleplayer
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

                let currentRoomId = this.latestRoomId;
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
                    roomIndex: socketRoomIndex
                };

                if (this.Rooms[currentRoomId].players.length == this.Rooms[currentRoomId].maxPlayers) {
                    this.emitAll(currentRoomId, 'matchmaking-done', this.currentRoomId);
                    this.createRoom(); // 다음 매칭을 위해 미리 방을 생성해둠
                } else {
                    this.emitAll(currentRoomId, 'matchmaking-wait', this.Rooms[currentRoomId].players.length);
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
                    if (latestChoiceDiffResult != -1 && latestChoiceDiffResult == resultArray[i].choiceDiff) {
                        this.Rooms[roomId].players[resultArray[i].idx].gold += latestChoiceReward;
                        resultArray[i].rewardGold = latestChoiceReward;
                    } else {
                        this.Rooms[roomId].players[resultArray[i].idx].gold += choiceRewardByPlayers[resultArray.length - 1][i];
                        resultArray[i].rewardGold = choiceRewardByPlayers[resultArray.length - 1][i];
                    }

                    latestChoiceDiffResult = resultArray[i].choiceDiff;
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
                this.Rooms[roomId].players[this.getRoomIndex(socket.id)].dead = true;
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

            for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
                if (i == this.getRoomIndex(socket.id)) continue;

                this.Rooms[roomId].players[i].socket.emit('sync-playerFieldStatus', {
                    index: this.zerofyNumber(i, this.getRoomIndex(socket.id)),
                    units: msg.units,
                    items: this.Rooms[roomId].players[this.getRoomIndex(socket.id)].items,
                    shopBuffs: msg.shopBuffs,
                    tierBuffs: msg.tierBuffs
                });
            }
        });
    }
};

    