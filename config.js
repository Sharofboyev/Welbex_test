require("dotenv");

module.exports = {
    secretKey: process.env.SECRET_KEY,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user_database: process.env.USER_DB_NAME,
    email_database: process.env.EMAIL_DB_NAME,
    record_database: process.env.RECORD_DB_NAME,
    user_db_user: process.env.USER_DB_USER,
    user_db_password: process.env.USER_DB_PASSWORD,
    email_db_user: process.env.EMAIL_DB_USER,
    email_db_password: process.env.EMAIL_DB_PASSWORD,
    record_db_user: process.env.RECORD_DB_USER,
    record_db_password: process.env.RECORD_DB_PASSWORD
}