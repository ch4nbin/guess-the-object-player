import Phaser from "phaser";

export default class StartScreenScene extends Phaser.Scene {
  constructor() {
    super("StartScreen");
    this.onStart = null;
  }

  init(data) {
    this.onStart = data?.onStart || null;
  }

  preload() {
    this.load.image("witLogo", "/assets/Wit.png");
    this.load.image("nbaLogo", "/assets/nba-logo.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#427aa1");

    this.titleText = this.add
      .text(0, 0, "GUESS THAT PLAYER", {
        fontFamily: '"Press Start 2P", sans-serif',
        fontSize: "48px",
        color: "#ebf2fa",
        align: "center",
      })
      .setOrigin(0.5);

    this.subtitleText = this.add
      .text(0, 0, "Guess the NBA player in 6 tries", {
        fontFamily: '"Press Start 2P", sans-serif',
        fontSize: "16px",
        color: "#ebf2fa",
        align: "center",
      })
      .setOrigin(0.5);

    this.startButton = this.add
      .rectangle(0, 0, 360, 64, 0x064789)
      .setStrokeStyle(2, 0xebf2fa)
      .setInteractive({ useHandCursor: true });

    this.startLabel = this.add
      .text(0, 0, "START GAME", {
        fontFamily: '"Press Start 2P", sans-serif',
        fontSize: "18px",
        color: "#ebf2fa",
        align: "center",
      })
      .setOrigin(0.5);

    this.witLogo = this.add.image(0, 0, "witLogo");
    this.nbaLogo = this.add.image(0, 0, "nbaLogo");

    this.startButton.on("pointerover", () => {
      this.startButton.setFillStyle(0x085aae);
    });

    this.startButton.on("pointerout", () => {
      this.startButton.setFillStyle(0x064789);
    });

    this.startButton.on("pointerdown", () => {
      this.startButton.disableInteractive();
      if (this.onStart) this.onStart();
    });

    this.input.keyboard?.on("keydown-ENTER", () => {
      this.startButton.emit("pointerdown");
    });

    this.scale.on("resize", this.handleResize, this);
    this.handleResize({ width: this.scale.width, height: this.scale.height });
  }

  handleResize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    const titleSize = Math.max(24, Math.min(58, width * 0.055));
    const subtitleSize = Math.max(12, Math.min(18, width * 0.02));
    const buttonWidth = Math.max(260, Math.min(420, width * 0.55));
    const buttonHeight = Math.max(56, Math.min(80, height * 0.12));

    this.titleText.setFontSize(titleSize);
    this.subtitleText.setFontSize(subtitleSize);

    this.titleText.setPosition(width * 0.5, height * 0.28);
    this.subtitleText.setPosition(width * 0.5, height * 0.38);

    this.startButton.setSize(buttonWidth, buttonHeight);
    this.startButton.setDisplaySize(buttonWidth, buttonHeight);
    this.startButton.setPosition(width * 0.5, height * 0.58);

    const buttonLabelSize = Math.max(12, Math.min(20, width * 0.02));
    this.startLabel.setFontSize(buttonLabelSize);
    this.startLabel.setPosition(width * 0.5, height * 0.58);

    const witScale = Math.max(0.1, Math.min(0.22, width / 2600));
    const nbaScale = Math.max(0.08, Math.min(0.18, width / 3000));

    this.witLogo.setScale(witScale);
    this.witLogo.setPosition(width * 0.1, height * 0.9);

    this.nbaLogo.setScale(nbaScale);
    this.nbaLogo.setPosition(width * 0.9, height * 0.9);
  }
}
