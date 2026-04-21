/*
===========================================================
SCRIPT: 01_create_schema.sql
PROYECTO: CompraSmart
DESCRIPCIÓN:
Creación del esquema relacional inicial del sistema
CompraSmart en PostgreSQL, basado en el DER vigente.

CONSIDERACIONES:
- Se modelan los dos perfiles funcionales del sistema:
  1) Administrador
  2) Usuario Proveedor
- Los permisos funcionales se controlan desde la aplicación
  mediante la tabla "rol" y la sesión del usuario.
- Este script crea:
  - Tipos ENUM
  - Tablas
  - Restricciones
  - Claves primarias y foráneas
  - Restricciones de unicidad
  - Índices básicos
===========================================================
*/

-- =========================================================
-- LIMPIEZA PREVIA (SOLO PARA DESARROLLO LOCAL)
-- =========================================================
-- Se eliminan tablas en orden inverso de dependencia.
-- Esto facilita volver a ejecutar el script durante pruebas.

DROP TABLE IF EXISTS analisis_historial CASCADE;
DROP TABLE IF EXISTS oportunidad_guardada CASCADE;
DROP TABLE IF EXISTS alerta CASCADE;
DROP TABLE IF EXISTS analisis CASCADE;
DROP TABLE IF EXISTS historial_adjudicacion CASCADE;
DROP TABLE IF EXISTS oportunidad CASCADE;
DROP TABLE IF EXISTS perfil_empresa CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS rol CASCADE;

DROP TYPE IF EXISTS estado_usuario_enum CASCADE;
DROP TYPE IF EXISTS nivel_riesgo_enum CASCADE;
DROP TYPE IF EXISTS frecuencia_alerta_enum CASCADE;
DROP TYPE IF EXISTS estado_alerta_enum CASCADE;
DROP TYPE IF EXISTS estado_oportunidad_enum CASCADE;

-- =========================================================
-- CREACIÓN DE TIPOS ENUM
-- =========================================================

/*
Estado del usuario dentro del sistema.
Permite habilitar o deshabilitar cuentas sin eliminarlas.
*/
CREATE TYPE estado_usuario_enum AS ENUM ('activo', 'inactivo');

/*
Clasificación del análisis de riesgo de una oportunidad.
*/
CREATE TYPE nivel_riesgo_enum AS ENUM ('alto', 'medio', 'bajo');

/*
Frecuencia definida por el usuario para alertas.
*/
CREATE TYPE frecuencia_alerta_enum AS ENUM ('diaria', 'semanal', 'manual');

/*
Estado operativo de una alerta.
*/
CREATE TYPE estado_alerta_enum AS ENUM ('activa', 'inactiva');

/*
Estado de una oportunidad dentro del sistema.
*/
CREATE TYPE estado_oportunidad_enum AS ENUM ('activa', 'cerrada', 'adjudicada', 'cancelada');

