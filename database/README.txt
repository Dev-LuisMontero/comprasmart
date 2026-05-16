Entrega de Base de Datos - CompraSmart

Proyecto:
CompraSmart: Plataforma Web de Análisis de Oportunidades en Compra Ágil de Mercado Público

Estudiante:
Luis Eduardo Montero Rodríguez

Tipo de base de datos:
Relacional SQL

Motor utilizado:
PostgreSQL

Descripción general:
La base de datos del sistema CompraSmart permite almacenar y relacionar la información necesaria para la operación de la plataforma, incluyendo usuarios, roles, perfiles empresariales, oportunidades de Compra Ágil, históricos de adjudicación, análisis generados, alertas y oportunidades guardadas.

Estructura de archivos:

/scripts/01_create_schema.sql
Script de creación de la estructura de la base de datos. Incluye tipos ENUM, tablas, claves primarias, claves foráneas, restricciones e índices.

/scripts/02_seed_data.sql
Script de carga de datos de prueba. Incluye roles, usuarios de prueba, perfiles empresariales, oportunidades, históricos, análisis, alertas y oportunidades guardadas.

/scripts/03_test_queries.sql
Consultas de validación para comprobar relaciones, integridad de datos y funcionamiento general del modelo.

/diagrams/MER_CompraSmart.png
Modelo entidad-relación de la base de datos en formato imagen.

Orden de ejecución:
1. Ejecutar 01_create_schema.sql
2. Ejecutar 02_seed_data.sql
3. Ejecutar 03_test_queries.sql para validar la carga y relaciones

Tablas principales:
- rol
- usuario
- perfil_empresa
- oportunidad
- historial_adjudicacion
- analisis
- analisis_historial
- alerta
- oportunidad_guardada

Relaciones principales:
- Un rol puede estar asociado a varios usuarios.
- Un usuario puede tener un perfil empresarial.
- Un usuario puede configurar múltiples alertas.
- Un usuario puede guardar múltiples oportunidades.
- Una oportunidad puede tener registros históricos de adjudicación.
- Un usuario puede realizar análisis sobre oportunidades.
- Un análisis puede utilizar uno o más registros históricos mediante la tabla analisis_historial.

Observación:
Los datos incluidos corresponden a datos de prueba utilizados para validación académica del sistema.