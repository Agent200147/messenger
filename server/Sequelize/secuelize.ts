import type { Dialect } from 'sequelize';
import { Sequelize } from 'sequelize';
import { dbConfig } from "../database.js";

const env = process.env.NODE_ENV || 'development'
const config = dbConfig[env]

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect as Dialect,
    logging: config.logging
})

export default sequelize