/*
===========================================================
SCRIPT: 03_test_queries.sql
PROYECTO: CompraSmart
DESCRIPCIÓN:
Consultas de validación para comprobar que la estructura
de la base de datos funciona correctamente y que las
relaciones entre tablas fueron implementadas de forma
coherente.

OBJETIVO:
- Validar inserción de datos
- Validar relaciones entre entidades
- Obtener evidencias para capturas de pantalla
- Apoyar la revisión técnica de la Semana 4
===========================================================
*/

-- =========================================================
-- 1. LISTAR ROLES DEL SISTEMA
-- VALIDA:
-- - existencia de los dos perfiles funcionales
-- =========================================================
SELECT
    id_rol,
    nombre_rol
FROM rol
ORDER BY id_rol;


-- =========================================================
-- 2. LISTAR USUARIOS CON SU ROL
-- VALIDA:
-- - relación entre usuario y rol
-- =========================================================
SELECT
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.correo,
    u.estado,
    r.nombre_rol AS rol
FROM usuario u
INNER JOIN rol r
    ON u.id_rol = r.id_rol
ORDER BY u.id_usuario;


-- =========================================================
-- 3. MOSTRAR PERFIL EMPRESA DEL USUARIO PROVEEDOR
-- VALIDA:
-- - relación 1 a 1 entre usuario y perfil_empresa
-- =========================================================
SELECT
    u.id_usuario,
    u.nombre || ' ' || u.apellido AS usuario,
    pe.nombre_empresa,
    pe.rut_empresa,
    pe.rubro,
    pe.region,
    pe.tamano_empresa,
    pe.categoria_interes,
    pe.monto_min_interes,
    pe.monto_max_interes
FROM perfil_empresa pe
INNER JOIN usuario u
    ON pe.id_usuario = u.id_usuario
ORDER BY pe.id_perfil;


-- =========================================================
-- 4. LISTAR OPORTUNIDADES REGISTRADAS
-- VALIDA:
-- - carga correcta de oportunidades
-- =========================================================
SELECT
    id_oportunidad,
    codigo_externo,
    titulo,
    organismo,
    categoria,
    region,
    monto_referencial,
    fecha_publicacion,
    fecha_cierre,
    estado_oportunidad
FROM oportunidad
ORDER BY id_oportunidad;


-- =========================================================
-- 5. LISTAR HISTÓRICOS DE ADJUDICACIÓN POR OPORTUNIDAD
-- VALIDA:
-- - relación entre oportunidad e historial_adjudicacion
-- =========================================================
SELECT
    o.codigo_externo,
    o.titulo,
    h.id_historial,
    h.proveedor_adjudicado,
    h.organismo_adjudicador,
    h.monto_adjudicado,
    h.cantidad_oferentes,
    h.fecha_adjudicacion
FROM historial_adjudicacion h
INNER JOIN oportunidad o
    ON h.id_oportunidad = o.id_oportunidad
ORDER BY o.id_oportunidad, h.id_historial;


-- =========================================================
-- 6. MOSTRAR ANÁLISIS REALIZADOS POR USUARIO
-- VALIDA:
-- - relación entre usuario, análisis y oportunidad
-- =========================================================
SELECT
    a.id_analisis,
    u.nombre || ' ' || u.apellido AS usuario,
    o.codigo_externo,
    o.titulo,
    a.fecha_analisis,
    a.nivel_riesgo,
    a.precio_estimado,
    a.recomendacion
FROM analisis a
INNER JOIN usuario u
    ON a.id_usuario = u.id_usuario
INNER JOIN oportunidad o
    ON a.id_oportunidad = o.id_oportunidad
ORDER BY a.id_analisis;


-- =========================================================
-- 7. MOSTRAR QUÉ HISTÓRICOS SE USARON EN CADA ANÁLISIS
-- VALIDA:
-- - tabla intermedia analisis_historial
-- - relación muchos a muchos
-- =========================================================
SELECT
    a.id_analisis,
    o.codigo_externo,
    o.titulo,
    h.id_historial,
    h.proveedor_adjudicado,
    h.monto_adjudicado,
    h.fecha_adjudicacion
FROM analisis_historial ah
INNER JOIN analisis a
    ON ah.id_analisis = a.id_analisis
INNER JOIN historial_adjudicacion h
    ON ah.id_historial = h.id_historial
