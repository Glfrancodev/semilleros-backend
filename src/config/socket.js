const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

// Almacenamiento en memoria de usuarios activos por documento
const activeUsers = new Map(); // key: documentId, value: Set of user objects

// Almacenamiento de salas de videollamadas
const videoRooms = new Map(); // key: proyectoId, value: Map of participants

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : "*",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticación para sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.idUsuario;
      socket.userEmail = decoded.correo;
      socket.userNombre = decoded.nombre;
      socket.userIniciales = decoded.iniciales;
      socket.userFoto = decoded.fotoPerfil;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Unirse a un documento (proyecto o revisión)
    socket.on("join-document", ({ documentId, documentType }) => {
      const room = `${documentType}:${documentId}`;
      socket.join(room);
      socket.currentRoom = room;
      socket.documentId = documentId;
      socket.documentType = documentType;

      // Agregar usuario a la lista de activos
      if (!activeUsers.has(room)) {
        activeUsers.set(room, new Set());
      }

      const userInfo = {
        id: socket.userId,
        email: socket.userEmail,
        nombre: socket.userNombre,
        iniciales: socket.userIniciales,
        foto: socket.userFoto,
        socketId: socket.id,
      };

      activeUsers.get(room).add(JSON.stringify(userInfo));

      // Notificar a todos los usuarios en el room
      const activeUsersList = Array.from(activeUsers.get(room)).map((u) =>
        JSON.parse(u)
      );

      io.to(room).emit("active-users", activeUsersList);
    });

    // Cambios en el contenido markdown
    socket.on("content-change", ({ documentId, documentType, content }) => {
      const room = `${documentType}:${documentId}`;

      // Broadcast a todos excepto al emisor
      socket.to(room).emit("content-update", {
        content,
        userId: socket.userId,
        userEmail: socket.userEmail,
        timestamp: new Date().toISOString(),
      });
    });

    // Posición del cursor (opcional para UX avanzada)
    socket.on("cursor-position", ({ documentId, documentType, position }) => {
      const room = `${documentType}:${documentId}`;

      socket.to(room).emit("cursor-update", {
        userId: socket.userId,
        userEmail: socket.userEmail,
        userNombre: socket.userNombre,
        userIniciales: socket.userIniciales,
        position,
      });
    });

    // Selección de texto (opcional)
    socket.on("selection-change", ({ documentId, documentType, selection }) => {
      const room = `${documentType}:${documentId}`;

      socket.to(room).emit("selection-update", {
        userId: socket.userId,
        userEmail: socket.userEmail,
        userIniciales: socket.userIniciales,
        selection,
      });
    });

    // Salir de un documento manualmente
    socket.on("leave-document", ({ documentId, documentType }) => {
      const room = `${documentType}:${documentId}`;
      socket.leave(room);

      const usersSet = activeUsers.get(room);
      if (usersSet) {
        const usersArray = Array.from(usersSet).map((u) => JSON.parse(u));
        const filteredUsers = usersArray.filter(
          (u) => u.socketId !== socket.id
        );

        if (filteredUsers.length === 0) {
          activeUsers.delete(room);
        } else {
          activeUsers.set(
            room,
            new Set(filteredUsers.map((u) => JSON.stringify(u)))
          );
        }

        io.to(room).emit("active-users", filteredUsers);
      }

      socket.currentRoom = null;
      socket.documentId = null;
      socket.documentType = null;
    });

    // ========== VIDEOLLAMADAS ==========

    // Usuario se une a una sala de videollamada
    socket.on("join-video-room", ({ proyectoId, userName }) => {
      console.log(
        `📹 ${userName} (${socket.id}) se unió a videollamada del proyecto ${proyectoId}`
      );

      const videoRoom = `video:${proyectoId}`;
      socket.join(videoRoom);
      socket.videoRoom = videoRoom;
      socket.videoProyectoId = proyectoId;

      // Obtener o crear sala de video
      const room = videoRooms.get(proyectoId) || new Map();
      room.set(socket.id, {
        id: socket.id,
        name: userName,
        userId: socket.userId,
      });
      videoRooms.set(proyectoId, room);

      // Notificar a otros usuarios en la sala de video
      socket.to(videoRoom).emit("user-joined-video", {
        userId: socket.id,
        userName,
      });

      // Enviar lista de participantes existentes al nuevo usuario (excluyendo a sí mismo)
      const participants = Array.from(room.values()).filter(
        (p) => p.id !== socket.id
      );
      socket.emit("video-participants-list", participants);

      console.log(
        `📹 Participantes en sala ${proyectoId}:`,
        participants.length,
        "(enviados al nuevo usuario)"
      );
    });

    // Retransmitir oferta WebRTC
    socket.on("video-offer", ({ offer, to }) => {
      console.log(`📹 Oferta WebRTC de ${socket.id} para ${to}`);
      socket.to(to).emit("video-offer", {
        offer,
        from: socket.id,
      });
    });

    // Retransmitir respuesta WebRTC
    socket.on("video-answer", ({ answer, to }) => {
      console.log(`📹 Respuesta WebRTC de ${socket.id} para ${to}`);
      socket.to(to).emit("video-answer", {
        answer,
        from: socket.id,
      });
    });

    // Retransmitir candidatos ICE
    socket.on("video-ice-candidate", ({ candidate, to }) => {
      socket.to(to).emit("video-ice-candidate", {
        candidate,
        from: socket.id,
      });
    });

    // Usuario sale de la sala de video
    socket.on("leave-video-room", ({ proyectoId }) => {
      handleVideoUserLeave(socket, proyectoId);
    });

    // Función auxiliar para manejar salida de videollamada
    function handleVideoUserLeave(socket, proyectoId) {
      const room = videoRooms.get(proyectoId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          videoRooms.delete(proyectoId);
          console.log(
            `📹 Sala de video ${proyectoId} eliminada (sin participantes)`
          );
        }
      }

      const videoRoom = `video:${proyectoId}`;
      socket.to(videoRoom).emit("user-left-video", {
        userId: socket.id,
      });

      socket.leave(videoRoom);
      console.log(
        `📹 Usuario ${socket.id} salió de videollamada ${proyectoId}`
      );
    }

    // Desconexión - maneja ambos tipos de salas
    socket.on("disconnect", () => {
      // Manejar desconexión de documento colaborativo
      if (socket.currentRoom) {
        const room = socket.currentRoom;
        const usersSet = activeUsers.get(room);

        if (usersSet) {
          const usersArray = Array.from(usersSet).map((u) => JSON.parse(u));
          const filteredUsers = usersArray.filter(
            (u) => u.socketId !== socket.id
          );

          if (filteredUsers.length === 0) {
            activeUsers.delete(room);
          } else {
            activeUsers.set(
              room,
              new Set(filteredUsers.map((u) => JSON.stringify(u)))
            );
          }

          io.to(room).emit("active-users", filteredUsers);
        }
      }

      // Manejar desconexión de videollamada
      if (socket.videoProyectoId) {
        handleVideoUserLeave(socket, socket.videoProyectoId);
      }
    });
  });
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado");
  }
  return io;
};

const getActiveUsers = (documentId, documentType) => {
  const room = `${documentType}:${documentId}`;
  const usersSet = activeUsers.get(room);

  if (!usersSet) {
    return [];
  }

  return Array.from(usersSet).map((u) => JSON.parse(u));
};

module.exports = {
  initializeSocket,
  getIO,
  getActiveUsers,
};
