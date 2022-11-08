
// 전역변수로 유지해서 Scene에서도 접근할 수 있게 함
var Game = {
    GameObject: null,
    
    Initialize(config) {
        this.GameObject = new Phaser.Game(config);

        this.resizeHandler(null);
        window.onresize = this.resizeHandler;
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
    },

    showScene(sceneName) {
        this.GameObject.scene.start(sceneName);
        this.setDefaultUI(sceneName);
    },

    setDefaultUI(sceneName) {
        let sheets = document.getElementsByClassName("ui-sheet");
        for (let i=0; i<sheets.length; i++) {
            sheets[i].style.display = "none";
        }

        document.getElementsByClassName("ui-" + sceneName)[0].style.display = "block";
    },
};

export default Game;