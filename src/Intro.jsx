import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Start } from "./scenes/Start.js"; 

export default function Intro({ onStart }) {
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
  const termsCheckRef = useRef(null);
  const termsLabelRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "intro-container",
      scene: Start,
      backgroundColor: "#427aa1",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    // Pass refs + onStart into Start scene
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
      termsCheckRef,
      termsLabelRef,
      onStart, 
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onStart]);

  return (
    <div
        style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden"
        }}
    >
        {/* Phaser canvas mounts here */}
        <div id="intro-container" />

        {/* DOM elements controlled by Phaser */}
        <input ref={emailRef} id="emailtext" />
        <input ref={firstNameRef} id="firstnametext" />
        <input ref={lastNameRef} id="lastnametext" />

        <div ref={titleRef} id="title"></div>
        <div ref={firstNameHeaderRef} id="firstnameHeader"></div>
        <div ref={lastNameHeaderRef} id="lastnameHeader"></div>
        <div ref={emailHeaderRef} id="emailHeader"></div>

        <div ref={errorFirstNameRef} id="errorFirstName"></div>
        <div ref={errorLastNameRef} id="errorLastName"></div>
        <div ref={errorEmailRef} id="errorEmail"></div>
        
        <input ref={termsCheckRef} id="termsCheck" type="checkbox" />
        <label ref={termsLabelRef} htmlFor="termsCheck" id="termsLabel"></label>
    </div>
  );

}
