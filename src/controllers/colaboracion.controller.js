const colaboracionService = require("../services/colaboracion.service");
const { getActiveUsers } = require("../config/socket");

class ColaboracionController {
  /**
   * Guarda el contenido de un proyecto (endpoint HTTP para auto-guardado)
   */
  async guardarContenidoProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const { contenido } = req.body;
      const idUsuario = req.user.id;

      if (!contenido) {
        return res.validationError("El contenido es requerido");
      }

      const proyecto = await colaboracionService.guardarContenidoProyecto(
        idProyecto,
        contenido,
        idUsuario
      );

      return res.success({ proyecto }, "Contenido guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar contenido del proyecto:", error);
      return res.error(error.message);
    }
  }

  /**
   * Guarda el contenido de una revisión (endpoint HTTP para auto-guardado)
   */
  async guardarContenidoRevision(req, res) {
    try {
      const { idRevision } = req.params;
      const { contenido } = req.body;
      const idUsuario = req.user.id;

      if (!contenido) {
        return res.validationError("El contenido es requerido");
      }

      const revision = await colaboracionService.guardarContenidoRevision(
        idRevision,
        contenido,
        idUsuario
      );

      return res.success({ revision }, "Contenido guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar contenido de la revisión:", error);
      return res.error(error.message);
    }
  }

  /**
   * Obtiene el contenido de un proyecto
   */
  async obtenerContenidoProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const idUsuario = req.user.id;

      const contenido = await colaboracionService.obtenerContenidoProyecto(
        idProyecto,
        idUsuario
      );

      return res.success({ contenido }, "Contenido obtenido exitosamente");
    } catch (error) {
      console.error("Error al obtener contenido del proyecto:", error);
      return res.error(error.message);
    }
  }

  /**
   * Obtiene el contenido de una revisión
   */
  async obtenerContenidoRevision(req, res) {
    try {
      const { idRevision } = req.params;
      const idUsuario = req.user.id;

      const contenido = await colaboracionService.obtenerContenidoRevision(
        idRevision,
        idUsuario
      );

      return res.success({ contenido }, "Contenido obtenido exitosamente");
    } catch (error) {
      console.error("Error al obtener contenido de la revisión:", error);
      return res.error(error.message);
    }
  }

  /**
   * Obtiene los usuarios activos en un documento
   */
  async obtenerUsuariosActivos(req, res) {
    try {
      const { documentId, documentType } = req.params;

      if (!["proyecto", "revision"].includes(documentType)) {
        return res.validationError(
          "Tipo de documento inválido. Debe ser 'proyecto' o 'revision'"
        );
      }

      const activeUsers = getActiveUsers(documentId, documentType);

      return res.success(
        { activeUsers, count: activeUsers.length },
        "Usuarios activos obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener usuarios activos:", error);
      return res.error(error.message);
    }
  }
}

module.exports = new ColaboracionController();
