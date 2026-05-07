const { getRandomQuestions } = require('./questions');

const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomSafeState(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: room.players,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
  };
}

module.exports = function setupGameHandlers(io) {

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // CREATE ROOM
    socket.on('create_room', ({ username, avatarId }) => {
      const code = generateRoomCode();
      rooms[code] = {
        code,
        hostId: socket.id,
        status: 'waiting',
        players: [{
          id: socket.id,
          username,
          avatarId,
          score: 0,
          answered: false,
          lastAnswer: null,
          choseLane: null,
        }],
        questions: getRandomQuestions(10),
        currentQuestionIndex: 0,
        timer: null,
      };
      socket.join(code);
      socket.emit('room_created', { roomCode: code });
      io.to(code).emit('room_update', getRoomSafeState(rooms[code]));
    });

    // JOIN ROOM
    socket.on('join_room', ({ roomCode, username, avatarId }) => {
      const room = rooms[roomCode];
      if (!room) return socket.emit('error', { message: 'Room tidak ditemukan!' });
      if (room.status !== 'waiting') return socket.emit('error', { message: 'Game sudah dimulai!' });
      if (room.players.find(p => p.id === socket.id)) return;

      room.players.push({
        id: socket.id,
        username,
        avatarId,
        score: 0,
        answered: false,
        lastAnswer: null,
        choseLane: null,
      });

      socket.join(roomCode);
      socket.emit('room_joined', { roomCode });
      io.to(roomCode).emit('room_update', getRoomSafeState(room));
    });

    // START GAME
    socket.on('start_game', ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room) return;
      if (room.hostId !== socket.id) return socket.emit('error', { message: 'Hanya host yang bisa mulai!' });
      if (room.players.length < 2) return socket.emit('error', { message: 'Minimal 2 pemain!' });

      room.status = 'playing';
      room.currentQuestionIndex = 0;
      sendQuestion(io, room);
    });

    // PLAYER ANSWER
    socket.on('player_answer', ({ roomCode, answer }) => {
      const room = rooms[roomCode];
      if (!room || room.status !== 'playing') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.answered) return; // LOCKED — ignore duplicate

      player.answered = true;
      player.lastAnswer = answer;
      player.choseLane = answer ? 'benar' : 'salah';

      // Broadcast to all players in room that this player moved
      io.to(roomCode).emit('player_moved', {
        playerId: socket.id,
        username: player.username,
        avatarId: player.avatarId,
        choseLane: player.choseLane,
      });

      // Check if all players answered
      const allAnswered = room.players.every(p => p.answered);
      if (allAnswered) {
        clearTimeout(room.timer);
        resolveQuestion(io, room);
      }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      for (const code in rooms) {
        const room = rooms[code];
        const idx = room.players.findIndex(p => p.id === socket.id);
        if (idx !== -1) {
          room.players.splice(idx, 1);
          if (room.players.length === 0) {
            clearTimeout(room.timer);
            delete rooms[code];
          } else {
            if (room.hostId === socket.id) {
              room.hostId = room.players[0].id;
            }
            io.to(code).emit('room_update', getRoomSafeState(room));
          }
        }
      }
    });
  });
};

function sendQuestion(io, room) {
  // Reset all players answered state & lane
  room.players.forEach(p => {
    p.answered = false;
    p.lastAnswer = null;
    p.choseLane = null;
  });

  const question = room.questions[room.currentQuestionIndex];
  io.to(room.code).emit('question_start', {
    statement: question.statement,
    category: question.category,
    questionIndex: room.currentQuestionIndex,
    total: room.questions.length,
    timer: 10,
  });

  // Broadcast room update so lanes reset
  io.to(room.code).emit('room_update', getRoomSafeState(room));

  // Server-side timer
  room.timer = setTimeout(() => {
    resolveQuestion(io, room);
  }, 10000);
}

function resolveQuestion(io, room) {
  const question = room.questions[room.currentQuestionIndex];

  // Calculate scores
  room.players.forEach(p => {
    if (p.answered && p.lastAnswer === question.is_correct) {
      p.score += 100;
    }
  });

  const scores = room.players.map(p => ({
    id: p.id,
    username: p.username,
    avatarId: p.avatarId,
    score: p.score,
    wasCorrect: p.answered && p.lastAnswer === question.is_correct,
  }));

  io.to(room.code).emit('question_result', {
    correctAnswer: question.is_correct,
    scores,
  });

  // Next question or game over
  room.currentQuestionIndex++;
  if (room.currentQuestionIndex < room.questions.length) {
    room.timer = setTimeout(() => sendQuestion(io, room), 3500);
  } else {
    room.timer = setTimeout(() => {
      room.status = 'finished';
      const leaderboard = [...room.players]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({ rank: i + 1, id: p.id, username: p.username, avatarId: p.avatarId, score: p.score }));
      io.to(room.code).emit('game_over', { leaderboard });
    }, 3500);
  }
}
