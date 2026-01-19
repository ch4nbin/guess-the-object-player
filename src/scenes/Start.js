import { Button } from '../objects/Button.js';
import Phaser from 'phaser';


export class Start extends Phaser.Scene {
  constructor() {
    super('Start');
    console.log("Start constructor");

    // colors
    this.textColor = '#ebf2fa';
    this.backgroundColor = '#427aa1';
    this.errorColor = '#990507';
    this.buttonColor = '#064789';
    this.buttonHoverColor = '#085aae';
  }

  init(data) {
  this.emailRef = data.emailRef;
  this.firstNameRef = data.firstNameRef;
  this.lastNameRef = data.lastNameRef;
  this.titleRef = data.titleRef;
  this.firstNameHeaderRef = data.firstNameHeaderRef;
  this.lastNameHeaderRef = data.lastNameHeaderRef;
  this.emailHeaderRef = data.emailHeaderRef;
  this.errorFirstNameRef = data.errorFirstNameRef;
  this.errorLastNameRef = data.errorLastNameRef;
  this.errorEmailRef = data.errorEmailRef;
  this.termsCheckRef = data.termsCheckRef;
  this.termsLabelRef = data.termsLabelRef;
  this.pageOneRef = data.pageOneRef;
  this.pageTwoRef = data.pageTwoRef;
  this.pageThreeRef = data.pageThreeRef;
  this.pageFourRef = data.pageFourRef;
}

  preload() {
    this.load.image('nbaLogo', '/assets/nba-logo.png');
    this.load.image('witLogo', '/assets/Wit.png');
    this.load.image('howTo1', '/assets/howTo1.png');
    this.load.image('howTo2', '/assets/howTo2.png');
    this.load.image('howTo3', '/assets/howTo3.png');
    this.load.image('howTo4', '/assets/howTo4.png');
  }

  create() {
    console.log("Start create()");
    this.emailText = this.emailRef.current;
    this.firstNameText = this.firstNameRef.current;
    this.lastNameText = this.lastNameRef.current;
    this.title = this.titleRef.current;
    this.firstNameHeader = this.firstNameHeaderRef.current;
    this.lastNameHeader = this.lastNameHeaderRef.current;
    this.emailHeader = this.emailHeaderRef.current;
    this.errorFirstName = this.errorFirstNameRef.current;
    this.errorLastName = this.errorLastNameRef.current;
    this.errorEmail = this.errorEmailRef.current;
    this.termsCheck = this.termsCheckRef.current;
    this.termsLabel = this.termsLabelRef.current;
    this.emailText.style.display = 'none';
    this.firstNameText.style.display = 'none';
    this.lastNameText.style.display = 'none';
    this.title.style.display = 'none';
    this.isChecked = false;
    this.pageOne = this.pageOneRef.current;
    this.pageTwo = this.pageTwoRef.current;
    this.pageThree = this.pageThreeRef.current;
    this.pageFour = this.pageFourRef.current;

    // prevent black lines
    this.cameras.main.setBackgroundColor(this.backgroundColor);
    this.game.renderer.roundPixels = true;
    // circle in howTo
    this.circle = this.add.graphics();

    // game is resized
    this.scale.on('resize', this.onResize, this);


    this.loadIntro();
  }

  // when game is resized
  onResize(gameSize) {
    // intro screen
    if (this.wit && this.nba) {
        this.placeWit(0.1, 0.92, this.wit);
        this.placeNBA(0.95, 0.9, this.nba);
    }

    if (this.title) {
        this.updateTitleFont();
    }

    if (this.startButton) this.startButton.resize();
    if (this.howToPlayButton) this.howToPlayButton.resize();

    // how-to screen
    if (this.currentPage) {
        this.updateImage(this.currentPage);
        this.updateArrows();
        this.callFillCircle();
    }

    if (this.backButton) this.backButton.resize();

    // email / name screen
    if (this.pageOpen) {
        if (this.startGame) this.startGame.resize();

        this.updateTextFont(this.firstNameHeader, 72);
        this.updateTextFont(this.lastNameHeader, 72);
        this.updateTextFont(this.emailHeader, 72);
        this.updateTextFont(this.errorFirstName, 36);
        this.updateTextFont(this.errorLastName, 36);
        this.updateTextFont(this.errorEmail, 36);

        this.positionTermsCheckbox();
    }
}



