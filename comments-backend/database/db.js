const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Snowy@2020",
    database: "commentsDB",
});

module.exports = db;
