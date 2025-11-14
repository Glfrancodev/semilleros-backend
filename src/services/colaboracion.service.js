const db = require("../models");
const { getIO } = require("../config/socket");

class ColaboracionService {
  /**
   * Guarda el contenido de un proyecto (auto-guardado desde frontend)
   */
  async guardarContenidoProyecto(idProyecto, contenido, idUsuario) {
    const proyecto = await db.Proyecto.findByPk(idProyecto, {
      include: [
        {
          model: db.EstudianteProyecto,
          as: "estudiantesProyecto",
          include: [
            {
              model: db.Estudiante,
              as: "estudiante",
              include: [{ model: db.Usuario, as: "usuario" }],
            },
          ],
        },
      ],
    });

    if (!proyecto) {
      throw new Error("Proyecto no encontrado");
    }

    // Verificar que el usuario pertenece al proyecto
    const esEstudiante = proyecto.estudiantesProyecto.some(
      (ep) => ep.estudiante.usuario.idUsuario === idUsuario
    );

    if (!esEstudiante) {
      throw new Error("No tienes permiso para editar este proyecto");
    }

    // Actualizar contenido
    proyecto.contenido = contenido;
    proyecto.fechaActualizacion = new Date();
    await proyecto.save();

    // Emitir evento de guardado exitoso a todos en el room
    const io = getIO();
    io.to(`proyecto:${idProyecto}`).emit("content-saved", {
      idProyecto,
      timestamp: proyecto.fechaActualizacion,
      savedBy: idUsuario,
    });

    return proyecto;
  }

  /**
   * Guarda el contenido de una revisión (auto-guardado desde frontend)
   */
  async guardarContenidoRevision(idRevision, contenido, idUsuario) {
    const revision = await db.Revision.findByPk(idRevision, {
      include: [
        {
          model: db.Proyecto,
          as: "proyecto",
          include: [
            {
              model: db.EstudianteProyecto,
              as: "estudiantesProyecto",
              include: [
                {
                  model: db.Estudiante,
                  as: "estudiante",
                  include: [{ model: db.Usuario, as: "usuario" }],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!revision) {
      throw new Error("Revisión no encontrada");
    }

    // Verificar que el usuario pertenece al proyecto de la revisión
    const esEstudiante = revision.proyecto.estudiantesProyecto.some(
      (ep) => ep.estudiante.usuario.idUsuario === idUsuario
    );

    if (!esEstudiante) {
      throw new Error("No tienes permiso para editar esta revisión");
    }

    // Actualizar contenido
    revision.contenidoEnviado = contenido;
    revision.fechaActualizacion = new Date();
    await revision.save();

    // Emitir evento de guardado exitoso a todos en el room
    const io = getIO();
    io.to(`revision:${idRevision}`).emit("content-saved", {
      idRevision,
      timestamp: revision.fechaActualizacion,
      savedBy: idUsuario,
    });

    return revision;
  }

  /**
   * Obtiene el contenido actual de un proyecto
   */
  async obtenerContenidoProyecto(idProyecto, idUsuario) {
    const proyecto = await db.Proyecto.findByPk(idProyecto, {
      include: [
        {
          model: db.EstudianteProyecto,
          as: "estudiantesProyecto",
          include: [
            {
              model: db.Estudiante,
              as: "estudiante",
              include: [{ model: db.Usuario, as: "usuario" }],
            },
          ],
        },
        {
          model: db.Archivo,
          as: "archivos",
          attributes: [
            "idArchivo",
            "nombreArchivo",
            "urlArchivo",
            "tipoArchivo",
          ],
        },
      ],
    });

    if (!proyecto) {
      throw new Error("Proyecto no encontrado");
    }

    // Verificar que el usuario pertenece al proyecto
    const esEstudiante = proyecto.estudiantesProyecto.some(
      (ep) => ep.estudiante.usuario.idUsuario === idUsuario
    );

    if (!esEstudiante) {
      throw new Error("No tienes permiso para ver este proyecto");
    }

    return {
      idProyecto: proyecto.idProyecto,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      contenido: proyecto.contenido,
      archivos: proyecto.archivos,
      fechaActualizacion: proyecto.fechaActualizacion,
    };
  }

  /**
   * Obtiene el contenido actual de una revisión
   */
  async obtenerContenidoRevision(idRevision, idUsuario) {
    const revision = await db.Revision.findByPk(idRevision, {
      include: [
        {
          model: db.Proyecto,
          as: "proyecto",
          include: [
            {
              model: db.EstudianteProyecto,
              as: "estudiantesProyecto",
              include: [
                {
                  model: db.Estudiante,
                  as: "estudiante",
                  include: [{ model: db.Usuario, as: "usuario" }],
                },
              ],
            },
          ],
        },
        {
          model: db.Archivo,
          as: "archivos",
          attributes: [
            "idArchivo",
            "nombreArchivo",
            "urlArchivo",
            "tipoArchivo",
          ],
        },
      ],
    });

    if (!revision) {
      throw new Error("Revisión no encontrada");
    }

    // Verificar que el usuario pertenece al proyecto de la revisión
    const esEstudiante = revision.proyecto.estudiantesProyecto.some(
      (ep) => ep.estudiante.usuario.idUsuario === idUsuario
    );

    if (!esEstudiante) {
      throw new Error("No tienes permiso para ver esta revisión");
    }

    return {
      idRevision: revision.idRevision,
      nombre: revision.nombre,
      descripcion: revision.descripcion,
      contenido: revision.contenidoEnviado,
      archivos: revision.archivos,
      fechaLimite: revision.fechaLimite,
      fechaActualizacion: revision.fechaActualizacion,
      puntaje: revision.puntaje,
      comentario: revision.comentario,
    };
  }
}

module.exports = new ColaboracionService();
