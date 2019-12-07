var express = require('express');
var awsIot = require('aws-iot-device-sdk');
var database = require('../database/mysql_connection');
var router = express.Router();

router.get('/', function (req, res, next) {

	const company_id = req.query.company_id;

	const query =
        "SELECT * FROM deliverylist WHERE company_id = ?";
    database.query(query, [company_id])
        .then(function(results) {
            res.end(JSON.stringify(results));
        });
});

router.get('/car', function (req, res, next) {

	const id = req.query.id;

    var device = awsIot.device({
        keyPath: './certs/8c7ea71244-private.pem.key',
       certPath: './certs/8c7ea71244-certificate.pem.crt',
         caPath: './certs/rootCA.key',
       clientId: 'subscriber',
           host: 'aksvt2aysg9zx-ats.iot.us-east-2.amazonaws.com'
    });

    const query =
            "SELECT car_id FROM user WHERE id = ?";
        database.query(query, [id])
            .then(function(results) {

                var car_id = results[0].car_id;

                device.
                    on('connect', function() {
                    console.log('connect');
                    device.subscribe('Truck/1Ton/'+ car_id);
                    });
                
                device.
                    on('message', function(topic, payload) {
                    console.log(topic, payload.toString());
                    var payload_json = JSON.parse(payload.toString())
                    
                    device.end();
					
					res.json(payload_json);
                
                });
        });
});

module.exports = router;
