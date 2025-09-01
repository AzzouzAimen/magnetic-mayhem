// src/state.js

const drawingHistory = [];

// --- NEW: Game Rooms State ---
// We use a Map for better performance with frequent additions/deletions.
const gameRooms = new Map();

// Example of a room object:
// 'ABCD': {
//   roomId: 'ABCD',
//   players: Map('socketId123': { id: 'socketId123', name: 'Player1' })
// }

const wordList = [
  "House", "Car", "Tree", "Sun", "Boat", "Star", "Fish", "Bird", "Apple", "Banana",
  "Dog", "Cat", "Book", "Chair", "Table", "Flower", "Key", "Moon", "Ball", "Cloud",
  "Bridge", "Mountain", "River", "Smile", "Heart", "Clock", "Guitar", "Pizza"
];
const getRandomWord = () => {
  return wordList[Math.floor(Math.random() * wordList.length)];
};

module.exports = { drawingHistory, gameRooms, getRandomWord };