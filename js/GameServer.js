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
                handConfirm: 0
            },
            timer: {

            },
            round: 1,
            roundChoice: -1,
        };
    },

    createTimer(name, duration, callback) {
        
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
                this.onGameReady(socket, currentRoomId);
            } else {
                this.emitAll(currentRoomId, 'matchmaking-wait', this.Rooms[currentRoomId].sockets.length);
            }

            this.onDiceConfirm(socket, currentRoomId);

            socket.on('disconnect', () => {
                this.Rooms[currentRoomId].sockets.splice(currentRoomIndex, 1);
            });
        });
    },

    onGameReady(socket, roomId) {
        socket.on('game-ready', (msg) => {
            this.Rooms[roomId].counter.ready++;

            if (this.Rooms[roomId].counter.ready >= this.Rooms[roomId].maxPlayers) {
                this.emitAll(roomId, 'dicePhase-begin', true);

                this.Rooms[roomId].timer
            }
        });
    },

    onDiceConfirm(socket, roomId) {
        socket.on('dicePhase-handConfirm', (msg) => {
            this.Rooms[roomId].counter.handConfirm++;

            if (this.Rooms[roomId].counter.handConfirm >= this.Rooms[roomId].maxPlayers) {
                this.emitAll(roomId, 'dicePhase-showResult', "temp");
            }
            else {
                this.emitAll(roomId, 'dicePhase-confirmWait', this.Rooms[roomId].counter.handConfirm + " / " + this.Rooms[roomId].maxPlayers);
            }
        });
    },
};