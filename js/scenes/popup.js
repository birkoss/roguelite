class PopupScene extends Phaser.Scene {
    constructor(type) {
        super({key:'PopupScene'});

        this.popup_type = type;
        this.config = config;

        if (this.config == undefined) {
            this.config = {};
        }

        this.handler = null;
    }
 
    create() {
       this.overlay = this.add.graphics();

       this.overlay.fillStyle(0x000000, 1);
       this.overlay.fillRect(0, 0, this.game.config.width, this.game.config.height);

       this.popup_container = this.add.container();

       this.buttons = this.add.group();
    }

    setEvent(handler, context) {
        this.handler = {handler: handler, context:context};
    }

    open() {
        let destY = (this.game.config.height - this.popup_container.getBounds().height) / 2;

        this.popup_container.x = (this.game.config.width - this.popup_container.getBounds().width) / 2;
        this.popup_container.y = this.game.config.height;
        this.overlay.alpha = 0;

        this.tweens.add({
            targets: this.popup_container,
            y: destY,
            ease: 'Cubic',
            duration: 300,
        });
        this.tweens.add({
            targets: this.overlay,
            alpha: 0.7,
            ease: 'Cubic',
            duration: 300,
        });
    }

    close() {
        this.tweens.add({
            targets: this.popup_container,
            y: this.game.config.height,
            alpha: 0,
            ease: 'Cubic',
            duration: 300,
            onComplete: this.onPopupClosed,
            onCompleteScope: this
        });

        this.tweens.add({
            targets: this.overlay,
            alpha: 0,
            ease: 'Cubic',
            duration: 300,
            onComplete: this.onPopupClosed,
            onCompleteScope: this
        });
    }

    getType() {
        return this.popup_type;
    }

    /* Events */

    onButtonClicked(button) {
        this.config['buttonText'] = button.label.text;

        this.close();
    }

    onPopupClosed() {
        let active_tweens = this.tweens.getAllTweens().filter(tween => tween.isPlaying());
        if (active_tweens.length == 1) {
            this.scene.remove();

            if (this.handler != null) {
                this.handler.handler.apply(this.handler.context, [this.config['buttonText']]);
            }
        }
    }
};