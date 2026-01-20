import Phaser from "phaser";

export default class PortraitScene extends Phaser.Scene {
  constructor() {
    super({ key: "PortraitScene" });
    this.currentKey = null;
    this.portrait = null;
  }

  preload() {
    // nothing required at boot; we'll load portraits dynamically
  }

  create() {
    this.cameras.main.setBackgroundColor("#f7f7fb");

    const { width, height } = this.scale;

    // placeholder text
    this.add.text(width / 2, height / 2, "Loading…", {
      fontSize: "20px",
      color: "#111",
    }).setOrigin(0.5);
  }

  async showPortrait(playerId) {
    if (!playerId) return;

    const key = `p_${playerId}`;
    const url = `/assets/players/images/${playerId}.png`;

    // If already loaded, just swap texture
    if (this.textures.exists(key)) {
      this._setPortrait(key);
      return;
    }

    // Dynamically load image
    this.load.image(key, url);

    this.load.once("complete", () => {
      this._setPortrait(key);
    });

    this.load.once("loaderror", (file) => {
      console.error("Failed to load portrait:", file?.src || url);
    });

    this.load.start();
  }

  _setPortrait(key) {
    const { width, height } = this.scale;

    if (!this.portrait) {
      this.portrait = this.add.image(width / 2, height / 2, key);
      this.portrait.setOrigin(0.5);

      // Scale down to fit nicely (adjust as you wish)
      this._fitPortraitToCanvas();
    } else {
      this.portrait.setTexture(key);
      this._fitPortraitToCanvas();
    }

    this.currentKey = key;
  }

  _fitPortraitToCanvas() {
    if (!this.portrait) return;

    const maxW = this.scale.width * 0.8;
    const maxH = this.scale.height * 0.8;

    const tex = this.portrait.texture.getSourceImage();
    if (!tex) return;

    const scaleX = maxW / tex.width;
    const scaleY = maxH / tex.height;
    const scale = Math.min(scaleX, scaleY);

    this.portrait.setScale(scale * 1.32);
  }
}