-- =========================================================
-- TABLA: rol
-- DESCRIPCIÓN:
-- Almacena los perfiles funcionales del sistema.
-- Se consideran dos roles:
-- - administrador
-- - proveedor
-- =========================================================
CREATE TABLE rol (
    id_rol              SERIAL PRIMARY KEY,
    nombre_rol          VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE rol IS 'Tabla de roles funcionales del sistema.';
COMMENT ON COLUMN rol.id_rol IS 'Identificador único del rol.';
COMMENT ON COLUMN rol.nombre_rol IS 'Nombre del rol del sistema. Ej: administrador, proveedor.';

-- =========================================================
-- TABLA: usuario
-- DESCRIPCIÓN:
-- Almacena las cuentas de acceso al sistema.
-- Cada usuario pertenece a un rol.
-- =========================================================
CREATE TABLE usuario (
    id_usuario          SERIAL PRIMARY KEY,
    id_rol              INTEGER NOT NULL,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    correo              VARCHAR(150) NOT NULL UNIQUE,
    contrasena          VARCHAR(255) NOT NULL,
    estado              estado_usuario_enum NOT NULL DEFAULT 'activo',
    fecha_registro      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES rol(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON TABLE usuario IS 'Usuarios registrados en la plataforma.';
COMMENT ON COLUMN usuario.id_usuario IS 'Identificador único del usuario.';
COMMENT ON COLUMN usuario.id_rol IS 'Rol funcional del usuario.';
COMMENT ON COLUMN usuario.nombre IS 'Nombre del usuario.';
COMMENT ON COLUMN usuario.apellido IS 'Apellido del usuario.';
COMMENT ON COLUMN usuario.correo IS 'Correo electrónico del usuario, único en el sistema.';
COMMENT ON COLUMN usuario.contrasena IS 'Contraseña cifrada del usuario.';
COMMENT ON COLUMN usuario.estado IS 'Estado actual de la cuenta.';
COMMENT ON COLUMN usuario.fecha_registro IS 'Fecha y hora de creación de la cuenta.';

-- =========================================================
-- TABLA: perfil_empresa
-- DESCRIPCIÓN:
-- Almacena el perfil empresarial asociado a un usuario proveedor.
-- Se deja relación 1 a 1 mediante UNIQUE en id_usuario.
-- =========================================================
CREATE TABLE perfil_empresa (
    id_perfil               SERIAL PRIMARY KEY,
    id_usuario              INTEGER NOT NULL UNIQUE,
    nombre_empresa          VARCHAR(150) NOT NULL,
    rut_empresa             VARCHAR(20) NOT NULL UNIQUE,
    rubro                   VARCHAR(100) NOT NULL,
    region                  VARCHAR(100) NOT NULL,
    tamano_empresa          VARCHAR(50) NOT NULL,
    categoria_interes       VARCHAR(100) NOT NULL,
    monto_min_interes       NUMERIC(14,2) NOT NULL DEFAULT 0,
    monto_max_interes       NUMERIC(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT chk_perfil_montos
        CHECK (monto_max_interes >= monto_min_interes),

    CONSTRAINT fk_perfil_empresa_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON TABLE perfil_empresa IS 'Perfil empresarial configurado por el usuario proveedor.';
COMMENT ON COLUMN perfil_empresa.id_perfil IS 'Identificador único del perfil empresarial.';
COMMENT ON COLUMN perfil_empresa.id_usuario IS 'Usuario asociado al perfil empresarial.';
COMMENT ON COLUMN perfil_empresa.nombre_empresa IS 'Nombre de la empresa.';
COMMENT ON COLUMN perfil_empresa.rut_empresa IS 'RUT de la empresa.';
COMMENT ON COLUMN perfil_empresa.rubro IS 'Rubro de la empresa.';
COMMENT ON COLUMN perfil_empresa.region IS 'Región de operación o interés.';
COMMENT ON COLUMN perfil_empresa.tamano_empresa IS 'Tamaño de la empresa.';
COMMENT ON COLUMN perfil_empresa.categoria_interes IS 'Categoría de interés principal.';
COMMENT ON COLUMN perfil_empresa.monto_min_interes IS 'Monto mínimo de interés para oportunidades.';
COMMENT ON COLUMN perfil_empresa.monto_max_interes IS 'Monto máximo de interés para oportunidades.';

-- =========================================================
-- TABLA: oportunidad
-- DESCRIPCIÓN:
-- Almacena oportunidades de Compra Ágil obtenidas desde
-- Mercado Público o registradas en el sistema.
-- =========================================================
CREATE TABLE oportunidad (
    id_oportunidad          SERIAL PRIMARY KEY,
    codigo_externo          VARCHAR(100) NOT NULL UNIQUE,
    titulo                  VARCHAR(255) NOT NULL,
    organismo               VARCHAR(150) NOT NULL,
    descripcion             TEXT NOT NULL,
    categoria               VARCHAR(100) NOT NULL,
    region                  VARCHAR(100) NOT NULL,
    monto_referencial       NUMERIC(14,2) NOT NULL DEFAULT 0,
    fecha_publicacion       DATE NOT NULL,
    fecha_cierre            DATE NOT NULL,
    estado_oportunidad      estado_oportunidad_enum NOT NULL DEFAULT 'activa',

    CONSTRAINT chk_oportunidad_fechas
        CHECK (fecha_cierre >= fecha_publicacion),

    CONSTRAINT chk_oportunidad_monto
        CHECK (monto_referencial >= 0)
);

COMMENT ON TABLE oportunidad IS 'Oportunidades de Compra Ágil almacenadas en el sistema.';
COMMENT ON COLUMN oportunidad.id_oportunidad IS 'Identificador único de la oportunidad.';
COMMENT ON COLUMN oportunidad.codigo_externo IS 'Código externo de referencia desde Mercado Público.';
COMMENT ON COLUMN oportunidad.titulo IS 'Título de la oportunidad.';
COMMENT ON COLUMN oportunidad.organismo IS 'Organismo comprador.';
COMMENT ON COLUMN oportunidad.descripcion IS 'Descripción de la oportunidad.';
COMMENT ON COLUMN oportunidad.categoria IS 'Categoría de la oportunidad.';
COMMENT ON COLUMN oportunidad.region IS 'Región asociada a la oportunidad.';
COMMENT ON COLUMN oportunidad.monto_referencial IS 'Monto referencial publicado.';
COMMENT ON COLUMN oportunidad.fecha_publicacion IS 'Fecha de publicación.';
COMMENT ON COLUMN oportunidad.fecha_cierre IS 'Fecha de cierre.';
COMMENT ON COLUMN oportunidad.estado_oportunidad IS 'Estado actual de la oportunidad dentro del sistema.';

-- =========================================================
-- TABLA: historial_adjudicacion
-- DESCRIPCIÓN:
-- Registra antecedentes históricos de adjudicación
-- relacionados con una oportunidad.
-- =========================================================
CREATE TABLE historial_adjudicacion (
    id_historial                SERIAL PRIMARY KEY,
    id_oportunidad              INTEGER NOT NULL,
    proveedor_adjudicado        VARCHAR(150) NOT NULL,
    organismo_adjudicador       VARCHAR(150) NOT NULL,
    monto_adjudicado            NUMERIC(14,2) NOT NULL DEFAULT 0,
    cantidad_oferentes          INTEGER NOT NULL DEFAULT 0,
    fecha_adjudicacion          DATE NOT NULL,

    CONSTRAINT chk_historial_monto
        CHECK (monto_adjudicado >= 0),

    CONSTRAINT chk_historial_oferentes
        CHECK (cantidad_oferentes >= 0),

    CONSTRAINT fk_historial_oportunidad
        FOREIGN KEY (id_oportunidad)
        REFERENCES oportunidad(id_oportunidad)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON TABLE historial_adjudicacion IS 'Historial de adjudicaciones asociado a oportunidades.';
COMMENT ON COLUMN historial_adjudicacion.id_historial IS 'Identificador único del historial.';
COMMENT ON COLUMN historial_adjudicacion.id_oportunidad IS 'Oportunidad relacionada.';
COMMENT ON COLUMN historial_adjudicacion.proveedor_adjudicado IS 'Proveedor adjudicado en el historial.';
COMMENT ON COLUMN historial_adjudicacion.organismo_adjudicador IS 'Organismo que adjudicó.';
COMMENT ON COLUMN historial_adjudicacion.monto_adjudicado IS 'Monto adjudicado históricamente.';
COMMENT ON COLUMN historial_adjudicacion.cantidad_oferentes IS 'Cantidad de oferentes participantes.';
COMMENT ON COLUMN historial_adjudicacion.fecha_adjudicacion IS 'Fecha de adjudicación.';

-- =========================================================
-- TABLA: analisis
-- DESCRIPCIÓN:
-- Almacena análisis realizados por un usuario sobre una
-- oportunidad específica.
-- =========================================================
CREATE TABLE analisis (
    id_analisis             SERIAL PRIMARY KEY,
    id_usuario              INTEGER NOT NULL,
    id_oportunidad          INTEGER NOT NULL,
    fecha_analisis          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nivel_riesgo            nivel_riesgo_enum NOT NULL,
    recomendacion           VARCHAR(255) NOT NULL,
    precio_estimado         NUMERIC(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT chk_analisis_precio
        CHECK (precio_estimado >= 0),

    CONSTRAINT fk_analisis_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_analisis_oportunidad
        FOREIGN KEY (id_oportunidad)
        REFERENCES oportunidad(id_oportunidad)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON TABLE analisis IS 'Análisis realizados por usuarios sobre oportunidades.';
COMMENT ON COLUMN analisis.id_analisis IS 'Identificador único del análisis.';
COMMENT ON COLUMN analisis.id_usuario IS 'Usuario que realiza el análisis.';
COMMENT ON COLUMN analisis.id_oportunidad IS 'Oportunidad analizada.';
COMMENT ON COLUMN analisis.fecha_analisis IS 'Fecha y hora del análisis.';
COMMENT ON COLUMN analisis.nivel_riesgo IS 'Nivel de riesgo calculado.';
COMMENT ON COLUMN analisis.recomendacion IS 'Resultado o recomendación generada.';
COMMENT ON COLUMN analisis.precio_estimado IS 'Precio estimado calculado por el sistema.';

-- =========================================================
-- TABLA: analisis_historial
-- DESCRIPCIÓN:
-- Tabla intermedia que vincula un análisis con uno o más
-- registros de historial utilizados como referencia.
-- =========================================================
CREATE TABLE analisis_historial (
    id_analisis_historial   SERIAL PRIMARY KEY,
    id_analisis             INTEGER NOT NULL,
    id_historial            INTEGER NOT NULL,

    CONSTRAINT uq_analisis_historial UNIQUE (id_analisis, id_historial),

    CONSTRAINT fk_analisis_historial_analisis
        FOREIGN KEY (id_analisis)
        REFERENCES analisis(id_analisis)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_analisis_historial_historial
        FOREIGN KEY (id_historial)
        REFERENCES historial_adjudicacion(id_historial)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON TABLE analisis_historial IS 'Relación entre análisis y registros históricos utilizados.';
COMMENT ON COLUMN analisis_historial.id_analisis_historial IS 'Identificador único de la relación.';
COMMENT ON COLUMN analisis_historial.id_analisis IS 'Análisis relacionado.';
COMMENT ON COLUMN analisis_historial.id_historial IS 'Historial utilizado como referencia.';

-- =========================================================
-- TABLA: alerta
-- DESCRIPCIÓN:
-- Configuración de alertas de oportunidades por usuario.
-- =========================================================
CREATE TABLE alerta (
    id_alerta               SERIAL PRIMARY KEY,
    id_usuario              INTEGER NOT NULL,
    palabra_clave           VARCHAR(100),
    categoria               VARCHAR(100),
    region                  VARCHAR(100),
    monto_min               NUMERIC(14,2) NOT NULL DEFAULT 0,
    monto_max               NUMERIC(14,2) NOT NULL DEFAULT 0,
    frecuencia              frecuencia_alerta_enum NOT NULL DEFAULT 'manual',
    estado_alerta           estado_alerta_enum NOT NULL DEFAULT 'activa',
    fecha_creacion          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_alerta_montos
        CHECK (monto_max >= monto_min),

    CONSTRAINT fk_alerta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON TABLE alerta IS 'Alertas configuradas por los usuarios.';
COMMENT ON COLUMN alerta.id_alerta IS 'Identificador único de la alerta.';
COMMENT ON COLUMN alerta.id_usuario IS 'Usuario propietario de la alerta.';
COMMENT ON COLUMN alerta.palabra_clave IS 'Palabra clave para filtrar oportunidades.';
COMMENT ON COLUMN alerta.categoria IS 'Categoría de interés.';
COMMENT ON COLUMN alerta.region IS 'Región de interés.';
COMMENT ON COLUMN alerta.monto_min IS 'Monto mínimo configurado.';
COMMENT ON COLUMN alerta.monto_max IS 'Monto máximo configurado.';
COMMENT ON COLUMN alerta.frecuencia IS 'Frecuencia con la que se revisa o activa la alerta.';
COMMENT ON COLUMN alerta.estado_alerta IS 'Estado actual de la alerta.';
COMMENT ON COLUMN alerta.fecha_creacion IS 'Fecha de creación de la alerta.';

-- =========================================================
-- TABLA: oportunidad_guardada
-- DESCRIPCIÓN:
-- Permite que un usuario guarde oportunidades para revisión
-- posterior.
-- =========================================================
CREATE TABLE oportunidad_guardada (
    id_guardado             SERIAL PRIMARY KEY,
    id_oportunidad          INTEGER NOT NULL,
    id_usuario              INTEGER NOT NULL,
    fecha_guardado          DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT uq_oportunidad_guardada UNIQUE (id_oportunidad, id_usuario),

    CONSTRAINT fk_guardado_oportunidad
        FOREIGN KEY (id_oportunidad)
        REFERENCES oportunidad(id_oportunidad)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_guardado_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON TABLE oportunidad_guardada IS 'Oportunidades guardadas por usuarios.';
COMMENT ON COLUMN oportunidad_guardada.id_guardado IS 'Identificador único del registro guardado.';
COMMENT ON COLUMN oportunidad_guardada.id_oportunidad IS 'Oportunidad guardada.';
COMMENT ON COLUMN oportunidad_guardada.id_usuario IS 'Usuario que guarda la oportunidad.';
COMMENT ON COLUMN oportunidad_guardada.fecha_guardado IS 'Fecha en que se guardó la oportunidad.';

-- =========================================================
-- ÍNDICES RECOMENDADOS
-- =========================================================
-- Mejora búsquedas frecuentes y relaciones.

CREATE INDEX idx_usuario_id_rol ON usuario(id_rol);
CREATE INDEX idx_perfil_empresa_id_usuario ON perfil_empresa(id_usuario);
CREATE INDEX idx_oportunidad_categoria ON oportunidad(categoria);
CREATE INDEX idx_oportunidad_region ON oportunidad(region);
CREATE INDEX idx_oportunidad_estado ON oportunidad(estado_oportunidad);
CREATE INDEX idx_historial_id_oportunidad ON historial_adjudicacion(id_oportunidad);
CREATE INDEX idx_analisis_id_usuario ON analisis(id_usuario);
CREATE INDEX idx_analisis_id_oportunidad ON analisis(id_oportunidad);
CREATE INDEX idx_alerta_id_usuario ON alerta(id_usuario);
CREATE INDEX idx_guardado_id_usuario ON oportunidad_guardada(id_usuario);
CREATE INDEX idx_guardado_id_oportunidad ON oportunidad_guardada(id_oportunidad);

-- =========================================================
-- DATOS BASE MÍNIMOS
-- =========================================================
-- Se insertan los dos perfiles requeridos por el proyecto.

INSERT INTO rol (nombre_rol)
VALUES ('administrador'),
       ('proveedor');