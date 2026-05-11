const { getRandomQuestions } = require('./questions');

const rooms = {};
const MAX_PLAYERS = 6;

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomSafeState(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    maxPlayers: room.maxPlayers || 6,
    players: room.players.map(p => ({
      id: p.id,
      username: p.username,
      avatarId: p.avatarId,
      score: p.score,
      isGuest: p.isGuest
    })),
    spectators: room.spectators.map(s => ({
      id: s.id,
      username: s.username,
      avatarId: s.avatarId,
    })),
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
  };
}

/** Find the room a socket belongs to (as player or spectator) */
function findRoomBySocket(socketId) {
  for (const code in rooms) {
    const room = rooms[code];
    if (room.players.find(p => p.id === socketId)) return { room, role: 'player' };
    if (room.spectators.find(s => s.id === socketId)) return { room, role: 'spectator' };
  }
  return null;
}

module.exports = function setupGameHandlers(io) {

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // ── CREATE ROOM ──
    socket.on('create_room', ({ username, avatarId, maxPlayers, totalQuestions, difficulty }) => {
      const code = generateRoomCode();
      const isGuest = socket.user?.isGuest !== false;
      const capacity = isGuest ? 6 : (Math.max(4, Math.min(30, maxPlayers || 6)));
      const qCount = isGuest ? 10 : (Math.max(10, Math.min(30, totalQuestions || 10)));
      const qDiff = isGuest ? 'Campuran' : (difficulty || 'Campuran');
      
      rooms[code] = {
        code,
        hostId: socket.id,
        maxPlayers: capacity,
        status: 'waiting',
        players: [{
          id: socket.id,
          username,
          avatarId,
          score: 0,
          answered: false,
          lastAnswer: null,
          choseLane: null,
          isGuest,
          dbId: socket.user?.dbId || null
        }],
        spectators: [],
        questions: getRandomQuestions(qCount, qDiff),
        currentQuestionIndex: 0,
        timer: null,
      };
      socket.join(code);
      socket.emit('room_created', { roomCode: code });
      io.to(code).emit('room_update', getRoomSafeState(rooms[code]));
    });

    // ── JOIN ROOM ──
    socket.on('join_room', ({ roomCode, username, avatarId }) => {
      const room = rooms[roomCode];
      if (!room) return socket.emit('error', { message: 'Room tidak ditemukan!' });
      if (room.status !== 'waiting') return socket.emit('error', { message: 'Game sudah dimulai!' });

      // Already in room?
      if (room.players.find(p => p.id === socket.id)) return;
      if (room.spectators.find(s => s.id === socket.id)) return;

      // Room full → join as spectator
      const capacity = room.maxPlayers || 6;
      if (room.players.length >= capacity) {
        room.spectators.push({ id: socket.id, username, avatarId });
        socket.join(roomCode);
        socket.emit('joined_as_spectator', { roomCode });
        setTimeout(() => {
          io.to(roomCode).emit('room_update', getRoomSafeState(room));
        }, 300);
        return;
      }

      // Join as player
      room.players.push({
        id: socket.id,
        username,
        avatarId,
        score: 0,
        answered: false,
        lastAnswer: null,
        choseLane: null,
        isGuest: socket.user?.isGuest !== false,
        dbId: socket.user?.dbId || null
      });

      socket.join(roomCode);
      socket.emit('room_joined', { roomCode });
      setTimeout(() => {
        io.to(roomCode).emit('room_update', getRoomSafeState(room));
      }, 300);
    });

    // ── GET ROOM STATE (For late mounters) ──
    socket.on('get_room_state', ({ roomCode }) => {
      const room = rooms[roomCode];
      if (room) {
        socket.emit('room_update', getRoomSafeState(room));
      }
    });

    // ── START GAME ──
    socket.on('start_game', ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room) return;
      if (room.hostId !== socket.id) return socket.emit('error', { message: 'Hanya host yang bisa mulai!' });
      if (room.players.length < 2) return socket.emit('error', { message: 'Minimal 2 pemain!' });

      room.status = 'playing';
      room.currentQuestionIndex = 0;
      setTimeout(() => {
        sendQuestion(io, room);
      }, 1200);
    });

    // ── LOBBY CHAT ──
    socket.on('lobby_chat', ({ roomCode, message }) => {
      const room = rooms[roomCode];
      if (!room || room.status !== 'waiting') return;

      // Find sender in players or spectators
      const player = room.players.find(p => p.id === socket.id);
      const spectator = room.spectators.find(s => s.id === socket.id);
      const sender = player || spectator;
      if (!sender) return;

      const trimmed = String(message).trim().slice(0, 200);
      if (!trimmed) return;

      io.to(roomCode).emit('lobby_chat', {
        id: socket.id,
        username: sender.username,
        avatarId: sender.avatarId,
        message: trimmed,
        ts: Date.now(),
        isSpectator: !!spectator,
      });
    });

    // ── PLAYER ANSWER ──
    socket.on('player_answer', ({ roomCode, answer }) => {
      const room = rooms[roomCode];
      if (!room || room.status !== 'playing') return;

      // Only players can answer — reject spectators
      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      player.answered = true;
      player.lastAnswer = answer;
      player.choseLane = answer ? 'benar' : 'salah';

      io.to(roomCode).emit('player_moved', {
        playerId: socket.id,
        username: player.username,
        avatarId: player.avatarId,
        choseLane: player.choseLane,
      });
    });

    // ── KICK PLAYER ──
    socket.on('kick_player', ({ targetId, targetName }) => {
      console.log(`\n=== KICK ATTEMPT ===`);
      console.log(`Host Socket: ${socket.id}, TargetName: ${targetName}`);
      
      let room = null;
      let roomCode = null;
      
      for (const code in rooms) {
        const r = rooms[code];
        const isHostById = r.hostId === socket.id;
        const hostPlayer = r.players.find(p => p.id === r.hostId);
        const isHostByName = hostPlayer && r.players.find(p => p.id === socket.id)?.username === hostPlayer.username;

        if (isHostById || isHostByName) {
          room = r;
          roomCode = code;
          if (isHostByName) r.hostId = socket.id; // Sync ID
          break;
        }
      }

      if (!room) return socket.emit('error', { message: 'Kamu bukan host!' });

      // Find target by ID OR by Username
      let kickedPlayer = null;
      
      // 1. Try players list
      const pIdx = room.players.findIndex(p => p.id === targetId || p.username === targetName);
      if (pIdx !== -1) {
        kickedPlayer = room.players.splice(pIdx, 1)[0];
      } else {
        // 2. Try spectators list
        const sIdx = room.spectators.findIndex(s => s.id === targetId || s.username === targetName);
        if (sIdx !== -1) {
          kickedPlayer = room.spectators.splice(sIdx, 1)[0];
        }
      }

      if (!kickedPlayer) {
        return socket.emit('error', { message: 'Pemain tidak ditemukan!' });
      }

      console.log(`SUCCESS: Kicked ${kickedPlayer.username}`);

      // Notify the target socket directly (if ID is still valid)
      const targetSocket = io.sockets.sockets.get(kickedPlayer.id);
      if (targetSocket) {
        targetSocket.emit('player_kicked', { message: 'Kamu dikeluarkan oleh host.' });
        targetSocket.leave(roomCode);
      }

      // Broadcast globally to the room as a failsafe (if target's socket ID changed)
      io.to(roomCode).emit('player_kicked_global', { targetName: kickedPlayer.username });

      // Important: Force update to everyone
      io.to(roomCode).emit('room_update', getRoomSafeState(room));
      io.to(roomCode).emit('lobby_chat', {
        id: 'system', username: 'SISTEM', avatarId: 'system',
        message: `${kickedPlayer.username} telah dikeluarkan oleh host.`, ts: Date.now()
      });
    });

    // ── DISCONNECT ──
    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      for (const code in rooms) {
        const room = rooms[code];
        let found = false;

        // Check players
        const pIdx = room.players.findIndex(p => p.id === socket.id);
        if (pIdx !== -1) {
          room.players.splice(pIdx, 1);
          found = true;
        }

        // Check spectators
        const sIdx = room.spectators.findIndex(s => s.id === socket.id);
        if (sIdx !== -1) {
          room.spectators.splice(sIdx, 1);
          found = true;
        }

        if (found) {
          // If the disconnected socket is the Host, disband the room completely!
          if (room.hostId === socket.id) {
            io.to(code).emit('error', { message: 'Host telah keluar. Room dibubarkan!' });
            io.to(code).emit('room_closed'); // Tell clients to leave
            clearTimeout(room.timer);
            delete rooms[code];
          } else if (room.players.length === 0 && room.spectators.length === 0) {
            clearTimeout(room.timer);
            delete rooms[code];
          } else {
            // Normal player left, just update the room
            io.to(code).emit('room_update', getRoomSafeState(room));
          }
        }
      }
    });
  });
};

