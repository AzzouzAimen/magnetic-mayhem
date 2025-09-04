const registerBoardHandlers = (io, socket) => {
    const handleEraseProgress = ({ roomId, progress }) => {
      // Broadcast the real-time progress to everyone else in the room
      socket.broadcast.to(roomId).emit('board:erase:progress', { progress });
    };

    const handleErase = ({ roomId, progress }) => {
      // Broadcast the final progress to everyone else in the room
      socket.broadcast.to(roomId).emit('board:erased', { progress });
    };
  
    socket.on('board:erase:progress', handleEraseProgress);
    socket.on('board:erase', handleErase);
  };
  
  module.exports = registerBoardHandlers;