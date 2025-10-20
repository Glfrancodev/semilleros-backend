const archivoService = require("../services/archivo.service");

const archivoController = {
  /**
   * POST /api/archivos/upload
   * Subir un archivo a S3 vinculado a un proyecto
   */
  async subirArchivo(req, res) {
    try {
      const { idProyecto } = req.body;

      if (!idProyecto) {
        return res.validationError("El idProyecto es requerido");
      }

      if (!req.file) {
        return res.validationError("No se ha proporcionado ningún archivo");
      }

      const archivo = await archivoService.subirArchivo(req.file, idProyecto);
      return res.success("Archivo subido exitosamente", archivo, 201);
    } catch (error) {
      console.error("Error al subir archivo:", error);
      return res.error("Error al subir el archivo", 500, {
        code: "UPLOAD_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/archivos/proyecto/:idProyecto
   * Obtener todos los archivos de un proyecto
   */
  async obtenerArchivosPorProyecto(req, res) {
    try {
      const { idProyecto } = req.params;

      if (!idProyecto) {
        return res.validationError("El idProyecto es requerido");
      }

      const archivos = await archivoService.obtenerArchivosPorProyecto(
        idProyecto
      );
      return res.success("Archivos obtenidos exitosamente", {
        count: archivos.length,
        items: archivos,
      });
    } catch (error) {
      console.error("Error al obtener archivos:", error);
      return res.error("Error al obtener los archivos", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/archivos/:idArchivo
   * Obtener un archivo específico por ID
   */
  async obtenerArchivoPorId(req, res) {
    try {
      const { idArchivo } = req.params;

      if (!idArchivo) {
        return res.validationError("El idArchivo es requerido");
      }

      const archivo = await archivoService.obtenerArchivoPorId(idArchivo);
      return res.success("Archivo obtenido exitosamente", archivo);
    } catch (error) {
      console.error("Error al obtener archivo:", error);

      if (error.message === "Archivo no encontrado") {
        return res.notFound("Archivo");
      }

      return res.error("Error al obtener el archivo", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/archivos/:idArchivo
   * Eliminar un archivo de S3 y BD
   */
  async eliminarArchivo(req, res) {
    try {
      const { idArchivo } = req.params;

      if (!idArchivo) {
        return res.validationError("El idArchivo es requerido");
      }

      const resultado = await archivoService.eliminarArchivo(idArchivo);
      return res.success("Archivo eliminado exitosamente", { idArchivo });
    } catch (error) {
      console.error("Error al eliminar archivo:", error);

      if (error.message === "Archivo no encontrado") {
        return res.notFound("Archivo");
      }

      return res.error("Error al eliminar el archivo", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/archivos/:idArchivo/url-firmada
   * Generar URL firmada temporal para mayor seguridad (opcional)
   */
  async generarUrlFirmada(req, res) {
    try {
      const { idArchivo } = req.params;
      const { expiresIn } = req.query; // Tiempo de expiración en segundos (default: 3600)

      if (!idArchivo) {
        return res.validationError("El idArchivo es requerido");
      }

      const urlData = await archivoService.generarUrlFirmada(
        idArchivo,
        expiresIn ? parseInt(expiresIn) : 3600
      );

      return res.success("URL firmada generada exitosamente", urlData);
    } catch (error) {
      console.error("Error al generar URL firmada:", error);

      if (error.message === "Archivo no encontrado") {
        return res.notFound("Archivo");
      }

      return res.error("Error al generar URL firmada", 500, {
        code: "URL_GENERATION_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = archivoController;
