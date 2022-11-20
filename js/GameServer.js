module.exports = {
    Socket: null,
    latestRoomId: 10000,
    Rooms: {},

    init(socket) {
        this.Socket = socket;

        this.createRoom();

        this.onConnect();
    },

    createRoom() {
        this.latestRoomId++;

        this.Rooms[this.latestRoomId] = {
            roomId: this.latestRoomId,
            sockets: [],
            maxPlayers: 1, // Configurable for development or singleplayer
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
        };
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
                        hp: 1000,
                        maxhp: 1000,
                        gold: 0,
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

        if (this.Rooms[roomId].round % 2 == 1) {
            // 홀수 라운드면 Dice Phase 먼저 진행
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
        } else {
            this.onPlacePhaseBegin(roomId);
        }
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
                for (let player of this.Rooms[roomId].players) {
                    resultArray.push({ name: player.name, hand: player.currentHand, choice: player.currentChoice, handTier: player.currentHandTier, choiceDiff: player.currentChoice - this.Rooms[roomId].roundChoice });
                }

                resultArray.sort((a, b) => {
                    return Math.abs(a.choiceDiff) - Math.abs(b.choiceDiff);
                });

                this.emitAll(roomId, 'dicePhase-result', resultArray);
                this.createTimer(roomId, "dicePhaseResultWait", 5000, () => {
                    this.onPlacePhaseBegin(roomId);
                });
            }
        });
    },

    onPlacePhaseBegin(roomId) {
        this.emitAll(roomId, 'placePhase-begin', {
            timeLimit: 10,
        });
        
        this.createTimer(roomId, "placePhaseEnd", 10000, () => {
            this.emitAll(roomId, 'placePhase-end', true);
            this.onBattlePhaseBegin(roomId);
        });
    },

    onBattlePhaseBegin(roomId) {
        this.emitAll(roomId, 'battlePhase-begin', {
            timeLimit: 30,
        });

        this.createTimer(roomId, "battlePhaseEnd", 30000, () => {
            this.emitAll(roomId, 'battlePhase-end', true);
            this.Rooms[roomId].round++;
            this.onRoundBegin(roomId);
        });
    }
};