export const dbConfig: { [key: string]: { username: string, password: string, database: string, host: string, dialect: string, logging: boolean }  } = {
    development: {
        username: 'root',
        password: '',
        database: 'messenger',
        host: 'localhost',
        dialect: 'mysql',
        logging: false
    }
}