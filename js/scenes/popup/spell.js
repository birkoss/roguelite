class PopupSpell extends PopupScene {
    constructor(spellID) {
        super();
        
        this.spellID = spellID;
    }

    create() {
       super.create();

       this.createPopup();

       super.open();
    }

    createPopup() {

        let background = new Ninepatch(this, 300, 370, "brown");
        this.popup_container.add(background);

        let title = "";
        let description = "";

        this.cache.json.get('data:spells').forEach(single_data => {
            if (single_data.id == this.spellID) {
                title = single_data.name;
                description = single_data.description;
            }
        }, this);

        let text = this.add.bitmapText(0, 0, "font:gui", title, 30, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0);
        text.x = (background.getBounds().width - text.getTextBounds().local.width) / 2;
        text.y = 20;
        text.tint = 0x665e49;
        this.popup_container.add(text);

        text = this.add.bitmapText(0, 0, "font:gui", description, 20, Phaser.GameObjects.BitmapText.ALIGN_CENTER).setOrigin(0);
        text.x = (background.getBounds().width - text.getTextBounds().local.width) / 2;
        text.y = 70;
        text.tint = 0x665e49;
        this.popup_container.add(text);


        let button = new PopupButton(this, "Yes", "popup");
        button.x = (background.getBounds().width - button.getBounds().width) / 2;
        button.y = (text.y) + text.height + 30;
        button.on("BUTTON_CLICKED", this.onButtonClicked, this);
        this.buttons.add(button);
        this.popup_container.add(button);

        button = new PopupButton(this, "No", "popup");
        button.x = (background.getBounds().width - button.getBounds().width) / 2;
        button.y = (text.y) + text.height + 100;
        button.on("BUTTON_CLICKED", this.onButtonClicked, this);
        this.buttons.add(button);
        this.popup_container.add(button);
    }

};