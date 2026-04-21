/*
===========================================================
SCRIPT: 02_seed_data.sql
PROYECTO: CompraSmart
DESCRIPCIÓN:
Carga de datos de prueba para validar el funcionamiento
de la base de datos relacional del sistema CompraSmart.

CONSIDERACIONES:
- Este script debe ejecutarse después de 01_create_schema.sql
- Inserta datos mínimos pero suficientes para probar:
  - roles
  - usuarios
  - perfiles de empresa
  - oportunidades
  - históricos de adjudicación
  - análisis
  - relación análisis-historial
  - alertas
  - oportunidades guardadas
===========================================================
*/

-- =========================================================
-- USUARIOS
-- =========================================================
-- Se insertan dos usuarios:
-- 1) administrador
-- 2) proveedor

INSERT INTO usuario (
    id_rol,
    nombre,
    apellido,
    correo,
    contrasena,
    estado
)
VALUES
(
    (SELECT id_rol FROM rol WHERE nombre_rol = 'administrador'),
    'Luis',
    'Montero',
    'admin@comprasmart.cl',
    '$2b$10$adminhashsimulado1234567890',
    'activo'
),
(
    (SELECT id_rol FROM rol WHERE nombre_rol = 'proveedor'),
    'Carolina',
    'Rojas',
    'proveedor@comprasmart.cl',
    '$2b$10$proveedorhashsimulado12345',
    'activo'
);

-- =========================================================
-- PERFIL EMPRESA
-- =========================================================
-- Se crea perfil solo para el usuario proveedor

INSERT INTO perfil_empresa (
    id_usuario,
    nombre_empresa,
    rut_empresa,
    rubro,
    region,
    tamano_empresa,
    categoria_interes,
    monto_min_interes,
    monto_max_interes
)
VALUES
(
    (SELECT id_usuario FROM usuario WHERE correo = 'proveedor@comprasmart.cl'),
    'Soluciones Técnicas SpA',
    '76.123.456-7',
    'Tecnología y servicios informáticos',
    'Metropolitana',
    'Pequeña empresa',
    'Equipamiento tecnológico',
    500000,
    5000000
);

-- =========================================================
-- OPORTUNIDADES
-- =========================================================

INSERT INTO oportunidad (
    codigo_externo,
    titulo,
    organismo,
    descripcion,
    categoria,
    region,
    monto_referencial,
    fecha_publicacion,
    fecha_cierre,
    estado_oportunidad
)
VALUES
(
    'OC-2026-001',
    'Adquisición de notebooks para unidad administrativa',
    'Municipalidad de Santiago',
    'Compra de notebooks para renovación de equipamiento de oficina.',
    'Equipamiento tecnológico',
    'Metropolitana',
    3200000,
    '2026-04-01',
    '2026-04-10',
    'activa'
),
(
    'OC-2026-002',
    'Servicio de soporte y mantención computacional',
    'Hospital Regional de Rancagua',
    'Contratación de soporte técnico preventivo y correctivo para equipos computacionales.',
    'Servicios informáticos',
    'O Higgins',
    4500000,
    '2026-04-02',
    '2026-04-12',
    'activa'
),
(
    'OC-2026-003',
    'Compra de impresoras multifuncionales',
    'Gobernación de Valparaíso',
    'Adquisición de impresoras multifuncionales para oficinas regionales.',
    'Equipamiento de oficina',
    'Valparaíso',
    1800000,
    '2026-04-03',
    '2026-04-11',
    'cerrada'
);

-- =========================================================
-- HISTORIAL DE ADJUDICACIÓN
-- =========================================================

INSERT INTO historial_adjudicacion (
    id_oportunidad,
    proveedor_adjudicado,
    organismo_adjudicador,
    monto_adjudicado,
    cantidad_oferentes,
    fecha_adjudicacion
)
VALUES
(
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001'),
    'TecnoCompra SpA',
    'Municipalidad de Santiago',
    2980000,
    4,
    '2025-11-15'
),
(
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001'),
    'Digital Pro Ltda.',
    'Municipalidad de Santiago',
    3050000,
    5,
    '2025-08-20'
),
(
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-002'),
    'Servicios TI Integrales',
    'Hospital Regional de Rancagua',
    4300000,
    3,
    '2025-10-10'
),
(
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-002'),
    'Soporte Empresarial Chile',
    'Hospital Regional de Rancagua',
    4100000,
    4,
    '2025-07-05'
),
(
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-003'),
    'Office Market SpA',
    'Gobernación de Valparaíso',
    1720000,
    6,
    '2025-09-12'
);

