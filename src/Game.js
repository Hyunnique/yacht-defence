
// 전역변수로 유지해서 Scene에서도 접근할 수 있게 함
var Game = {
    GameObject: null,
    
    Initialize(config) {
        this.GameObject = new Phaser.Game(config);

        this.resizeHandler(null);
        window.onresize = this.resizeHandler;

        console.log(this.GameObject);
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

                document.getElementsByClassName("ui-diceConfirmButton")[0].onclick = (e) => {
                    // 임시로 확정 버튼 누르면 바로 다음 단계 진행
                    
                    this.hideUI("diceScene-default");
                    this.showUI("diceScene-result");

                    setTimeout(() => {
                        this.hideUI("diceScene-result");
                        this.showUI("common-unitReward");
                        //this.GameObject.scene.getScene("diceScene").scene.stop().resume("gameScene");
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