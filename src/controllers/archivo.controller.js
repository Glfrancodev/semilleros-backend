const archivoService = require('../services/archivo.service');

const archivoController = {
  /**
   * POST /api/archivos/upload
   * Subir un archivo a S3 vinculado a un proyecto
   */
  async subirArchivo(req, res) {
    try {
      const { idProyecto } = req.body;

      if (!idProyecto) {
        return res.status(400).json({ 
          error: 'El idProyecto es requerido' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: 'No se ha proporcionado ningún archivo' 
        });
      }

      const archivo = await archivoService.subirArchivo(req.file, idProyecto);

      return res.status(201).json({
        mensaje: 'Archivo subido exitosamente',
        archivo,
      });
    } catch (error) {
      console.error('Error al subir archivo:', error);
      return res.status(500).json({ 
        error: error.message || 'Error al subir el archivo' 
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
        return res.status(400).json({ 
          error: 'El idProyecto es requerido' 
        });
      }

      const archivos = await archivoService.obtenerArchivosPorProyecto(idProyecto);

      return res.status(200).json({
        mensaje: 'Archivos obtenidos exitosamente',
        cantidad: archivos.length,
        archivos,
      });
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      return res.status(500).json({ 
        error: error.message || 'Error al obtener los archivos' 
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
        return res.status(400).json({ 
          error: 'El idArchivo es requerido' 
        });
      }

      const archivo = await archivoService.obtenerArchivoPorId(idArchivo);

      return res.status(200).json({
        mensaje: 'Archivo obtenido exitosamente',
        archivo,
      });
    } catch (error) {
      console.error('Error al obtener archivo:', error);
      
      if (error.message === 'Archivo no encontrado') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ 
        error: error.message || 'Error al obtener el archivo' 
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
        return res.status(400).json({ 
          error: 'El idArchivo es requerido' 
        });
      }

      const resultado = await archivoService.eliminarArchivo(idArchivo);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      
      if (error.message === 'Archivo no encontrado') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ 
        error: error.message || 'Error al eliminar el archivo' 
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
        return res.status(400).json({ 
          error: 'El idArchivo es requerido' 
        });
      }

      const urlData = await archivoService.generarUrlFirmada(
        idArchivo, 
        expiresIn ? parseInt(expiresIn) : 3600
      );

      return res.status(200).json({
        mensaje: 'URL firmada generada exitosamente',
        ...urlData,
      });
    } catch (error) {
      console.error('Error al generar URL firmada:', error);
      
      if (error.message === 'Archivo no encontrado') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ 
        error: error.message || 'Error al generar URL firmada' 
      });
    }
  },
};

module.exports = archivoController;
