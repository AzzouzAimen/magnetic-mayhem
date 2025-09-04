const registerBoardHandlers = (io, socket) => {
    const handleErase = ({ roomId, progress }) => {
      // Broadcast the final progress to everyone else in the room
      socket.broadcast.to(roomId).emit('board:erased', { progress });
    };
  
    socket.on('board:erase', handleErase);
  };
  
  module.exports = registerBoardHandlers;