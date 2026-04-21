# CompraSmart

CompraSmart es una plataforma web orientada al análisis de oportunidades en Compra Ágil de Mercado Público, con el objetivo de apoyar la toma de decisiones de proveedores mediante el análisis de datos históricos y filtrado de oportunidades.

---

## Estado del proyecto

Proyecto en desarrollo correspondiente a la **Semana 4** del curso de Proyecto de Título.

En esta etapa se ha trabajado en:

- definición del modelo de datos relacional
- diseño del diagrama entidad-relación (DER)
- normalización hasta tercera forma normal (3FN)
- implementación inicial de la base de datos en PostgreSQL
- ejecución en entorno local mediante Docker
- validación de estructura y relaciones desde cliente de base de datos (Navicat)
- definición de arquitectura del sistema

---

## Modelo de datos

El sistema utiliza un **modelo relacional**, implementado en PostgreSQL, debido a que requiere:

- datos estructurados
- relaciones entre entidades
- integridad referencial
- consultas consistentes

Las principales entidades del sistema son:

- Rol
- Usuario
- Perfil Empresa
- Oportunidad
- Historial de Adjudicación
- Análisis
- Alerta
- Oportunidad Guardada

---

## Gestión de usuarios

El sistema considera dos perfiles funcionales:

- **Administrador**
  - acceso completo a la gestión del sistema

- **Proveedor**
  - acceso restringido a funcionalidades operativas

La gestión de permisos se realiza a nivel de aplicación (backend), utilizando la tabla `rol`.  
No se implementa control de acceso mediante usuarios del motor PostgreSQL.

---

## Base de datos

La base de datos se encuentra implementada en PostgreSQL, ejecutándose en un contenedor Docker para facilitar el desarrollo local.

### Tecnologías utilizadas

- PostgreSQL 16
- Docker Desktop
- Navicat (administración y validación)

### Configuración del contenedor

POSTGRES_DB: comprasmart_db  
POSTGRES_USER: comprasmart_user  
POSTGRES_PASSWORD: comprasmart_pass  
PORT: 5432  

---

## Estructura del repositorio

comprasmart/
│
├── docker-compose.yml
├── README.md
│
├── database/
│   ├── scripts/
│   │   ├── 01_create_schema.sql
│   │   ├── 02_seed_data.sql
│   │   └── 03_test_queries.sql
│   └── backups/
│
├── docs/
│   ├── diagrama-er/
│   ├── arquitectura/
│   └── evidencias/
│
├── backend/
│   └── src/
│
└── frontend/
    └── assets/

---

## Ejecución de la base de datos

Para levantar el entorno local:

docker compose up -d

Para verificar el contenedor:

docker ps

La conexión se puede realizar desde cualquier cliente PostgreSQL utilizando:

- Host: localhost  
- Puerto: 5432  
- Base de datos: comprasmart_db  
- Usuario: comprasmart_user  
- Contraseña: comprasmart_pass  

---

## Arquitectura del sistema

El sistema se basa en una arquitectura de tres capas:

- **Capa de presentación**
  - HTML, CSS, JavaScript

- **Capa lógica**
  - Node.js con Express

- **Capa de datos**
  - PostgreSQL

Esta estructura permite separar responsabilidades, facilitar el mantenimiento y escalar el sistema en etapas posteriores.

---

## Autor

Luis Eduardo Montero Rodríguez  
Proyecto de Título – Analista Programador  
IPLACEX