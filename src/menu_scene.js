let mainMenuScene = new Scene();
mainMenuScene.Setup = () => {
    let Tm = mainMenuScene.Tm;
    let Im = mainMenuScene.Im;
    let Cs = mainMenuScene.Cs;
    let Gs = mainMenuScene.Gs;
    // настройка импутов
    Im.Setup();
    Im.debugBtn.add(() => {Tm.Toggle();});
    Tm.IndependentUpdate.add(() => {
        Gs.AnimationLoop();
    });
    Tm.Update.add(() => {
        if (Im.MoveDirection.x != 0 || Im.MoveDirection.y != 0) {
            Im.InitMoving(Im.GetMoveVector(), Im.MousePos);
        }
    });
    let testButton = new Label();
    console.log(testButton.position);

    testButton.onClick.add(() => {
        Tm.Update.add(() => {
            return testButton.Timer();
        });
    });
    Gs.AddNewSprite(testButton.sprite);
    testButton.afterClick.add(() => {
        mainMenuScene.Stop();
        gameScene.Setup();
        gameScene.Start();
        return "stop";
    });
    Im.OnClick.add((mousePos) => {        
        testButton.TryInit(mousePos);
    });
}