const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const db = require("../models");
const Archivo = db.Archivo;
const Proyecto = db.Proyecto;

// Configurar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const archivoService = {
  /**
   * Subir archivo a S3 y guardar en BD
   * Puede ser para: proyecto, revisión, o foto de perfil (usuario)
   */
  async subirArchivo(file, options = {}) {
    try {
      const { idProyecto, idRevision, idUsuario } = options;

      // Validar que al menos uno de los IDs esté presente
      if (!idProyecto && !idUsuario) {
        throw new Error("Se requiere idProyecto o idUsuario");
      }

      // Verificar que el proyecto existe (si se proporciona)
      if (idProyecto) {
        const proyecto = await Proyecto.findByPk(idProyecto);
        if (!proyecto) {
          throw new Error("Proyecto no encontrado");
        }
      }

      // Verificar que la revisión existe (si se proporciona)
      if (idRevision) {
        const revision = await db.Revision.findByPk(idRevision);
        if (!revision) {
          throw new Error("Revisión no encontrada");
        }
      }

      // Verificar que el usuario existe (si se proporciona)
      if (idUsuario) {
        const usuario = await db.Usuario.findByPk(idUsuario);
        if (!usuario) {
          throw new Error("Usuario no encontrado");
        }
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      let fileName;

      if (idUsuario) {
        // Para fotos de perfil
        fileName = `usuarios/${idUsuario}/perfil/${timestamp}-${file.originalname}`;
      } else {
        // Para archivos de proyecto
        fileName = `proyectos/${idProyecto}/${timestamp}-${file.originalname}`;
      }

      // Subir a S3
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // Construir URL del archivo
      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      // Extraer formato (extensión)
      const formato = file.originalname.split(".").pop();

      // Calcular tamaño en MB
      const tamanoMB = file.size / (1024 * 1024);

      // Guardar en BD
      const archivo = await Archivo.create({
        nombre: file.originalname,
        formato: formato,
        tamano: parseFloat(tamanoMB.toFixed(2)),
        url: url,
        idProyecto: idProyecto || null,
        idRevision: idRevision || null,
        idUsuario: idUsuario || null,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return archivo;
    } catch (error) {
      console.error("Error en subirArchivo:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los archivos de un proyecto con URLs firmadas
   */
  async obtenerArchivosPorProyecto(idProyecto) {
    try {
      const archivos = await Archivo.findAll({
        where: { idProyecto },
        order: [["fechaCreacion", "DESC"]],
      });

      // Generar URLs firmadas para cada archivo
      const archivosConUrlFirmada = await Promise.all(
        archivos.map(async (archivo) => {
          const url = new URL(archivo.url);
          const key = url.pathname.substring(1);

          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          });

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          }); // 1 hora

          return {
            ...archivo.toJSON(),
            urlFirmada: signedUrl,
            expiraEn: "1 hora",
          };
        })
      );

      return archivosConUrlFirmada;
    } catch (error) {
      console.error("Error en obtenerArchivosPorProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los archivos de una revisión con URLs firmadas
   */
  async obtenerArchivosPorRevision(idRevision) {
    try {
      const archivos = await Archivo.findAll({
        where: { idRevision },
        include: [
          {
            model: Proyecto,
            as: "proyecto",
            attributes: ["idProyecto", "nombre"],
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      // Generar URLs firmadas para cada archivo
      const archivosConUrlFirmada = await Promise.all(
        archivos.map(async (archivo) => {
          const url = new URL(archivo.url);
          const key = url.pathname.substring(1);

          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          });

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          }); // 1 hora

          return {
            ...archivo.toJSON(),
            urlFirmada: signedUrl,
            expiraEn: "1 hora",
          };
        })
      );

      return archivosConUrlFirmada;
    } catch (error) {
      console.error("Error en obtenerArchivosPorRevision:", error);
      throw error;
    }
  },

  /**
   * Obtener un archivo específico por ID con URL firmada
   */
  async obtenerArchivoPorId(idArchivo) {
    try {
      const archivo = await Archivo.findByPk(idArchivo, {
        include: [
          {
            model: Proyecto,
            as: "proyecto",
            attributes: ["idProyecto", "nombre"],
          },
          {
            model: db.Revision,
            as: "revision",
            attributes: ["idRevision", "nombre", "fechaLimite"],
          },
        ],
      });

      if (!archivo) {
        throw new Error("Archivo no encontrado");
      }

      // Generar URL firmada
      const url = new URL(archivo.url);
      const key = url.pathname.substring(1);

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      }); // 1 hora

      return {
        ...archivo.toJSON(),
        urlFirmada: signedUrl,
        expiraEn: "1 hora",
      };
    } catch (error) {
      console.error("Error en obtenerArchivoPorId:", error);
      throw error;
    }
  },

  /**
   * Eliminar archivo de S3 y BD
   */
  async eliminarArchivo(idArchivo) {
    try {
      const archivo = await Archivo.findByPk(idArchivo);

      if (!archivo) {
        throw new Error("Archivo no encontrado");
      }

      // Extraer la Key del archivo desde la URL
      const url = new URL(archivo.url);
      const key = url.pathname.substring(1); // Remover el '/' inicial

      // Eliminar de S3
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      await s3Client.send(new DeleteObjectCommand(deleteParams));

      // Eliminar de BD
      await archivo.destroy();

      return { mensaje: "Archivo eliminado exitosamente" };
    } catch (error) {
      console.error("Error en eliminarArchivo:", error);
      throw error;
    }
  },

  /**
   * Generar URL firmada temporal (opcional, para mayor seguridad)
   */
  async generarUrlFirmada(idArchivo, expiresIn = 3600) {
    try {
      const archivo = await Archivo.findByPk(idArchivo);

      if (!archivo) {
        throw new Error("Archivo no encontrado");
      }

      const url = new URL(archivo.url);
      const key = url.pathname.substring(1);

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

      return { url: signedUrl, expiresIn };
    } catch (error) {
      console.error("Error en generarUrlFirmada:", error);
      throw error;
    }
  },
};

module.exports = archivoService;