INNER JOIN oportunidad o
    ON a.id_oportunidad = o.id_oportunidad
ORDER BY a.id_analisis, h.id_historial;


-- =========================================================
-- 8. LISTAR ALERTAS CONFIGURADAS POR USUARIO
-- VALIDA:
-- - relación entre usuario y alerta
-- =========================================================
SELECT
    al.id_alerta,
    u.nombre || ' ' || u.apellido AS usuario,
    al.palabra_clave,
    al.categoria,
    al.region,
    al.monto_min,
    al.monto_max,
    al.frecuencia,
    al.estado_alerta,
    al.fecha_creacion
FROM alerta al
INNER JOIN usuario u
    ON al.id_usuario = u.id_usuario
ORDER BY al.id_alerta;


-- =========================================================
-- 9. LISTAR OPORTUNIDADES GUARDADAS POR USUARIO
-- VALIDA:
-- - relación entre usuario y oportunidad_guardada
-- =========================================================
SELECT
    og.id_guardado,
    u.nombre || ' ' || u.apellido AS usuario,
    o.codigo_externo,
    o.titulo,
    og.fecha_guardado
FROM oportunidad_guardada og
INNER JOIN usuario u
    ON og.id_usuario = u.id_usuario
INNER JOIN oportunidad o
    ON og.id_oportunidad = o.id_oportunidad
ORDER BY og.id_guardado;


-- =========================================================
-- 10. CONSULTA INTEGRADA DE VALIDACIÓN GENERAL
-- VALIDA:
-- - oportunidad
-- - análisis
-- - usuario
-- - oportunidades guardadas
-- - historial
-- =========================================================
SELECT
    o.codigo_externo,
    o.titulo,
    u.nombre || ' ' || u.apellido AS usuario_analiza,
    a.nivel_riesgo,
    a.precio_estimado,
    COUNT(DISTINCT h.id_historial) AS historicos_asociados,
    COUNT(DISTINCT og.id_guardado) AS veces_guardada
FROM oportunidad o
LEFT JOIN analisis a
    ON o.id_oportunidad = a.id_oportunidad
LEFT JOIN usuario u
    ON a.id_usuario = u.id_usuario
LEFT JOIN historial_adjudicacion h
    ON o.id_oportunidad = h.id_oportunidad
LEFT JOIN oportunidad_guardada og
    ON o.id_oportunidad = og.id_oportunidad
GROUP BY
    o.codigo_externo,
    o.titulo,
    u.nombre,
    u.apellido,
    a.nivel_riesgo,
    a.precio_estimado
ORDER BY o.codigo_externo;


-- =========================================================
-- 11. CONTEO DE REGISTROS POR TABLA
-- VALIDA:
-- - carga general de datos
-- - útil para revisión rápida
-- =========================================================
SELECT 'rol' AS tabla, COUNT(*) AS total FROM rol
UNION ALL
SELECT 'usuario', COUNT(*) FROM usuario
UNION ALL
SELECT 'perfil_empresa', COUNT(*) FROM perfil_empresa
UNION ALL
SELECT 'oportunidad', COUNT(*) FROM oportunidad
UNION ALL
SELECT 'historial_adjudicacion', COUNT(*) FROM historial_adjudicacion
UNION ALL
SELECT 'analisis', COUNT(*) FROM analisis
UNION ALL
SELECT 'analisis_historial', COUNT(*) FROM analisis_historial
UNION ALL
SELECT 'alerta', COUNT(*) FROM alerta
UNION ALL
SELECT 'oportunidad_guardada', COUNT(*) FROM oportunidad_guardada
ORDER BY tabla;


-- =========================================================
-- 12. CONSULTA ÚTIL PARA CAPTURA DE EVIDENCIA
-- SUGERIDA PARA EL INFORME
-- =========================================================
SELECT
    u.nombre || ' ' || u.apellido AS proveedor,
    pe.nombre_empresa,
    o.codigo_externo,
    o.titulo,
    a.nivel_riesgo,
    a.precio_estimado
FROM usuario u
INNER JOIN perfil_empresa pe
    ON u.id_usuario = pe.id_usuario
INNER JOIN analisis a
    ON u.id_usuario = a.id_usuario
INNER JOIN oportunidad o
    ON a.id_oportunidad = o.id_oportunidad
WHERE u.correo = 'proveedor@comprasmart.cl'
ORDER BY o.codigo_externo;