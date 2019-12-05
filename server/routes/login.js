var express = require('express');
var database = require('../database/mysql_connection');
var router = express.Router();
var connection = database.getDatabase();


/* GET users listing. */
//localhost:3000/login
router.get('/', function(req, res, next) {
    
    const id = req.query.id;
    const password = req.query.password;

    const query =
        "SELECT Count(*) FROM user WHERE id = ? AND password = ?";
    database.query(query, [id, password])
        .then(function(results) {
            res.end(JSON.stringify(results[0]["Count(*)"]));
        });
});

router.post('/', function(req, res, next) {
    const id = req.body.id;
    const password = req.body.password;
    const phone_number = req.body.phone_number;
    const car_id = req.body.car_id;

    const query =
        'SELECT id FROM user WHERE id=?';
    database.query(query, [id])
        .then(function (results) {
            if (results.length === 0){
                const query =
                    "SELECT phone_number FROM user WHERE phone_number = ?";
                return database.query(query, [phone_number]);
            } else{
                res.end("id is duplicated");
            }
            return "duplicated";
        })
        .then(function (results) {
            if (results === "duplicated") {
                return "duplicated";
            } else {
                if (results.length === 0){
                    const query = "INSERT INTO user (id, password, phone_number, car_id) VALUES (?, ?, ?, ?)";
                    return database.query(query, [id, password, phone_number, car_id]);
                } else{
                    res.end("phone_number is duplicated");
                }
            }
            return "duplicated";
        })
        .then(function (results) {
            if (results.affectedRows === 1) {
                res.end("success");
            } else {
                res.end("fail");
            }
        })
});


module.exports = router;

