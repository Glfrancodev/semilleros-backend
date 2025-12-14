const express = require("express");
const router = express.Router();

const rolRoutes = require("./rol.routes");
const permisoRoutes = require("./permiso.routes");
const rolPermisoRoutes = require("./rolpermiso.routes"); // Rutas de RolPermiso
const usuarioRoutes = require("./usuario.routes"); // Rutas de Usuario
const dataSeederRoutes = require("./dataSeeder.routes"); // Importamos la ruta para poblar
const estudianteRoutes = require("./estudiante.routes"); // Rutas de Estudiante
const eventoRoutes = require("./evento.routes"); // Rutas de Evento
const estudianteEventoRoutes = require("./estudianteEvento.routes"); // Rutas de EstudianteEvento
const docenteRoutes = require("./docente.routes"); // Rutas de Docente
const administrativoRoutes = require("./administrativo.routes"); // Rutas de Administrativo
const grupoRoutes = require("./grupo.routes"); // Rutas de Grupo
const semestreRoutes = require("./semestre.routes"); // Rutas de Semestre
const materiaRoutes = require("./materia.routes"); // Rutas de Materia
const grupoMateriaRoutes = require("./grupoMateria.routes"); // Rutas de GrupoMateria
const archivoRoutes = require("./archivo.routes"); // Rutas de Archivo
const categoriaRoutes = require("./categoria.routes"); // Rutas de Categoria
const feriaRoutes = require("./feria.routes"); // Rutas de Convocatoria
const proyectoRoutes = require("./proyecto.routes"); // Rutas de Proyecto
const estudianteProyectoRoutes = require("./estudianteProyecto.routes"); // Rutas de EstudianteProyecto
const docenteProyectoRoutes = require("./docenteProyecto.routes"); // Rutas de DocenteProyecto
const revisionRoutes = require("./revision.routes"); // Rutas de Revision
const tipoCalificacionRoutes = require("./tipoCalificacion.routes"); // Rutas de TipoCalificacion
const subCalificacionRoutes = require("./subCalificacion.routes"); // Rutas de SubCalificacion
const calificacionRoutes = require("./calificacion.routes"); // Rutas de Calificacion
const areaRoutes = require("./area.routes"); // Rutas de Area
const areaCategoriaRoutes = require("./areaCategoria.routes"); // Rutas de AreaCategoria
const colaboracionRoutes = require("./colaboracion.routes"); // Rutas de Colaboración
const tareaRoutes = require("./tarea.routes"); // Rutas de Tarea
const reportsRoutes = require("./reports.routes"); // Rutas de Reportes

router.use("/grupo-materias", grupoMateriaRoutes); // 👉 /api/grupo-materias

// Rutas de Archivos
router.use("/archivos", archivoRoutes); // 👉 /api/archivos

// Rutas de Categorias
router.use("/categorias", categoriaRoutes); // 👉 /api/categorias

// Rutas de Ferias
router.use("/ferias", feriaRoutes); // 👉 /api/ferias

// Rutas de Proyectos
router.use("/proyectos", proyectoRoutes); // 👉 /api/proyectos

// Rutas de EstudianteProyecto
router.use("/estudiante-proyectos", estudianteProyectoRoutes); // 👉 /api/estudiante-proyectos

// Rutas de DocenteProyecto
router.use("/docente-proyectos", docenteProyectoRoutes); // 👉 /api/docente-proyectos

// Rutas de Revisiones
router.use("/revisiones", revisionRoutes); // 👉 /api/revisiones

// Rutas de TipoCalificacion
router.use("/tipos-calificacion", tipoCalificacionRoutes); // 👉 /api/tipos-calificacion

// Rutas de SubCalificacion
router.use("/sub-calificaciones", subCalificacionRoutes); // 👉 /api/sub-calificaciones

// Rutas de Calificacion
router.use("/calificaciones", calificacionRoutes); // 👉 /api/calificaciones

// Rutas de Area
router.use("/areas", areaRoutes); // 👉 /api/areas

// Rutas de AreaCategoria
router.use("/area-categorias", areaCategoriaRoutes); // 👉 /api/area-categorias

// Rutas de Tareas
router.use("/tareas", tareaRoutes); // 👉 /api/tareas

// Ruta para manejar Materias
router.use("/materias", materiaRoutes); // 👉 /api/materias

router.use("/semestres", semestreRoutes); // 👉 /api/semestres

router.use("/grupos", grupoRoutes); // 👉 /api/grupos

router.use("/docentes", docenteRoutes); // 👉 /api/docentes

router.use("/administrativos", administrativoRoutes); // 👉 /api/administrativos

router.use("/estudiante-eventos", estudianteEventoRoutes); // 👉 /api/estudiante-eventos

// Ruta para manejar Eventos
router.use("/eventos", eventoRoutes); // 👉 /api/eventos

// Ruta para manejar Estudiantes
router.use("/estudiantes", estudianteRoutes); // 👉 /api/estudiantes

// Definir las rutas principales de la API
router.use("/roles", rolRoutes); // 👉 /api/roles
router.use("/permisos", permisoRoutes); // 👉 /api/permisos
router.use("/rol-permisos", rolPermisoRoutes); // 👉 /api/rol-permisos
router.use("/usuarios", usuarioRoutes); // 👉 /api/usuarios
router.use("/seed", dataSeederRoutes); // Asociamos la nueva ruta
router.use("/colaboracion", colaboracionRoutes); // 👉 /api/colaboracion

// Rutas de Reportes
router.use("/reports/feria-actual", reportsRoutes); // 👉 /api/reports/feria-actual

// Ruta para manejar EstudianteProyecto
router.use("/api/estudiante-proyecto", estudianteProyectoRoutes);

module.exports = router;
