const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join specific room for a road
    socket.on('join_road', (roadId) => {
      socket.join(`road_${roadId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined room road_${roadId}`);
    });

    socket.on('leave_road', (roadId) => {
      socket.leave(`road_${roadId}`);
    });

    // Join hardware simulator room
    socket.on('join_simulator', () => {
      socket.join('simulator_room');
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