function sendQuestion(io, room) {
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
    players: room.players.map(p => ({ id: p.id, username: p.username, avatarId: p.avatarId, score: p.score })),
  });

  io.to(room.code).emit('room_update', getRoomSafeState(room));

  room.timer = setTimeout(() => {
    resolveQuestion(io, room);
  }, 10000);
}

function resolveQuestion(io, room) {
  const question = room.questions[room.currentQuestionIndex];

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

  room.currentQuestionIndex++;
  if (room.currentQuestionIndex < room.questions.length) {
    room.timer = setTimeout(() => sendQuestion(io, room), 3500);
  } else {
    room.timer = setTimeout(async () => {
      room.status = 'finished';
      const leaderboard = [...room.players]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({ rank: i + 1, id: p.id, username: p.username, avatarId: p.avatarId, score: p.score }));
      
      io.to(room.code).emit('game_over', { leaderboard });

      // Save stats to MongoDB for logged in users
      try {
        const User = require('./models/User');
        for (const p of room.players) {
          if (!p.isGuest && p.dbId) {
            const isWinner = p.score > 0 && p.score === leaderboard[0].score;
            await User.findByIdAndUpdate(p.dbId, {
              $inc: {
                totalGames: 1,
                totalWins: isWinner ? 1 : 0,
                totalPoints: p.score
              }
            });
          }
        }
      } catch (err) {
        console.error('Error saving user stats:', err);
      }
    }, 3500);
  }
}

