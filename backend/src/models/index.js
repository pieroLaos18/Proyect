// Configuración y exportación de modelos Sequelize para la base de datos

import { Sequelize } from 'sequelize';
import config from '../config/database.js';

// Inicializa la instancia de Sequelize con la configuración
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos aquí
db.User = require('./User')(sequelize, Sequelize);
db.Product = require('./Product')(sequelize, Sequelize);
db.Order = require('./Order')(sequelize, Sequelize);

// Definir relaciones entre modelos aquí
db.User.hasMany(db.Order); // Un usuario tiene muchas órdenes
db.Order.belongsTo(db.User); // Una orden pertenece a un usuario
db.Product.belongsToMany(db.Order, { through: 'OrderProducts' }); // Muchos productos en muchas órdenes
db.Order.belongsToMany(db.Product, { through: 'OrderProducts' }); // Muchas órdenes con muchos productos

export default db;