const { Pool } = require("pg");
const Joi = require("joi")
const config = require("../config");
const bcrypt = require("bcrypt");
const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.user_database,
    user: config.user_db_user,
    password: config.user_db_password
})

pool.query(`CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(64) PRIMARY KEY,
    password VARCHAR(256) NOT NULL,
    email VARCHAR(64),
    created_time TIMESTAMPTZ DEFAULT NOW()
)`).catch((err) => {
    console.log("Error occured in user database. Error message: ", err.message)
})

const validateUser = function (user){
    const validatedUser = Joi.object({
        userName: Joi.string().min(4).max(64).required(),
        password: Joi.string().min(4).max(256).required(),
        email: Joi.string().email({tlds: {allow: false}})
    }).validate(user);
    return validatedUser
}

const updateValidator = function (user){
    return Joi.object({
        userName: Joi.string().min(4).max(64),
        password: Joi.string().min(4).max(256),
        email: Joi.string().email({tlds: {allow: false}}),
        newUsername: Joi.string().min(4).max(64),
    }).validate(user);
}

const addUser = async function(user){
    const error = validateUser(user).error
    if (!error){
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        try {
            let res = await pool.query("SELECT username FROM users WHERE username = $1", [user.userName]);
            if (res.rowCount > 0){
                return {success: false, message: "This username already exists"};
            }
            await pool.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", [user.userName, user.password, user.email]);
            return {success: true}
        } catch(err){
            console.log(err.message);
            return {success: false, message: "Database error occured"}
        }
    }
    else return {success: false, message: error.details[0].message};
}

const getUser = async function(userName){
    try {
        let res = await pool.query("SELECT * FROM users WHERE username = $1", [userName]);
        if (res.rowCount > 0) return res.rows[0];
        return null;
    } catch (err){
        console.log(err.message);
        return;
    }
}

const updateUser = async function(user){
    let error = updateValidator(user).error
    if (error) return {success: false, error: error.details[0].message};
    if (user.password){
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    try {
        await pool.query(`UPDATE users SET 
            username = COALESCE($1, username),
            password = COALESCE($2, password),
            email = COALESCE($3, email)
            WHERE username = $4`, 
            [user.newUsername, user.password, user.email, user.username]
        )
        return { success: true }
    }
    catch(err){
        console.log(err.message);
        return {
            success: false,
            error: "Internal server error"
        }
    }
}

const deleteUser = async function(userName){
    try {
        await pool.query("DELETE FROM USERS WHERE username = $1", [userName]);
        return true;
    } catch (err){
        console.log(err.message);
        return false;
    }
}

module.exports.addUser = addUser;
module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser