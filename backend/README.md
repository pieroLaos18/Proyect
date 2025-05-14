# Web Sales System Backend

Este es el backend del sistema de ventas web, construido utilizando Node.js y Express. Este proyecto se conecta a una base de datos MySQL y proporciona una API para manejar las operaciones de ventas.

## Estructura del Proyecto

- **src/**: Contiene el código fuente de la aplicación.
  - **app.js**: Punto de entrada de la aplicación. Configura el servidor y las rutas.
  - **config/**: Contiene la configuración de la base de datos.
    - **database.js**: Configuración de la conexión a la base de datos MySQL.
  - **controllers/**: Contiene los controladores que manejan la lógica de negocio.
    - **index.js**: Exporta los controladores para las rutas.
  - **models/**: Define los modelos de datos que representan las tablas de la base de datos.
    - **index.js**: Modelos de datos utilizando un ORM como Sequelize.
  - **routes/**: Establece las rutas de la aplicación.
    - **index.js**: Define las rutas y las asocia con los controladores.
  - **services/**: Contiene la lógica de servicio utilizada por los controladores.
    - **index.js**: Funciones de servicio para interactuar con la base de datos.

## Instalación

1. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   ```
2. Navega al directorio del backend:
   ```
   cd backend
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Uso

Para iniciar el servidor, ejecuta el siguiente comando en el directorio del backend:
```
npm start
```

Asegúrate de que la base de datos MySQL esté configurada y en funcionamiento antes de iniciar el servidor.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.