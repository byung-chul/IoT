var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    
    const id = req.query.id;
    
    const query =
        "SELECT *, SUM(pay) FROM deliverylist WHERE id = ? AND delivery_type = 2";
    database.query(query, [id])
        .then(function(results) {
            res.end(JSON.stringify(results));
        });
});

module.exports = router;
