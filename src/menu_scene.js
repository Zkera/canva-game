let mainMenu = new Scene();
let optionsMenu = new Scene();
let pauseMenu = new Scene();
// let tutorialMenu = new Scene();
mainMenu.Setup = () => {
    
    let Tm = mainMenu.Tm;
    let Im = mainMenu.Im;
    let Gs = mainMenu.Gs;
    // настройка импутов
    mainMenu.BaseSetup();
    mainMenu.background = mainMenu.AddSymbol("./assets/главное меню.png");
    mainMenu.background.sprite.isHidden = true;

    // кнопки
    let startButton = mainMenu.AddButton("./assets/играть.png");
    // startButton.
    startButton.position.y = Scene.size.dy/3;
    startButton.atTrigger.add(() => {
        mainMenu.Stop();
        // gameScene.Setup();
        gameScene.Start();
        console.log("Играть!");
        // return "stop";
    });
    
    let optionsButton = mainMenu.AddButton("./assets/настройки.png");
    optionsButton.position.y = Scene.size.dy/3 *2;
    optionsButton.atTrigger.add(() => {

        mainMenu.Stop();
        // optionsMenu.Setup();
        optionsMenu.Start();
        console.log("в настройки");
        // return "stop";
    });
}
optionsMenu.Setup = () => {
    let Tm = optionsMenu.Tm;
    let Im = optionsMenu.Im;
    let Gs = optionsMenu.Gs;
    // настройка импутов
    optionsMenu.BaseSetup();
    
    // кнопки
    let returnButton = optionsMenu.AddButton("./assets/меню.png");
    returnButton.position.y = Scene.size.dy/4 * 1;
    returnButton.atTrigger.add(() => {
        optionsMenu.Stop();
        mainMenu.Start();
        console.log("Обратно в главное меню");
        
        // return "stop";
    });
    let optionsButton = optionsMenu.AddButton("./assets/чит.png");
    optionsButton.position.y = Scene.size.dy/4 * 2;
    // кастыылыь
    optionsButton.atTrigger.add(() => {
            if (!gameScene.isConfigured) {
                gameScene.onSetup.add(() => {
                    gameScene.player.cheatOn = !gameScene.player.cheatOn;
                console.log("Чит переключён отложенной реакцией на событие нажатия клавиши");
                    
                return "stop";
            });
            } else {
                gameScene.player.cheatOn = !gameScene.player.cheatOn;
                console.log("Чит переключён");
            }
            
        
    });
    optionsMenu.switchGraphic = optionsMenu.AddButton("./assets/графика.png");
    optionsMenu.switchGraphic.sprite.countRows = 2;
    optionsMenu.switchGraphic.sprite.SetRowAbs(1);
    optionsMenu.WIP = false;
    optionsMenu.switchGraphic.position.y = Scene.size.dy/4 * 3;
    // кастыылыь
    optionsMenu.switchGraphic.atTrigger.add(() => {            
        optionsMenu.WIP = !optionsMenu.WIP;
        if(optionsMenu.WIP) {
            optionsMenu.switchGraphic.sprite.SetRowAbs(0);
            gameScene.onStart.add(() => {
                gameScene.background.sprite.isHidden = false;
                gameScene.player.sprite.SwitchImg();
                return "stop";
            })
            mainMenu.onStart.add(() => {
                mainMenu.background.sprite.isHidden = false;
                return "stop";
            })
            mainMenu
        } else {
            optionsMenu.switchGraphic.sprite.SetRowAbs(1);
            gameScene.onStart.add(() => {
                gameScene.player.sprite.SwitchImg();
                gameScene.background.sprite.isHidden = true;
                return "stop";
            })
            mainMenu.onStart.add(() => {
                mainMenu.background.sprite.isHidden = true;
                return "stop";
            })
        }
    });
    
}
pauseMenu.Setup = () => {
    let Tm = pauseMenu.Tm;
    let Im = pauseMenu.Im;
    let Gs = pauseMenu.Gs;
    // настройка импутов
    pauseMenu.BaseSetup();
    Im.pauseButton.add(() => {
        // console.log("Разпаузил");
        pauseMenu.Stop();
        gameScene.Start();
    });
    // кнопки
    let resumeButton = pauseMenu.AddButton("./assets/играть.png");
    resumeButton.position.y = Scene.size.dy/4;
    resumeButton.atTrigger.add(() => {
        console.log("игра");
        
        pauseMenu.Stop();
        gameScene.Start();
    });
    let restartButton = pauseMenu.AddButton("./assets/заново.png");
    restartButton.position.y = Scene.size.dy/4 * 2;
    restartButton.atTrigger.add(() => {
        console.log("перезагрузка");
        window.location.reload();
        // return "stop";
    })
    let toMainMenuButton = pauseMenu.AddButton("./assets/меню.png");
    toMainMenuButton.position.y = Scene.size.dy/4 * 3;
    toMainMenuButton.atTrigger.add(() => {
        console.log("в главное меню");
        
        pauseMenu.Stop();
        mainMenu.Start();
        // return "stop";
    })

}