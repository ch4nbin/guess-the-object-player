import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Start } from './scenes/Start.js';
import './index.css';

function App() {
  const gameRef = useRef(null);

  const emailRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const titleRef = useRef(null);
  const firstNameHeaderRef = useRef(null);
  const lastNameHeaderRef = useRef(null);
  const emailHeaderRef = useRef(null);
  const errorFirstNameRef = useRef(null);
  const errorLastNameRef = useRef(null);
  const errorEmailRef = useRef(null);
  const pageOneRef = useRef(null);
  const pageTwoRef = useRef(null);
  const pageThreeRef = useRef(null);
  const pageFourRef = useRef(null);
  const termsCheckRef = useRef(null);
  const termsLabelRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return; // prevent multiple game instances

    // create Phaser game
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-container",
      scene: Start,
      backgroundColor: '#021b35',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    // AFTER game exists, pass the refs via scene.start
    gameRef.current.scene.start("Start", {
      emailRef,
      firstNameRef,
      lastNameRef,
      titleRef,
      firstNameHeaderRef,
      lastNameHeaderRef,
      emailHeaderRef,
      errorFirstNameRef,
      errorLastNameRef,
      errorEmailRef,
      pageOneRef,
      pageTwoRef,
      pageThreeRef,
      pageFourRef,
      termsCheckRef,
      termsLabelRef
    });

    // cleanup on unmount
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div>
      <div id="game-container"></div>
      <input ref={emailRef} id="emailtext" />
      <input ref={firstNameRef} id="firstnametext" />
      <input ref={lastNameRef} id="lastnametext" />
      <div ref={titleRef} id="title"> </div>
      <div ref={firstNameHeaderRef} id="firstnameHeader"> </div>
      <div ref={lastNameHeaderRef} id="lastnameHeader"> </div>
      <div ref={emailHeaderRef} id="emailHeader"> </div>
      <div ref={errorFirstNameRef} id="errorFirstName"> </div>
      <div ref={errorLastNameRef} id="errorLastName"> </div>
      <div ref={errorEmailRef} id="errorEmail"> </div>
      <div ref={pageOneRef} id="pageOne"> </div>
      <div ref={pageTwoRef} id="pageTwo"> </div>
      <div ref={pageThreeRef} id="pageThree"> </div>
      <div ref={pageFourRef} id="pageFour"> </div>
      <input ref={termsCheckRef} id="termsCheck" type="checkbox" />
      <label ref={termsLabelRef} htmlFor="termsCheck" id="termsLabel"></label>

    </div>
  );
}

export default App;
