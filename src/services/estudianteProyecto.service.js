const db = require("../models");
const EstudianteProyecto = db.EstudianteProyecto;
const Estudiante = db.Estudiante;
const Proyecto = db.Proyecto;

const estudianteProyectoService = {
  /**
   * Asignar un estudiante a un proyecto
   */
  async asignarEstudianteAProyecto(data) {
    try {
      const estudianteProyecto = await EstudianteProyecto.create({
        idEstudiante: data.idEstudiante,
        idProyecto: data.idProyecto,
        esLider: data.esLider || false,
        invitacion: data.invitacion || true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return estudianteProyecto;
    } catch (error) {
      console.error("Error en asignarEstudianteAProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las asignaciones
   */
  async obtenerAsignaciones() {
    try {
      const asignaciones = await EstudianteProyecto.findAll({
        include: [
          {
            model: Estudiante,
            as: "estudiante",
          },
          {
            model: Proyecto,
            as: "proyecto",
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return asignaciones;
    } catch (error) {
      console.error("Error en obtenerAsignaciones:", error);
      throw error;
    }
  },

  /**
   * Obtener estudiantes de un proyecto
   */
  async obtenerEstudiantesPorProyecto(idProyecto) {
    try {
      const estudiantes = await EstudianteProyecto.findAll({
        where: { idProyecto },
        include: [
          {
            model: Estudiante,
            as: "estudiante",
            attributes: ["codigoEstudiante", "idUsuario"],
            include: [
              {
                model: db.Usuario,
                as: "usuario",
                attributes: ["idUsuario", "nombre", "apellido"],
              },
            ],
          },
        ],
      });

      const formattedEstudiantes = estudiantes.map((ep) => ({
        idEstudianteProyecto: ep.idEstudianteProyecto,
        codigo: ep.estudiante.codigoEstudiante,
        nombreCompleto: `${ep.estudiante.usuario.nombre} ${ep.estudiante.usuario.apellido}`,
        invitacion: ep.invitacion,
        esLider: ep.esLider || false,
      }));

      return formattedEstudiantes;
    } catch (error) {
      console.error("Error en obtenerEstudiantesPorProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos de un estudiante
   */
  async obtenerProyectosPorEstudiante(idEstudiante) {
    try {
      const proyectos = await EstudianteProyecto.findAll({
        where: { idEstudiante },
        include: [
          {
            model: Proyecto,
            as: "proyecto",
          },
        ],
      });

      return proyectos;
    } catch (error) {
      console.error("Error en obtenerProyectosPorEstudiante:", error);
      throw error;
    }
  },

  /**
   * Actualizar asignación (cambiar si es líder)
   */
  async actualizarAsignacion(idEstudianteProyecto, data) {
    try {
      const asignacion = await EstudianteProyecto.findByPk(
        idEstudianteProyecto
      );

      if (!asignacion) {
        throw new Error("Asignación no encontrada");
      }

      await asignacion.update({
        esLider: data.esLider !== undefined ? data.esLider : asignacion.esLider,
        invitacion:
          data.invitacion !== undefined
            ? data.invitacion
            : asignacion.invitacion,
        fechaActualizacion: new Date(),
      });

      return asignacion;
    } catch (error) {
      console.error("Error en actualizarAsignacion:", error);
      throw error;
    }
  },

  /**
   * Eliminar asignación (quitar estudiante de proyecto)
   */
  async eliminarAsignacion(idEstudianteProyecto) {
    try {
      const asignacion = await EstudianteProyecto.findByPk(
        idEstudianteProyecto
      );

      if (!asignacion) {
        throw new Error("Asignación no encontrada");
      }

      await asignacion.destroy();

      return { mensaje: "Estudiante removido del proyecto exitosamente" };
    } catch (error) {
      console.error("Error en eliminarAsignacion:", error);
      throw error;
    }
  },

  /**
   * Crear una nueva invitación
   */
  async crearInvitacion({ idEstudiante, idProyecto }) {
    try {
      const nuevaInvitacion = await EstudianteProyecto.create({
        idEstudiante,
        idProyecto,
        esLider: false,
        invitacion: null,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return nuevaInvitacion;
    } catch (error) {
      console.error("Error al crear invitación:", error);
      throw error;
    }
  },

  /**
   * Obtener invitaciones del estudiante autenticado
   */
  async obtenerMisInvitaciones(idEstudiante) {
    try {
      const invitaciones = await EstudianteProyecto.findAll({
        where: { idEstudiante, esLider: false },
        include: [
          {
            model: Proyecto,
            as: "proyecto",
            attributes: ["idProyecto", "nombre", "descripcion"],
            include: [
              {
                model: db.GrupoMateria,
                as: "grupoMateria",
                include: [
                  { model: db.Materia, as: "materia", attributes: ["nombre"] },
                  { model: db.Grupo, as: "grupo", attributes: ["sigla"] },
                  {
                    model: db.Docente,
                    as: "docente",
                    include: [
                      {
                        model: db.Usuario,
                        as: "usuario",
                        attributes: ["nombre", "apellido"],
                      },
                    ],
                  },
                ],
              },
              {
                model: EstudianteProyecto,
                as: "estudiantesProyecto",
                where: { esLider: true },
                required: false,
                include: [
                  {
                    model: Estudiante,
                    as: "estudiante",
                    attributes: ["codigoEstudiante"],
                    include: [
                      {
                        model: db.Usuario,
                        as: "usuario",
                        attributes: ["nombre", "apellido"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      // Formatear respuesta con datos útiles para el frontend
      const invitacionesFormateadas = invitaciones.map((inv) => {
        const proyecto = inv.proyecto || {};
        const grupoMateria = proyecto.grupoMateria || {};
        const liderEP = (proyecto.estudiantesProyecto || [])[0];
        const liderUsuario = liderEP?.estudiante?.usuario;

        return {
          idEstudianteProyecto: inv.idEstudianteProyecto,
          invitacion: inv.invitacion,
          fechaCreacion: inv.fechaCreacion,
          proyecto: {
            idProyecto: proyecto.idProyecto,
            nombre: proyecto.nombre,
            descripcion: proyecto.descripcion,
            materia: grupoMateria?.materia?.nombre,
            grupo: grupoMateria?.grupo?.sigla,
            nombreDocente: grupoMateria?.docente?.usuario
              ? `${grupoMateria.docente.usuario.nombre} ${grupoMateria.docente.usuario.apellido}`
              : undefined,
            lider: liderUsuario
              ? `${liderUsuario.nombre} ${liderUsuario.apellido}`
              : undefined,
          },
        };
      });

      return invitacionesFormateadas;
    } catch (error) {
      console.error("Error al obtener invitaciones:", error);
      throw error;
    }
  },
};

module.exports = estudianteProyectoService;
