# Web Sales System

Este proyecto es un sistema de ventas web desarrollado utilizando Vue.js para el frontend, Node.js para el backend y MySQL como base de datos. A continuación se presentan las instrucciones para la instalación y uso del sistema.

## Estructura del Proyecto

```
web-sales-system
├── backend                # Código del backend
│   ├── src
│   │   ├── app.js        # Punto de entrada de la aplicación backend
│   │   ├── config        # Configuración de la base de datos
│   │   ├── controllers   # Controladores para manejar la lógica de negocio
│   │   ├── models        # Modelos de datos para la base de datos
│   │   ├── routes        # Rutas de la aplicación
│   │   └── services      # Lógica de servicio
│   ├── package.json      # Dependencias y scripts del backend
│   └── README.md         # Documentación del backend
├── frontend               # Código del frontend
│   ├── public
│   │   └── index.html    # Plantilla HTML principal
│   ├── src
│   │   ├── App.vue       # Componente raíz de la aplicación Vue.js
│   │   ├── main.js       # Punto de entrada de la aplicación Vue.js
│   │   ├── components     # Componentes de la aplicación
│   │   ├── router        # Configuración del enrutador de Vue.js
│   │   └── store         # Configuración de Vuex
│   ├── package.json      # Dependencias y scripts del frontend
│   ├── vite.config.js    # Configuración de Vite
│   └── README.md         # Documentación del frontend
├── database               # Esquema de la base de datos
│   └── schema.sql        # Definición de tablas y relaciones
└── README.md             # Documentación general del proyecto
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd web-sales-system
   ```

2. Configura la base de datos MySQL y ejecuta el script `schema.sql` para crear las tablas necesarias.

3. Instala las dependencias del backend:
   ```
   cd backend
   npm install
   ```

4. Instala las dependencias del frontend:
   ```
   cd ../frontend
   npm install
   ```

## Uso

1. Inicia el servidor backend:
   ```
   cd backend
   node src/app.js
   ```

2. Inicia la aplicación frontend:
   ```
   cd ../frontend
   npm run dev
   ```

3. Accede a la aplicación en tu navegador en `http://localhost:3000` (o el puerto que hayas configurado).

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.