    // loading the introduction screen
    loadIntro() {
        // UI elements
        this.wit = this.add.image(this.scale.width * 0.1, this.scale.height * 0.92, 'witLogo');
        this.nba = this.add.image(this.scale.width * 0.95, this.scale.height * 0.9, 'nbaLogo');
        this.nba.setScale(0.03);
        this.placeWit(0.1, 0.92, this.wit);
        this.placeNBA(0.95, 0.9, this.nba);
    
        
        this.title.innerText = 'GUESS THAT PLAYER';
        this.title.style.color = this.textColor;
        this.title.style.position = 'absolute';
        this.title.style.top = '20%';
        this.title.style.left = '50%';
        this.title.style.transform = 'translate(-50%, -50%)';
        this.title.style.fontFamily = 'ArcadeFont';
        this.title.style.whiteSpace = 'nowrap';
        this.updateTitleFont();
        
        
        this.title.style.display = 'block';
        // start button which moves to the next scene
        this.startButton = new Button(this, 0.5, 0.4, 'START', this.buttonColor, 
            this.buttonHoverColor, this.textColor, () => {
        this.wit.destroy(), this.nba.destroy(), this.title.style.display = 'none', this.getEmailAndName()});
        // how to play button, calling the function
        this.howToPlayButton = new Button(this, 0.5, 0.6,  'HOW TO PLAY', this.buttonColor, 
            this.buttonHoverColor, this.textColor, () => {
        this.wit.destroy(), this.nba.destroy(), this.title.style.display = 'none', this.howToPlay()});

        // for if screen gets rescaled
        
    }

    // function for placing object so it can be called when screen is rescaled
    placeWit(xPercent, yPercent, object) {
        object.scaleY = (window.innerHeight / 900);
        object.scaleX =  (window.innerWidth / 1600);
        object.setPosition(xPercent * this.scale.width, yPercent * this.scale.height);
    }
    placeNBA(xPercent, yPercent, object) {
        object.scaleY = 0.03 * (window.innerHeight / 900);
        object.scaleX =  0.03 * (window.innerWidth / 1600);
        object.setPosition(xPercent * this.scale.width, yPercent * this.scale.height);
    }


    // funtion to update title font
    updateTitleFont() {
        const baseTitleFont = 100;
        const titleScale = baseTitleFont * 0.25 * ((window.innerHeight / 1080) + (window.innerWidth / 1920));
        this.title.style.fontSize = titleScale + 'px';
    }
    // funtion text font
    updateTextFont(object, font) {
        const textScale = font * 0.25 * ((window.innerHeight / 1080) + (window.innerWidth / 1920));
        object.style.fontSize = textScale + 'px';
    }
    // function for resizing the image
    updateImage(image) {
    const resizeImage = () => {
        const width = this.scale.width;
        const height = this.scale.height;

        // center the image
        image.setPosition(width / 2, height / 2);

        // scale proportionally to always fit
        const scaleX = width / image.width;
        const scaleY = height / image.height;

        // use MIN to fit entire image without cropping
        const scale = Math.min(scaleX, scaleY);

        image.setScale(scale);
    }

    // Initial scale
    resizeImage();

    // Re-scale when the window resizes
    this.scale.on('resize', resizeImage);
    this.cameras.main.setBackgroundColor('#427aa1');
}

    updateArrows() {
    const width = this.scale.width;
    const height = this.scale.height;

    const offsetLeft = 10;
    const offsetRight = 60;

    this.backArrow.setPosition(
        offsetLeft,
        height / 2
    );

    this.nextArrow.setPosition(
        width - offsetRight,
        height / 2
    );
}


    // function for updating check box
    positionTermsCheckbox() {
    // place is relative to email box
        const rectEmail = this.emailText.getBoundingClientRect();

        this.termsCheck.style.position = 'absolute';
        this.termsCheck.style.left = rectEmail.left + 'px';
        this.termsCheck.style.top = rectEmail.bottom + 12 + 'px';
        this.termsCheck.style.display = 'block';

        this.termsCheck.style.scale = '2';

        this.termsLabel.innerHTML =
        `I have read and agree to the 
        <a href="https://www.witcontests.com/terms" target="_blank">Terms of Use</a>.
        I agree to receive emails from the NBA.`;

        this.termsLabel.style.position = 'absolute';
        this.termsLabel.style.left = rectEmail.left + 32 + 'px';
        this.termsLabel.style.top = rectEmail.bottom + 10 + 'px';

        this.termsLabel.style.display = 'block';
        this.termsLabel.style.color = this.textColor;
        this.termsLabel.style.width = "300px";
        this.termsLabel.style.lineHeight = '1.5'; 

    }



