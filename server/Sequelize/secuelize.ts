import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('messenger', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

export default sequelize