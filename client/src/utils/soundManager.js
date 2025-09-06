// A Map to store our Audio objects so we don't have to re-create them
const sounds = new Map();

// A function to preload a sound
const loadSound = (name, src) => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  sounds.set(name, audio);
};

// --- This is the main part of our sound manager ---
export const soundManager = {
  // Preload all sounds at the start of the app
  init: () => {
    console.log("🔊 Sound manager initialized.");
    loadSound('click', '/sounds/click.mp3');
    loadSound('success', '/sounds/success.mp3');
    loadSound('stamp', '/sounds/stamp.mp3');
    loadSound('erase', '/sounds/erase.mp3');
    
    // Looping sounds need special handling
    const drawSound = new Audio('/sounds/draw-loop.mp3');
    drawSound.loop = true;
    drawSound.volume = 0.5; // Drawing sounds should be subtle
    sounds.set('draw', drawSound);
  },

  // Play a one-shot sound effect
  play: (name) => {
    const sound = sounds.get(name);
    if (sound) {
      sound.currentTime = 0; // Rewind to the start
      sound.play().catch(e => console.error(`Could not play sound: ${name}`, e));
    }
  },

  // Start playing a looping sound
  startLoop: (name) => {
    const sound = sounds.get(name);
    if (sound && sound.paused) {
      sound.play().catch(e => console.error(`Could not start loop: ${name}`, e));
    }
  },

  // Stop playing a looping sound
  stopLoop: (name) => {
    const sound = sounds.get(name);
    if (sound && !sound.paused) {
      sound.pause();
      sound.currentTime = 0; // Rewind
    }
  },
};