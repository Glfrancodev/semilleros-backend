/**
 * Middleware para estandarizar las respuestas de la API
 * Extiende el objeto response con métodos personalizados
 */

const responseHandler = (req, res, next) => {
  /**
   * Respuesta exitosa
   * @param {string} message - Mensaje descriptivo
   * @param {*} data - Datos a devolver (objeto, array, null)
   * @param {number} statusCode - Código HTTP (por defecto 200)
   */
  res.success = (message, data = null, statusCode = 200) => {
    const response = {
      success: true,
      message,
      data,
    };

    return res.status(statusCode).json(response);
  };

  /**
   * Respuesta de error
   * @param {string} message - Mensaje de error para el usuario
   * @param {number} statusCode - Código HTTP (por defecto 500)
   * @param {object} errorDetails - Detalles adicionales del error
   */
  res.error = (message, statusCode = 500, errorDetails = null) => {
    const response = {
      success: false,
      message,
    };

    // Solo agregar error si hay detalles
    if (errorDetails) {
      response.error = errorDetails;
    }

    return res.status(statusCode).json(response);
  };

  /**
   * Respuesta de error de validación
   * @param {string} message - Mensaje de error
   * @param {array|object} validationErrors - Errores de validación
   */
  res.validationError = (message, validationErrors = null) => {
    return res.error(message, 400, {
      code: "VALIDATION_ERROR",
      details: validationErrors,
    });
  };

  /**
   * Respuesta de recurso no encontrado
   * @param {string} resource - Nombre del recurso (ej: 'Usuario', 'Proyecto')
   */
  res.notFound = (resource = "Recurso") => {
    return res.error(`${resource} no encontrado`, 404, {
      code: "NOT_FOUND",
    });
  };

  /**
   * Respuesta de no autorizado
   * @param {string} message - Mensaje personalizado
   */
  res.unauthorized = (message = "No autorizado") => {
    return res.error(message, 401, {
      code: "UNAUTHORIZED",
    });
  };

  /**
   * Respuesta de prohibido (sin permisos)
   * @param {string} message - Mensaje personalizado
   */
  res.forbidden = (
    message = "No tienes permisos para realizar esta acción"
  ) => {
    return res.error(message, 403, {
      code: "FORBIDDEN",
    });
  };

  next();
};

module.exports = responseHandler;
