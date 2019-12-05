var express = require('express');
var database = require('../database/mysql_connection');
var router = express.Router();
var connection = database.getDatabase();
var awsIot = require('aws-iot-device-sdk');


//50km 이내에 배송 가능한 대기중인 배달요청 받아보기
router.get('/', function(req, res, next) {
    
    const id = req.query.id;

    var car_id
    var now_lat;
    var now_lng;
    var paret;
    var weight;

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
                car_id = results[0].car_id;

                device.
                    on('connect', function() {
                    console.log('connect');
                    device.subscribe('Truck/1Ton/'+ car_id);
                    });
                
                device.
                    on('message', function(topic, payload) {
                    console.log(topic, payload.toString());
                    var payload_json = JSON.parse(payload.toString())
                    
                    now_lat = payload_json.Latitude;
                    now_lng = payload_json.Longitude;
                    paret = payload_json.Paret;
                    weight = payload_json.Weight;
                    device.end();
                    
                    const query =
                        "SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians( content_lat ) ) * cos( radians( content_lng ) - radians(?) ) + sin( radians(?) ) * sin( radians( content_lat ) ) ) ) AS distance FROM deliverylist WHERE paret_count <= ? AND paret_weight <= ? AND delivery_type = 0  HAVING distance < 50 ORDER BY distance";
                    database.query(query, [now_lat, now_lng, now_lat, paret, weight])
                        .then(function(results) {
                            res.end(JSON.stringify(results));
                    });
                
                });
        });
});

//화물 회사가 배달요청하기(deliverylist테이블에 삽입)
router.post('/', function(req, res, next) {
    const company_id = req.body.company_id;
    const pay = req.body.pay;
    const paret_count = req.body.paret_count;
    const paret_weight = req.body.paret_weight;
    const content_type = req.body.content_type;
    const content_lat = req.body.content_lat;
    const content_lng = req.body.content_lng;
    const destination_lat = req.body.destination_lat;
    const destination_lng = req.body.destination_lng;

    const query =
        "INSERT INTO deliverylist " +
        "(company_id, pay, paret_count, paret_weight, content_type, content_lat, content_lng, destination_lat, destination_lng) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    database.query(query, [company_id, pay, paret_count, paret_weight, content_type, content_lat, content_lng, destination_lat, destination_lng])
        .then(function(results) {
            if (results.affectedRows === 1) {
                res.end("success");
            } else {
                res.end("fail");
            }
        });


});

router.post('/catch', function(req, res, next) {
    
    const driver_id = req.body.driver_id;
    const delivery_id = req.body.delivery_id;

    const query =
            "UPDATE deliverylist SET delivery_type = 1 , driver_id = ? WHERE delivery_id = ?";
        database.query(query, [driver_id, delivery_id])
            .then(function(results) {
                if(results.affectedRows >= 1){
                    res.end("Success");
                }
                else {
                    res.end("Fail");
                }
        });

});

router.post('/finish', function(req, res, next) {
    
    const delivery_id = req.body.delivery_id;

    const query =
            "UPDATE deliverylist SET delivery_type = 2 WHERE delivery_id = ?";
        database.query(query, [delivery_id])
            .then(function(results) {
                if(results.affectedRows >= 1){
                    res.end("Success");
                }
                else {
                    res.end("Fail");
                }
        });

});

module.exports = router;