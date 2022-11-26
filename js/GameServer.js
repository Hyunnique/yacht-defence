const waveGenerator = require("./GenerateMobWave");

const SpecsheetGen = require('../src/assets/specsheets/mobSpecSheetGen.json');
const Specsheet = require('../src/assets/specsheets/mobSpecsheet.json');
const ShopItemSheet = require('../src/assets/specsheets/shopItemSheet.json');

module.exports = {
    Socket: null,
    latestRoomId: 10000,
    Rooms: {},
    socketMap: {},

    init(socket) {
        this.Socket = socket;
        this.createRoom();
        this.connectionHandler();

        /* 난이도 계수 테스트
        for (let i = 1; i <= 50; i++) {
            console.log("Round " + i + "--");
            console.log("Round Cost : " + this.Rooms[10001].generatorRoundCost);
            console.log("HPFactor : " + this.Rooms[10001].generatorHpFactor);

            let result = this.generateWaveInfo(10001);
            this.Rooms[10001].round++;
        }
        */
    },

    createRoom() {
        this.latestRoomId++;

        this.Rooms[this.latestRoomId] = {
            roomId: this.latestRoomId,
            players: [],
            counter: { ready: 0, connect: 0 },
            maxPlayers: (process.env.PLAYERS ? parseInt(process.env.PLAYERS) : 1), // Configurable for development or singleplayer
            timer: {},
            round: 1,
            roundChoice: -1,
            generatorSheet: JSON.parse(JSON.stringify(SpecsheetGen)),
            generatorRoundCost: 20,
            generatorHpFactor: 1
        };
    },

    generateWaveInfo(roomId) {
        let waveResult = waveGenerator(this.Rooms[roomId].generatorSheet, this.Rooms[roomId].round, this.Rooms[roomId].generatorRoundCost, this.Rooms[roomId].generatorHpFactor);

        this.Rooms[roomId].generatorHpFactor = (this.Rooms[roomId].generatorHpFactor * 1.065).toFixed(2);

        if (this.Rooms[roomId].round % 10 == 0) {
            this.Rooms[roomId].generatorRoundCost = Math.floor(this.Rooms[roomId].generatorRoundCost * 1.35);
        } else {
            this.Rooms[roomId].generatorRoundCost = Math.floor(this.Rooms[roomId].generatorRoundCost * 1.07 + 15);
        }

        this.emitAll(roomId, 'game-wavedata', waveResult);

        return waveResult;
    },

    createTimer(roomId, name, duration, callback) {
        this.Rooms[roomId].timer[name] = setTimeout(() => {
            callback();
            delete this.Rooms[roomId].timer[name];
        }, duration);
    },

    emitAll(roomId, eventName, eventMessage) {
        for (let player of this.Rooms[roomId].players) {
            player.socket.emit(eventName, eventMessage);
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
                    playerIndex: socketRoomIndex,
                    hp: 100,
                    maxhp: 100,
                    gold: 0,
                    units: {},
                    items: {},
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

                this.Rooms[this.socketMap[clientID].roomId].players[this.socketMap[clientID].roomIndex].socket = socket;

                this.attachEventListeners(socket, this.socketMap[clientID].roomId);
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
        this.onRequestUnitData(socket, roomId);
    },

    onGameReady(socket, roomId) {
        socket.on('game-ready', (msg) => {
            this.Rooms[roomId].counter.ready++;

            if (this.Rooms[roomId].counter.ready >= this.Rooms[roomId].maxPlayers) {

                for (let i = 0; i < this.Rooms[roomId].maxPlayers; i++) {
                    this.Rooms[roomId].players[i].socket.emit('game-defaultData', {
                        playerCount: this.Rooms[roomId].maxPlayers,
                        playerIndex: i
                    });
                }

                this.onRoundBegin(roomId);
            }
        });
    },

    onRoundBegin(roomId) {
        this.syncPlayerInfo(roomId);

        this.emitAll(roomId, 'round-begin', {
            round: this.Rooms[roomId].round,
        });

        this.Rooms[roomId].counter.handConfirm = 0;
        this.Rooms[roomId].counter.handReceived = 0;

        this.Rooms[roomId].roundChoice = Math.floor(Math.random() * 25) + 5;

        this.emitAll(roomId, 'dicePhase-begin', {
            roundChoice: this.Rooms[roomId].roundChoice,
            timeLimit: 30,
        });

        this.createTimer(roomId, "dicePhaseEnd", 30000, () => {
            this.onDiceTimeEnd(roomId);
        });
    },

    onDiceConfirm(socket, roomId) {
        socket.on('dicePhase-handConfirm', (msg) => {
            this.Rooms[roomId].counter.handConfirm++;

            if (this.Rooms[roomId].counter.handConfirm >= this.Rooms[roomId].maxPlayers) {
                clearTimeout(this.Rooms[roomId].timer["dicePhaseEnd"]);
                delete this.Rooms[roomId].timer["dicePhaseEnd"];
                this.onDiceTimeEnd(roomId);
            }
            else {
                this.emitAll(roomId, 'dicePhase-confirmWait', this.Rooms[roomId].counter.handConfirm + " / " + this.Rooms[roomId].maxPlayers);
            }
        });
    },

    onDiceTimeEnd(roomId) {
        this.emitAll(roomId, 'dicePhase-forceConfirm', true);
    },

    onDiceResult(socket, roomId) {
        socket.on('dicePhase-handInfo', (msg) => {
            this.Rooms[roomId].players[msg.index].currentHand = msg.hand;
            this.Rooms[roomId].players[msg.index].currentChoice = msg.choice;
            this.Rooms[roomId].players[msg.index].currentHandTier = msg.handTier;

            this.Rooms[roomId].counter.handReceived++;


            if (this.Rooms[roomId].counter.handReceived >= this.Rooms[roomId].maxPlayers) {

                let resultArray = [];

                for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
                    resultArray.push({ idx: i, name: this.Rooms[roomId].players[i].name, hand: this.Rooms[roomId].players[i].currentHand, choice: this.Rooms[roomId].players[i].currentChoice, handTier: this.Rooms[roomId].players[i].currentHandTier, choiceDiff: this.Rooms[roomId].players[i].currentChoice - this.Rooms[roomId].roundChoice });
                }

                resultArray.sort((a, b) => {
                    return Math.abs(a.choiceDiff) - Math.abs(b.choiceDiff);
                });

                for (let i = 0; i < resultArray.length; i++) {
                    this.Rooms[roomId].players[resultArray[i].idx].gold += 15 - (5 * i);
                }
                this.syncPlayerInfo(roomId);

                this.emitAll(roomId, 'dicePhase-result', resultArray);
                this.createTimer(roomId, "dicePhaseResultWait", 5000, () => {
                    this.onPlacePhaseBegin(roomId);
                });
            }
        });
    },

    syncPlayerInfo(roomId) {
        this.emitAll(roomId, 'sync-playerData', this.Rooms[roomId].players.map(x => {
            return {
                "name": x.name,
                "hp": x.hp,
                "maxhp": x.maxhp,
                "gold": x.gold,
                "items": x.items,
                "units": x.units,
            }
        }));
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
        this.Rooms[roomId].counter.battlePhaseDone = 0;

        this.emitAll(roomId, 'battlePhase-begin', {
            timeLimit: 0,
        });
    },

    onBattlePhaseDone(socket, roomId) {
        socket.on('battlePhase-done', (msg) => {
            this.Rooms[roomId].counter.battlePhaseDone++;

            if (this.Rooms[roomId].counter.battlePhaseDone >= this.Rooms[roomId].maxPlayers) {
                this.emitAll(roomId, 'battlePhase-end', true);
                this.Rooms[roomId].round++;
                this.onRoundBegin(roomId);
            }
        });
    },

    onPlayerBaseDamage(socket, roomId) {
        socket.on('playerInfo-baseDamage', (msg) => {

            if (!this.Rooms[roomId].players[msg.index]) return;

            this.Rooms[roomId].players[msg.index].hp -= msg.damage;
            this.syncPlayerInfo(roomId);
        });
    },

    onShopItemBuy(socket, roomId) {
        socket.on('shop-itemBuy', (msg) => {
            let shopItem = ShopItemSheet["item" + msg.itemIndex];
            if (this.Rooms[roomId].players[msg.playerIndex].gold >= shopItem.price) {
                this.Rooms[roomId].players[msg.playerIndex].gold -= shopItem.price;

                if (msg.itemIndex == 21) {
                    this.Rooms[roomId].players[msg.playerIndex].hp = this.Rooms[roomId].players[msg.playerIndex].hp + 20 > 100 ? 100 : this.Rooms[roomId].players[msg.playerIndex].hp + 20;
                }
                else if (!this.Rooms[roomId].players[msg.playerIndex].items[msg.itemIndex]) {
                    this.Rooms[roomId].players[msg.playerIndex].items[msg.itemIndex] = 1;
                } else {
                    this.Rooms[roomId].players[msg.playerIndex].items[msg.itemIndex]++;
                }
                socket.emit('shop-itemSuccess', {
                    uiIndex: msg.uiIndex,
                    items: this.Rooms[roomId].players[msg.playerIndex].items,
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

            if (!this.Rooms[roomId].players[msg.playerIndex]) return;

            this.emitAll(roomId, 'chat-message', {
                playerIndex: msg.playerIndex,
                name: this.Rooms[roomId].players[msg.playerIndex].name,
                message: msg.message
            });
        });
    }, 

    onDiceLastChance(socket, roomId) {
        socket.on('dicePhase-lastChance', (msg) => {
            if (!this.Rooms[roomId].players[msg.playerIndex].items[20] || this.Rooms[roomId].players[msg.playerIndex].items[20] == 0) {
                socket.emit('lastChance-Failure', true);
            }
            else {
                this.Rooms[roomId].players[msg.playerIndex].items[20]--;
                socket.emit('lastChance-success', {
                    items: this.Rooms[roomId].players[msg.playerIndex].items
                })
            }
        });
    },

    onReceiveUnitData(socket, roomId) {
        socket.on('player-unitData', (msg) => {
            this.Rooms[this.socketMap[socket.id].roomId].players[this.socketMap[socket.id].roomIndex].units = msg;
        });
    },

    onRequestUnitData(socket, roomId) {
        socket.on('player-requestUnitData', (msg) => {
            let { playerIndex } = msg;

            socket.emit('player-unitData', this.Rooms[roomId].players[playerIndex].units);
        });
    },
};

    