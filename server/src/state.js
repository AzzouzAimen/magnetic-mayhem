// src/state.js

// --- NEW: Game Rooms State ---
// We use a Map for better performance with frequent additions/deletions.
const gameRooms = new Map();

// Example of a room object:
// 'ABCD': {
//   roomId: 'ABCD',
//   players: Map('socketId123': { id: 'socketId123', name: 'Player1' }),
//   drawingHistory: [],
//   isCustomGame: false, // NEW: A flag for our special mode
//   hostId: 'socketId123', // NEW: Store who the host is
//   wordList: []
// }

const defaultWordList  = [
  "House", "Car", "Tree", "Sun", "Boat", "Star", "Fish", "Bird", "Apple", "Banana",
  "Dog", "Cat", "Book", "Chair", "Table", "Flower", "Key", "Moon", "Ball", "Cloud",
  "Bridge", "Mountain", "River", "Smile", "Heart", "Clock", "Guitar", "Pizza"
];
const getRandomWord = () => {
  return defaultWordList [Math.floor(Math.random() * defaultWordList .length)];
};

module.exports = { gameRooms, defaultWordList };
