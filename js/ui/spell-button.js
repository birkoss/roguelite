class SpellButton extends CustomButton {
 
    constructor(scene) {
        super(scene);

        console.log(this.background);
        this.background.setTexture("ui:small_buttons");
    }
};