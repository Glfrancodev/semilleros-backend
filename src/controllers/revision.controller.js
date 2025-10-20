const revisionService = require("../services/revision.service");

const revisionController = {
  /**
   * POST /api/revisiones
   * Crear una nueva revisión
   */
  async crearRevision(req, res) {
    try {
      const { nombre, descripcion, fechaLimite, idProyecto } = req.body;

      if (!nombre || !descripcion || !fechaLimite || !idProyecto) {
        return res.validationError(
          "Los campos nombre, descripcion, fechaLimite e idProyecto son requeridos"
        );
      }

      const revision = await revisionService.crearRevision(req.body);
      return res.success("Revisión creada exitosamente", revision, 201);
    } catch (error) {
      console.error("Error al crear revisión:", error);
      return res.error("Error al crear la revisión", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/revisiones
   * Obtener todas las revisiones
   */
  async obtenerRevisiones(req, res) {
    try {
      const revisiones = await revisionService.obtenerRevisiones();
      return res.success("Revisiones obtenidas exitosamente", {
        count: revisiones.length,
        items: revisiones,
      });
    } catch (error) {
      console.error("Error al obtener revisiones:", error);
      return res.error("Error al obtener las revisiones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/revisiones/:idRevision
   * Obtener una revisión por ID
   */
  async obtenerRevisionPorId(req, res) {
    try {
      const { idRevision } = req.params;
      const revision = await revisionService.obtenerRevisionPorId(idRevision);
      return res.success("Revisión obtenida exitosamente", revision);
    } catch (error) {
      console.error("Error al obtener revisión:", error);

      if (error.message === "Revisión no encontrada") {
        return res.notFound("Revisión");
      }

      return res.error("Error al obtener la revisión", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/revisiones/proyecto/:idProyecto
   * Obtener revisiones por proyecto
   */
  async obtenerRevisionesPorProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const revisiones = await revisionService.obtenerRevisionesPorProyecto(
        idProyecto
      );
      return res.success("Revisiones obtenidas exitosamente", {
        count: revisiones.length,
        items: revisiones,
      });
    } catch (error) {
      console.error("Error al obtener revisiones:", error);
      return res.error("Error al obtener las revisiones del proyecto", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/revisiones/:idRevision
   * Actualizar una revisión
   */
  async actualizarRevision(req, res) {
    try {
      const { idRevision } = req.params;
      const revision = await revisionService.actualizarRevision(
        idRevision,
        req.body
      );
      return res.success("Revisión actualizada exitosamente", revision);
    } catch (error) {
      console.error("Error al actualizar revisión:", error);

      if (error.message === "Revisión no encontrada") {
        return res.notFound("Revisión");
      }

      return res.error("Error al actualizar la revisión", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/revisiones/:idRevision
   * Eliminar una revisión
   */
  async eliminarRevision(req, res) {
    try {
      const { idRevision } = req.params;
      const resultado = await revisionService.eliminarRevision(idRevision);
      return res.success("Revisión eliminada exitosamente", { idRevision });
    } catch (error) {
      console.error("Error al eliminar revisión:", error);

      if (error.message === "Revisión no encontrada") {
        return res.notFound("Revisión");
      }

      return res.error("Error al eliminar la revisión", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = revisionController;
