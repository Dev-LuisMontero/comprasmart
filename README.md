# CompraSmart

CompraSmart es una plataforma web orientada al análisis de oportunidades de Compra Ágil de Mercado Público, diseñada para apoyar la toma de decisiones de proveedores mediante el procesamiento y análisis de información pública relacionada con procesos de compra y adjudicación.

El sistema permite consultar oportunidades, analizar históricos de adjudicación, generar alertas personalizadas y apoyar la evaluación de oportunidades comerciales mediante una arquitectura web moderna desplegada en Amazon Web Services (AWS).

---

## Características principales

- Autenticación de usuarios mediante JWT
- Gestión de perfiles de usuario y empresa
- Consulta de oportunidades de Compra Ágil
- Integración con API pública de Mercado Público
- Análisis de oportunidades y nivel de riesgo
- Registro histórico de adjudicaciones
- Gestión de alertas personalizadas
- Guardado de oportunidades favoritas
- Dashboard administrativo
- API REST protegida
- Arquitectura desplegada en AWS

---

## Arquitectura del sistema

El sistema fue desarrollado utilizando una arquitectura cliente-servidor de tres capas:

### Capa de presentación
Frontend desarrollado con:
- HTML5
- CSS3
- JavaScript Vanilla

### Capa lógica
Backend desarrollado con:
- Node.js
- Express.js

### Capa de datos
Persistencia implementada con:
- PostgreSQL

---

## Infraestructura y despliegue cloud

La solución se encuentra desplegada en Amazon Web Services (AWS) utilizando los siguientes servicios:

- AWS Amplify Hosting
- Amazon EC2
- Amazon RDS PostgreSQL
- Amazon CloudFront
- Amazon Route 53
- HTTPS / SSL

### URLs públicas

Frontend:
https://comprasmart.freeddns.org

Backend API:
https://api.comprasmart.freeddns.org

---

## Tecnologías utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- JWT
- Axios

### Base de datos
- PostgreSQL

### Desarrollo
- Docker Desktop
- Visual Studio Code
- Navicat
- Git
- GitHub
- Postman

### Cloud
- AWS Amplify
- Amazon EC2
- Amazon RDS
- Route 53
- CloudFront

---

## Estructura del proyecto

```text
comprasmart/
│
├── backend/
│
├── frontend/
│
├── database/
│   ├── scripts/
│   └── diagrams/
│
├── docs/
│
├── docker-compose.yml
│
└── README.md
```

---

## Base de datos

La base de datos relacional fue implementada en PostgreSQL y normalizada hasta Tercera Forma Normal (3FN).

### Principales entidades

- rol
- usuario
- perfil_empresa
- oportunidad
- historial_adjudicacion
- analisis
- alerta
- oportunidad_guardada
- analisis_historial

### Scripts disponibles

```text
database/scripts/
├── 01_create_schema.sql
├── 02_seed_data.sql
└── 03_test_queries.sql
```

---

## Ejecución local

### Requisitos

- Node.js
- PostgreSQL
- Docker Desktop
- Git

### Levantar entorno local

```bash
docker compose up -d
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

El frontend puede ejecutarse directamente desde entorno local o mediante Live Server en Visual Studio Code.

---

## Variables de entorno

El proyecto utiliza variables de entorno para configuración sensible.

Ejemplo:

```env
PORT=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
MERCADO_PUBLICO_API_URL=
MERCADO_PUBLICO_TICKET=
```

---

## API REST

La aplicación expone endpoints REST para la gestión de usuarios, autenticación, oportunidades y análisis.

### Principales rutas

```text
/api/auth
/api/usuarios
/api/perfiles
/api/oportunidades
/api/analisis
/api/alertas
/api/guardadas
```

---

## Integración con Mercado Público

El sistema consume información pública desde la API de Mercado Público para obtener oportunidades activas de Compra Ágil y procesarlas dentro de la plataforma.

La información obtenida es normalizada y almacenada en PostgreSQL para permitir consultas, análisis y visualización desde el sistema.

---

## Estado del proyecto

Proyecto académico finalizado correspondiente a la asignatura Proyecto de Título de la carrera Analista Programador de IPLACEX.

El sistema se encuentra funcional y desplegado en entorno cloud para fines académicos y demostrativos.

---

## Autor

Luis Eduardo Montero Rodríguez

Proyecto de Título  
Analista Programador  
IPLACEX