-- =========================================================
-- ANÁLISIS
-- =========================================================

INSERT INTO analisis (
    id_usuario,
    id_oportunidad,
    nivel_riesgo,
    recomendacion,
    precio_estimado
)
VALUES
(
    (SELECT id_usuario FROM usuario WHERE correo = 'proveedor@comprasmart.cl'),
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001'),
    'bajo',
    'Oportunidad recomendable para participar por monto y comportamiento histórico.',
    3010000
),
(
    (SELECT id_usuario FROM usuario WHERE correo = 'proveedor@comprasmart.cl'),
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-002'),
    'medio',
    'Oportunidad viable, pero con mayor competencia y variación de precios.',
    4200000
);

-- =========================================================
-- ANÁLISIS_HISTORIAL
-- =========================================================
-- Se vinculan los análisis con los históricos usados como referencia

INSERT INTO analisis_historial (
    id_analisis,
    id_historial
)
VALUES
(
    (SELECT id_analisis
     FROM analisis
     WHERE id_oportunidad = (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001')
     LIMIT 1),
    (SELECT id_historial
     FROM historial_adjudicacion
     WHERE id_oportunidad = (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001')
     ORDER BY id_historial
     LIMIT 1)
),
(
    (SELECT id_analisis
     FROM analisis
     WHERE id_oportunidad = (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001')
     LIMIT 1),
    (SELECT id_historial
     FROM historial_adjudicacion
     WHERE id_oportunidad = (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001')
     ORDER BY id_historial
     OFFSET 1 LIMIT 1)
),
(
    (SELECT id_analisis
     FROM analisis
     WHERE id_oportunidad = (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-002')
     LIMIT 1),
    (SELECT id_historial
     FROM historial_adjudicacion
     WHERE id_oportunidad = (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-002')
     ORDER BY id_historial
     LIMIT 1)
);

-- =========================================================
-- ALERTAS
-- =========================================================

INSERT INTO alerta (
    id_usuario,
    palabra_clave,
    categoria,
    region,
    monto_min,
    monto_max,
    frecuencia,
    estado_alerta
)
VALUES
(
    (SELECT id_usuario FROM usuario WHERE correo = 'proveedor@comprasmart.cl'),
    'notebooks',
    'Equipamiento tecnológico',
    'Metropolitana',
    1000000,
    5000000,
    'diaria',
    'activa'
),
(
    (SELECT id_usuario FROM usuario WHERE correo = 'proveedor@comprasmart.cl'),
    'soporte',
    'Servicios informáticos',
    'O Higgins',
    2000000,
    6000000,
    'semanal',
    'activa'
);

-- =========================================================
-- OPORTUNIDADES GUARDADAS
-- =========================================================

INSERT INTO oportunidad_guardada (
    id_oportunidad,
    id_usuario,
    fecha_guardado
)
VALUES
(
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-001'),
    (SELECT id_usuario FROM usuario WHERE correo = 'proveedor@comprasmart.cl'),
    CURRENT_DATE
),
(
    (SELECT id_oportunidad FROM oportunidad WHERE codigo_externo = 'OC-2026-002'),
    (SELECT id_usuario FROM usuario WHERE correo = 'proveedor@comprasmart.cl'),
    CURRENT_DATE
);

-- =========================================================
-- VALIDACIÓN FINAL BÁSICA
-- =========================================================
/*
Al finalizar este script, deberías tener:
- 2 roles
- 2 usuarios
- 1 perfil de empresa
- 3 oportunidades
- 5 históricos de adjudicación
- 2 análisis
- 3 relaciones en analisis_historial
- 2 alertas
- 2 oportunidades guardadas
*/