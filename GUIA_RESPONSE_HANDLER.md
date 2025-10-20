# 📘 Guía de Uso - Response Handler Middleware

## 🎯 Métodos Disponibles

### ✅ `res.success(message, data, statusCode)`

Para respuestas exitosas.

**Parámetros:**

- `message` (string): Mensaje descriptivo
- `data` (any): Datos a devolver (objeto, array, null)
- `statusCode` (number): Código HTTP (default: 200)

**Ejemplos:**

```javascript
// GET - Obtener lista
async obtenerUsuarios(req, res) {
  const usuarios = await usuarioService.obtenerUsuarios();
  return res.success('Usuarios obtenidos exitosamente', {
    count: usuarios.length,
    items: usuarios
  });
}

// GET - Obtener uno
async obtenerUsuarioPorId(req, res) {
  const usuario = await usuarioService.obtenerUsuarioPorId(idUsuario);
  return res.success('Usuario obtenido exitosamente', usuario);
}

// POST - Crear
async crearUsuario(req, res) {
  const usuario = await usuarioService.crearUsuario(req.body);
  return res.success('Usuario creado exitosamente', usuario, 201);
}

// PUT - Actualizar
async actualizarUsuario(req, res) {
  const usuario = await usuarioService.actualizarUsuario(idUsuario, req.body);
  return res.success('Usuario actualizado exitosamente', usuario);
}

// DELETE
async eliminarUsuario(req, res) {
  await usuarioService.eliminarUsuario(idUsuario);
  return res.success('Usuario eliminado exitosamente', null);
}

// LOGIN
async login(req, res) {
  const { token, user } = await authService.login(correo, password);
  return res.success('Inicio de sesión exitoso', { token, user });
}
```

---

### ❌ `res.error(message, statusCode, errorDetails)`

Para errores generales.

**Parámetros:**

- `message` (string): Mensaje de error para el usuario
- `statusCode` (number): Código HTTP (default: 500)
- `errorDetails` (object): Detalles adicionales (opcional)

**Ejemplos:**

```javascript
// Error general
catch (error) {
  return res.error('Error al obtener usuarios', 500, {
    code: 'DATABASE_ERROR',
    details: error.message
  });
}

// Error personalizado
if (!proyecto) {
  return res.error('El proyecto no puede estar vacío', 400);
}
```

---

### ❌ `res.validationError(message, validationErrors)`

Para errores de validación (400).

**Ejemplos:**

```javascript
// Validación simple
if (!nombre || !correo) {
  return res.validationError("Los campos nombre y correo son requeridos");
}

// Validación con detalles
const errores = [];
if (!nombre)
  errores.push({ campo: "nombre", mensaje: "El nombre es requerido" });
if (!correo)
  errores.push({ campo: "correo", mensaje: "El correo es requerido" });
if (errores.length > 0) {
  return res.validationError("Errores de validación", errores);
}
```

---

### ❌ `res.notFound(resource)`

Para recursos no encontrados (404).

**Ejemplos:**

```javascript
const usuario = await usuarioService.obtenerUsuarioPorId(idUsuario);
if (!usuario) {
  return res.notFound("Usuario");
}

// También funciona con:
if (!proyecto) {
  return res.notFound("Proyecto");
}
```

---

### ❌ `res.unauthorized(message)`

Para usuarios no autenticados (401).

**Ejemplos:**

```javascript
if (!token) {
  return res.unauthorized("Token no proporcionado");
}

if (!isValidToken) {
  return res.unauthorized("Token inválido o expirado");
}

// Credenciales incorrectas
if (!usuario || !isValidPassword) {
  return res.unauthorized("Credenciales incorrectas");
}
```

---

### ❌ `res.forbidden(message)`

Para usuarios sin permisos (403).

**Ejemplos:**

```javascript
if (!tienePermiso) {
  return res.forbidden();
}

if (usuario.rol !== "admin") {
  return res.forbidden("Solo administradores pueden realizar esta acción");
}
```

---

## 🔄 Ejemplos de Migración

### ANTES:

```javascript
async obtenerUsuarios(req, res) {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();
    return res.status(200).json({
      mensaje: 'Usuarios obtenidos exitosamente',
      cantidad: usuarios.length,
      usuarios,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al obtener usuarios',
    });
  }
}
```

### DESPUÉS:

```javascript
async obtenerUsuarios(req, res) {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();
    return res.success('Usuarios obtenidos exitosamente', {
      count: usuarios.length,
      items: usuarios
    });
  } catch (error) {
    return res.error('Error al obtener usuarios', 500, {
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
}
```

---

## 📦 Formato de Respuesta Estándar

### ✅ Respuesta Exitosa:

```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "idUsuario": "uuid",
    "nombre": "Gabriel",
    ...
  }
}
```

### ❌ Respuesta de Error:

```json
{
  "success": false,
  "message": "Usuario no encontrado",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

### ❌ Respuesta de Validación:

```json
{
  "success": false,
  "message": "Errores de validación",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "campo": "nombre", "mensaje": "El nombre es requerido" }]
  }
}
```

---

## 🎨 Mejores Prácticas

1. **Usa el método específico** para cada tipo de error
2. **Proporciona mensajes claros** para el usuario
3. **Incluye detalles técnicos** solo cuando sea útil para debugging
4. **Mantén consistencia** en los nombres de propiedades (usa `items` para arrays, `count` para cantidad)
5. **Usa códigos HTTP apropiados**:
   - 200: OK
   - 201: Created
   - 400: Bad Request (validación)
   - 401: Unauthorized (no autenticado)
   - 403: Forbidden (sin permisos)
   - 404: Not Found
   - 500: Internal Server Error

---

## 🚀 Próximos Pasos

1. Actualiza un controlador de prueba (ejemplo: `usuario.controller.js`)
2. Prueba los endpoints con Postman
3. Una vez verificado, actualiza los demás controladores gradualmente
4. Actualiza el frontend para usar el nuevo formato de respuestas
