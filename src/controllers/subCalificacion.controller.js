const subCalificacionService = require("../services/subCalificacion.service");
const { Usuario, Administrativo } = require("../models");

const subCalificacionController = {
  /**
   * POST /api/sub-calificaciones
   * Crear una nueva subcalificación
   */
  async crearSubCalificacion(req, res) {
    try {
      const { nombre, maximoPuntaje, idTipoCalificacion } = req.body;

      if (!nombre || maximoPuntaje === undefined || !idTipoCalificacion) {
        return res.validationError(
          "Los campos nombre, maximoPuntaje e idTipoCalificacion son requeridos"
        );
      }

      // Validar que maximoPuntaje sea mayor a 0
      const maximoPuntajeNum = Number(maximoPuntaje);
      if (isNaN(maximoPuntajeNum) || maximoPuntajeNum <= 0) {
        return res.validationError(
          "El campo maximoPuntaje debe ser un número mayor a 0"
        );
      }

      // Validación de sumatoria de puntajes máximos
      const subCalificaciones =
        await subCalificacionService.obtenerSubCalificacionesPorTipo(
          idTipoCalificacion
        );
      const sumaActual = subCalificaciones.reduce(
        (acc, sc) => acc + Number(sc.maximoPuntaje || 0),
        0
      );
      if (sumaActual + maximoPuntajeNum > 100) {
        return res.validationError(
          `La sumatoria de puntajes máximos para este tipoCalificacion excede 100. Puntaje disponible: ${
            100 - sumaActual
          }`
        );
      }

      // 1. Obtener el usuario autenticado con su Administrativo asociado
      const usuario = await Usuario.findByPk(req.user.idUsuario, {
        include: [{ model: Administrativo, as: "Administrativo" }],
      });
      const idAdministrativo = usuario?.Administrativo?.idAdministrativo;

      const subCalificacion = await subCalificacionService.crearSubCalificacion(
        {
          ...req.body,
          creadoPor: idAdministrativo,
          actualizadoPor: idAdministrativo,
        }
      );
      return res.success(
        "Subcalificación creada exitosamente",
        subCalificacion,
        201
      );
    } catch (error) {
      console.error("Error al crear subcalificación:", error);
      return res.error("Error al crear la subcalificación", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/sub-calificaciones
   * Obtener todas las subcalificaciones
   */
  async obtenerSubCalificaciones(req, res) {
    try {
      const subCalificaciones =
        await subCalificacionService.obtenerSubCalificaciones();
      return res.success("Subcalificaciones obtenidas exitosamente", {
        count: subCalificaciones.length,
        items: subCalificaciones,
      });
    } catch (error) {
      console.error("Error al obtener subcalificaciones:", error);
      return res.error("Error al obtener las subcalificaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/sub-calificaciones/:idSubCalificacion
   * Obtener una subcalificación por ID
   */
  async obtenerSubCalificacionPorId(req, res) {
    try {
      const { idSubCalificacion } = req.params;
      const subCalificacion =
        await subCalificacionService.obtenerSubCalificacionPorId(
          idSubCalificacion
        );
      return res.success(
        "Subcalificación obtenida exitosamente",
        subCalificacion
      );
    } catch (error) {
      console.error("Error al obtener subcalificación:", error);

      if (error.message === "Subcalificación no encontrada") {
        return res.notFound("Subcalificación");
      }

      return res.error("Error al obtener la subcalificación", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/sub-calificaciones/tipo/:idTipoCalificacion
   * Obtener subcalificaciones por tipo
   */
  async obtenerSubCalificacionesPorTipo(req, res) {
    try {
      const { idTipoCalificacion } = req.params;
      const subCalificaciones =
        await subCalificacionService.obtenerSubCalificacionesPorTipo(
          idTipoCalificacion
        );
      return res.success("Subcalificaciones obtenidas exitosamente", {
        count: subCalificaciones.length,
        items: subCalificaciones,
      });
    } catch (error) {
      console.error("Error al obtener subcalificaciones:", error);
      return res.error("Error al obtener las subcalificaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/sub-calificaciones/:idSubCalificacion
   * Actualizar una subcalificación
   */
  async actualizarSubCalificacion(req, res) {
    try {
      const { idSubCalificacion } = req.params;
      const { maximoPuntaje, idTipoCalificacion } = req.body;

      // Validación solo si se actualiza el puntaje o el tipo
      if (maximoPuntaje !== undefined || idTipoCalificacion !== undefined) {
        // Obtener la subCalificación actual
        const subActual =
          await subCalificacionService.obtenerSubCalificacionPorId(
            idSubCalificacion
          );
        const tipoId = idTipoCalificacion || subActual.idTipoCalificacion;

        // Convertir maximoPuntaje a número si está presente
        let nuevoPuntajeNum;
        if (maximoPuntaje !== undefined) {
          nuevoPuntajeNum = Number(maximoPuntaje);
          if (isNaN(nuevoPuntajeNum) || nuevoPuntajeNum <= 0) {
            return res.validationError(
              "El campo maximoPuntaje debe ser un número mayor a 0"
            );
          }
        } else {
          nuevoPuntajeNum = subActual.maximoPuntaje;
        }

        // Obtener todas las subCalificaciones del tipo
        const subCalificaciones =
          await subCalificacionService.obtenerSubCalificacionesPorTipo(tipoId);
        // Sumar todos menos el actual
        const sumaSinActual = subCalificaciones.reduce(
          (acc, sc) =>
            sc.idSubCalificacion === idSubCalificacion
              ? acc
              : acc + (sc.maximoPuntaje || 0),
          0
        );

        if (sumaSinActual + nuevoPuntajeNum > 100) {
          return res.validationError(
            `La sumatoria de puntajes máximos para este tipoCalificacion excede 100. Puntaje disponible: ${
              100 - sumaSinActual
            }`
          );
        }
      }

      // 1. Obtener el usuario autenticado con su Administrativo asociado
      const usuario = await Usuario.findByPk(req.user.idUsuario, {
        include: [{ model: Administrativo, as: "Administrativo" }],
      });
      const idAdministrativo = usuario?.Administrativo?.idAdministrativo;

      const subCalificacion =
        await subCalificacionService.actualizarSubCalificacion(
          idSubCalificacion,
          {
            ...req.body,
            actualizadoPor: idAdministrativo,
          }
        );

      return res.success(
        "Subcalificación actualizada exitosamente",
        subCalificacion
      );
    } catch (error) {
      console.error("Error al actualizar subcalificación:", error);

      if (error.message === "Subcalificación no encontrada") {
        return res.notFound("Subcalificación");
      }

      return res.error("Error al actualizar la subcalificación", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/sub-calificaciones/:idSubCalificacion
   * Eliminar una subcalificación
   */
  async eliminarSubCalificacion(req, res) {
    try {
      const { idSubCalificacion } = req.params;

      await subCalificacionService.eliminarSubCalificacion(idSubCalificacion);

      return res.success("Subcalificación eliminada exitosamente", {
        idSubCalificacion,
      });
    } catch (error) {
      console.error("Error al eliminar subcalificación:", error);

      if (error.message === "Subcalificación no encontrada") {
        return res.notFound("Subcalificación");
      }

      return res.error("Error al eliminar la subcalificación", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = subCalificacionController;