    // function for the how to play button
    howToPlay() {
        // clear stuff on intro screen
        this.startButton.destroy();
        this.howToPlayButton.destroy();
        // back button to load the intro screen
        this.backButton = new Button(this, 0.1, 0.9, 'BACK', this.buttonColor, 
            this.buttonHoverColor, this.textColor, () => {
        this.loadIntro(), this.backButton.destroy(), this.currentPage.setVisible(false),
        this.backArrow.setVisible(false), this.nextArrow.setVisible(false), this.circle.clear()});
        
        // page number
        this.pageNumber = 1;
        // images
        this.howToImages = ['howTo1', 'howTo2', 'howTo3', 'howTo4'];


        // current page
        this.currentPage = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            'howTo1'
        ).setOrigin(0.5);

        // next arrow logic
        this.nextArrow = this.add.text(
            this.scale.width * 0.93, 
            this.scale.height * 0.5,
            '>',
            {fontSize: '64px', color: this.textColor, fontFamily: 'ArcadeFont'}
        )
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {this.nextPage()})
        .on('pointerover', () => {this.nextArrow.setScale(1.2)})
        .on('pointerout', () => {this.nextArrow.setScale(1)});

        // back arrow logic
        this.backArrow = this.add.text(
            this.scale.width * 0.01, 
            this.scale.height * 0.5,
            '<',
            {fontSize: '64px', color: this.textColor, fontFamily: 'ArcadeFont'}
        )
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {this.backPage()})
        .on('pointerover', () => {this.backArrow.setScale(1.2)})
        .on('pointerout', () => {this.backArrow.setScale(1)});

        // call update function
        this.updateArrows();

        // screen scaling
        const scaleX = this.scale.width / this.currentPage.width;
        const scaleY = this.scale.height / this.currentPage.height;
        const scale = Math.max(scaleX, scaleY);

        this.currentPage.setScale(scale);
        this.updateImage(this.currentPage);
        // draw circles at bottom
        this.callFillCircle();
        this.printText();
    }

    // goes to next page
    nextPage() {
        if (this.pageNumber < 4) {
            this.pageNumber++;
            this.currentPage.setTexture(`howTo${this.pageNumber}`);
            // change circles
            this.callFillCircle();
            this.printText();
        }
    }

    // goes back a page
    backPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.currentPage.setTexture(`howTo${this.pageNumber}`);
            this.callFillCircle();
            this.printText();
        }
    }
    // call draw circle
    callFillCircle() {
        this.circle.clear();
        // page one
        if (this.pageNumber == 1) {
            this.drawCircle(0.47, 0.9, 8, true);
            this.drawCircle(0.49, 0.9, 8, false);
            this.drawCircle(0.51, 0.9, 8, false);
            this.drawCircle(0.53, 0.9, 8, false);
        }
        // page two
        else if (this.pageNumber == 2) {
            this.drawCircle(0.47, 0.9, 8, false)
            this.drawCircle(0.49, 0.9, 8, true);
            this.drawCircle(0.51, 0.9, 8, false);
            this.drawCircle(0.53, 0.9, 8, false);
        }
        // page three
        else if (this.pageNumber == 3) {
            this.drawCircle(0.47, 0.9, 8, false);
            this.drawCircle(0.49, 0.9, 8, false);
            this.drawCircle(0.51, 0.9, 8, true);
            this.drawCircle(0.53, 0.9, 8, false);
        }
        // page four
        else {
            this.drawCircle(0.47, 0.9, 8, false)
            this.drawCircle(0.49, 0.9, 8, false);
            this.drawCircle(0.51, 0.9, 8, false);
            this.drawCircle(0.53, 0.9, 8, true);
        }
    }
    // draw circles to show which page on the how to you are on
    drawCircle(xPct, yPct, radius, filled) {
        const x = this.scale.width * xPct;
        const y = this.scale.height * yPct;
        // check if filled
        if (filled) {
            this.circle.fillStyle(0xebf2fa, 1);
            this.circle.fillCircle(x, y, radius);
            this.circle.setDepth(1000);
        }
        else { // not filled
            this.circle.lineStyle(2, 0xebf2fa, 1);
            this.circle.strokeCircle(x, y, radius);
        }

    }

    printText() {
        if (this.pageNumber == 1) {

        }
        else if (this.pageNumber == 2) {

        }
        else if (this.pageNumber == 3) {

        }
        else {

        }
    }

    // function for before game to get email and and name
    getEmailAndName() {
        // clear stuff on intro screen
        this.startButton.destroy();
        this.howToPlayButton.destroy();

        // for the resize
        this.pageOpen = true;

        // back button to load the intro screen
        this.backButton = new Button(this, 0.1, 0.9, 'BACK', 
        this.buttonColor, this.buttonHoverColor, this.textColor,() => {
        this.loadIntro(), this.backButton.destroy(), this.startGame.destroy(),
        this.firstNameText.style.display = "none";
        this.lastNameText.style.display = "none";
        this.emailText.style.display = "none";
        this.firstNameHeader.style.display = 'none';
        this.lastNameHeader.style.display = 'none';
        this.emailHeader.style.display = 'none';
        this.errorFirstName.style.display = 'none';
        this.errorLastName.style.display = 'none';
        this.errorEmail.style.display = 'none';
        this.termsCheck.style.display = 'none';
        this.termsLabel.style.display = 'none';
        this.pageOpen = false;});

        // at end go to game scene
        this.startGame = new Button(this, 0.85, 0.9, 'START GAME', this.buttonColor, 
            this.buttonHoverColor, this.textColor, () => {
        // get text of the text box
        this.playerFirstName = this.firstNameText.value;
        this.playerLastName = this.lastNameText.value;
        this.email = this.emailText.value;
        this.pageOpen = false
        console.log('Name: ' + this.playerName + ' ' + this.playerLastName + '\nEmail: ' + this.email);

        // check if the boxes are filled out by adding variables
        let firstNameFilled = this.playerFirstName != '';
        let lastNameFilled = this.playerLastName != '';
        let emailFilled = this.email.includes('@')
        && this.email.includes('.');

        // if both are filled out properly go to next screen
        if (firstNameFilled && lastNameFilled && emailFilled) {
            // destroy UI
            this.firstNameText.style.display = "none";
            this.lastNameText.style.display = "none";
            this.emailText.style.display = "none";
            this.firstNameHeader.style.display = 'none';
            this.lastNameHeader.style.display = 'none';
            this.emailHeader.style.display = 'none';
            this.errorFirstName.style.display = 'none';
            this.errorLastName.style.display = 'none';
            this.termsCheck.style.display = 'none';
            this.termsLabel.style.display = 'none';
            this.isChecked = this.termsCheck.checked;
            if (this.isChecked) {
            console.log("Checkbox is checked");
            } else {
            console.log("Checkbox is not checked");
            }


            // go to game
            this.scene.start('GameScene'); 
        }
        // if first name was not filled
        if (!firstNameFilled) {
            console.log('First Name not filled');
            this.errorFirstName.style.display = 'block';
        }
        else {
            console.log('First Name was filled');
            this.errorFirstName.style.display = 'none';
        }
        // if last name not filled
         if (!lastNameFilled) {
            console.log('Last Name not filled');
            this.errorLastName.style.display = 'block';
        }
        else {
            console.log('Last Name was filled');
            this.errorLastName.style.display = 'none';
        }
        // if email was not filled
        if (!emailFilled) {
            console.log('Email not filled');
            this.errorEmail.style.display = 'block';
        }
        else{
            console.log('Email filled');
            this.errorEmail.style.display = 'none';
        } 
        });

        // display if already created
        this.firstNameText.style.display = "block";
        this.lastNameText.style.display = "block";
        this.emailText.style.display = "block";

        // first name text box
        console.log(this.firstNameText);
        this.firstNameText.style.position="absolute";
        this.firstNameText.style.width = "300px";
        this.firstNameText.style.height = "50px";
        this.firstNameText.style.fontSize = "18px";
        this.firstNameText.style.zIndex = "1000"; // to be on top of canvas
        this.firstNameText.style.left = "50%";
        this.firstNameText.style.top = "20%";
        this.firstNameText.style.transform = 'translate(-50%, -50%)';
        this.firstNameText.style.backgroundColor = this.buttonColor;
        this.firstNameText.style.color = this.textColor;
        this.firstNameText.style.textAlign = 'center';
        this.firstNameText.style.fontFamily = 'ArcadeFont';

         // last name text box
        console.log(this.lastNameText);
        this.lastNameText.style.position="absolute";
        this.lastNameText.style.width = "300px";
        this.lastNameText.style.height = "50px";
        this.lastNameText.style.fontSize = "18px";
        this.lastNameText.style.zIndex = "1000"; // to be on top of canvas
        this.lastNameText.style.left = "50%";
        this.lastNameText.style.top = "40%";
        this.lastNameText.style.transform = 'translate(-50%, -50%)';
        this.lastNameText.style.backgroundColor = this.buttonColor;
        this.lastNameText.style.color = this.textColor;
        this.lastNameText.style.textAlign = 'center';
        this.lastNameText.style.fontFamily = 'ArcadeFont';

        // email text box
        console.log(this.emailText);
        this.emailText.style.position="absolute";
        this.emailText.style.width = "300px";
        this.emailText.style.height = "50px";
        this.emailText.style.fontSize = "18px";
        this.emailText.style.zIndex = "1000"; // to be on top of canvas
        this.emailText.style.left = "50%";
        this.emailText.style.top = "60%";
        this.emailText.style.transform = 'translate(-50%, -50%)';
        this.emailText.style.backgroundColor = this.buttonColor;
        this.emailText.style.color = this.textColor;
        this.emailText.style.textAlign = 'center';
        this.emailText.style.fontFamily = 'ArcadeFont';

        // first name UI
        this.firstNameHeader.style.position="absolute";
        this.firstNameHeader.innerText = "First Name"
        this.firstNameHeader.style.fontSize = "36px";
        this.firstNameHeader.style.zIndex = "1000"; // to be on top of canvas
        this.firstNameHeader.style.left = "50%";
        this.firstNameHeader.style.top = "12%";
        this.firstNameHeader.style.transform = 'translate(-50%, -50%)';
        this.firstNameHeader.style.fontFamily = 'ArcadeFont'
        this.firstNameHeader.style.color = this.textColor;
        // display if needed
        this.firstNameHeader.style.display = 'block';
        this.updateTextFont(this.firstNameHeader, 72);

        // first name UI
        this.lastNameHeader.style.position="absolute";
        this.lastNameHeader.innerText = "Last Name"
        this.lastNameHeader.style.fontSize = "36px";
        this.lastNameHeader.style.zIndex = "1000"; // to be on top of canvas
        this.lastNameHeader.style.left = "50%";
        this.lastNameHeader.style.top = "32%";
        this.lastNameHeader.style.transform = 'translate(-50%, -50%)';
        this.lastNameHeader.style.fontFamily = 'ArcadeFont'
        this.lastNameHeader.style.color = this.textColor;
        // display if needed
        this.lastNameHeader.style.display = 'block';
        this.updateTextFont(this.lastNameHeader, 72)
        

        // email UI
        this.emailHeader.style.position="absolute";
        this.emailHeader.innerText = "Email"
        this.emailHeader.style.fontSize = "36px";
        this.emailHeader.style.zIndex = "1000"; // to be on top of canvas
        this.emailHeader.style.left = "50%";
        this.emailHeader.style.top = "52%";
        this.emailHeader.style.transform = 'translate(-50%, -50%)';
        this.emailHeader.style.fontFamily = 'ArcadeFont'
        this.emailHeader.style.color = this.textColor;
        // display if needed
        this.emailHeader.style.display = 'block';
        this.updateTextFont(this.emailHeader, 72);

        // error ui first name
        this.errorFirstName.style.position="absolute";
        this.errorFirstName.innerText = "Error: No First Name"
        this.errorFirstName.style.fontSize = "18px";
        this.errorFirstName.style.zIndex = "1000"; // to be on top of canvas
        this.errorFirstName.style.left = "50%";
        this.errorFirstName.style.top = "15%";
        this.errorFirstName.style.transform = 'translate(-50%, -50%)';
        this.errorFirstName.style.fontFamily = 'ArcadeFont'
        this.errorFirstName.style.color = this.errorColor;
        this.errorFirstName.style.display = 'none';
        this.updateTextFont(this.errorFirstName, 36)

        // error ui last name
        this.errorLastName.style.position="absolute";
        this.errorLastName.innerText = "Error: No Last Name"
        this.errorLastName.style.fontSize = "18px";
        this.errorLastName.style.zIndex = "1000"; // to be on top of canvas
        this.errorLastName.style.left = "50%";
        this.errorLastName.style.top = "35%";
        this.errorLastName.style.transform = 'translate(-50%, -50%)';
        this.errorLastName.style.fontFamily = 'ArcadeFont'
        this.errorLastName.style.color = this.errorColor;
        this.errorLastName.style.display = 'none';
        this.updateTextFont(this.errorLastName, 36)

        // error ui email
        this.errorEmail.style.position="absolute";
        this.errorEmail.innerText = "Error: Improper Email"
        this.errorEmail.style.fontSize = "18px";
        this.errorEmail.style.zIndex = "1000"; // to be on top of canvas
        this.errorEmail.style.left = "50%";
        this.errorEmail.style.top = "55%";
        this.errorEmail.style.transform = 'translate(-50%, -50%)';
        this.errorEmail.style.fontFamily = 'ArcadeFont'
        this.errorEmail.style.color = this.errorColor;
        this.errorEmail.style.display = 'none';
        this.updateTextFont(this.errorEmail, 36);

        // term checkbox and label
        this.positionTermsCheckbox();
    }
}
