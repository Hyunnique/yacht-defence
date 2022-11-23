const waveGenerator = require("./GenerateMobWave");

const SpecsheetGen = require('../src/assets/specsheets/mobSpecSheetGen.json');
const ShopItemSheet = require('../src/assets/specsheets/shopItemSheet.json');

module.exports = {
    Socket: null,
    latestRoomId: 10000,
    Rooms: {},

    init(socket) {
        this.Socket = socket;

        this.createRoom();

        this.onConnect();

        for (let i = 1; i < 50; i++) {
            this.generateWaveInfo(10001);
        }
    },

    createRoom() {
        this.latestRoomId++;

        this.Rooms[this.latestRoomId] = {
            roomId: this.latestRoomId,
            sockets: [],
            maxPlayers: (process.env.PLAYERS ? parseInt(process.env.PLAYERS) : 1), // Configurable for development or singleplayer
            counter: {
                ready: 0,
                handConfirm: 0,
                handReceived: 0
            },
            timer: {

            },
            players: [],
            round: 1,
            roundChoice: -1,
            generatorSheet: JSON.parse(JSON.stringify(SpecsheetGen)),
            generatorRoundCost: 20,
            generatorHpFactor: 1
        };
    },

    generateWaveInfo(roomId) {
        let waveResult = waveGenerator(this.Rooms[roomId].generatorSheet, this.Rooms[roomId].round, this.Rooms[roomId].generatorRoundCost, this.Rooms[roomId].generatorHpFactor);
        this.Rooms[roomId].generatorRoundCost = Math.floor(this.Rooms[roomId].generatorRoundCost * 1.1 + 20);
        this.Rooms[roomId].generatorHpFactor = (this.Rooms[roomId].generatorHpFactor * 1.1).toFixed(2);
        this.emitAll(roomId, 'game-wavedata', waveResult);
    },

    createTimer(roomId, name, duration, callback) {
        this.Rooms[roomId].timer[name] = setTimeout(() => {
            callback();
            delete this.Rooms[roomId].timer[name];
        }, duration);
    },

    emitAll(roomId, eventName, eventMessage) {
        for (let socket of this.Rooms[roomId].sockets) {
            socket.emit(eventName, eventMessage);
        }
    },

    onConnect() {
        this.Socket.on('connection', (socket) => {
            this.Rooms[this.latestRoomId].sockets.push(socket);

            let currentRoomId = this.latestRoomId;
            let currentRoomIndex = this.Rooms[currentRoomId].sockets.length - 1;

            if (this.Rooms[currentRoomId].sockets.length == this.Rooms[currentRoomId].maxPlayers) {
                this.emitAll(currentRoomId, 'matchmaking-done', this.currentRoomId);
                this.createRoom(); // 다음 매칭을 위해 미리 방을 생성해둠
            } else {
                this.emitAll(currentRoomId, 'matchmaking-wait', this.Rooms[currentRoomId].sockets.length);
            }

            this.onGameReady(socket, currentRoomId);
            this.onDiceConfirm(socket, currentRoomId);
            this.onDiceResult(socket, currentRoomId);
            this.onBattlePhaseDone(socket, currentRoomId);
            this.onPlayerBaseDamage(socket, currentRoomId);
            this.onShopItemBuy(socket, currentRoomId);

            socket.on('disconnect', () => {
                this.Rooms[currentRoomId].sockets.splice(currentRoomIndex, 1);
            });
        });
    },

    onGameReady(socket, roomId) {
        socket.on('game-ready', (msg) => {
            this.Rooms[roomId].counter.ready++;

            if (this.Rooms[roomId].counter.ready >= this.Rooms[roomId].maxPlayers) {

                for (let i = 0; i < this.Rooms[roomId].maxPlayers; i++) {
                    this.Rooms[roomId].players.push({ // Initialize Player Object
                        name: "temp",
                        playerIndex: i,
                        hp: 100,
                        maxhp: 100,
                        gold: 0,
                        units: {},
                        items: {},
                        currentHand: "",
                        currentHandTier: 3,
                        currentChoice: -1
                    });

                    this.Rooms[roomId].sockets[i].emit('game-defaultData', {
                        playerCount: this.Rooms[roomId].maxPlayers,
                        playerIndex: i
                    });
                }

                this.onRoundBegin(roomId);
            }
        });
    },

    onRoundBegin(roomId) {
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

                for (let i = 0; i < this.Rooms[roomId].players.length; i++) {
                    this.Rooms[roomId].players[i].gold += 16 - (4 * i);
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
        this.emitAll(roomId, 'sync-playerData', this.Rooms[roomId].players);
    },

    onPlacePhaseBegin(roomId) {
        this.emitAll(roomId, 'placePhase-begin', {
            timeLimit: 10,
        });

        this.generateWaveInfo(roomId);
        
        this.createTimer(roomId, "placePhaseEnd", 10000, () => {
            this.emitAll(roomId, 'placePhase-end', true);
            this.onBattlePhaseBegin(roomId);
        });
    },

    onBattlePhaseBegin(roomId) {
        this.Rooms[roomId].counter.battlePhaseDone = 0;

        this.emitAll(roomId, 'battlePhase-begin', {
            timeLimit: 30,
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
            this.Rooms[roomId].players[msg.index].hp -= msg.damage;
            this.syncPlayerInfo(roomId);
        });
    },

    onShopItemBuy(socket, roomId) {
        socket.on('shop-itemBuy', (msg) => {
            let shopItem = ShopItemSheet["item" + msg.itemIndex];
            if (this.Rooms[roomId].players[msg.playerIndex].gold >= shopItem.price) {
                this.Rooms[roomId].players[msg.playerIndex].gold -= shopItem.price;
                if (!this.Rooms[roomId].players[msg.playerIndex].items[msg.itemIndex]) {
                    this.Rooms[roomId].players[msg.playerIndex].items[msg.itemIndex] = 1;
                } else {
                    this.Rooms[roomId].players[msg.playerIndex].items[msg.itemIndex]++;
                }
                socket.emit('shop-itemSuccess', msg.uiIndex);
            } else {
                socket.emit('shop-itemFailure', msg.uiIndex);
            }
        });
    },
};
