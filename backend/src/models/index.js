import { Sequelize } from 'sequelize';
import config from '../config/database.js';

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
db.User.hasMany(db.Order);
db.Order.belongsTo(db.User);
db.Product.belongsToMany(db.Order, { through: 'OrderProducts' });
db.Order.belongsToMany(db.Product, { through: 'OrderProducts' });

export default db;