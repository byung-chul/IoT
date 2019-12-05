var express = require('express');
var awsIot = require('aws-iot-device-sdk');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    
    var device = awsIot.device({
        keyPath: './certs/8c7ea71244-private.pem.key',
       certPath: './certs/8c7ea71244-certificate.pem.crt',
         caPath: './certs/rootCA.key',
       clientId: 'subscriber',
           host: 'aksvt2aysg9zx-ats.iot.us-east-2.amazonaws.com'
    });
 
    device.
        on('connect', function() {
        console.log('connect');
        device.subscribe('Truck/1Ton/A001');
        });
 
    device.
        on('message', function(topic, payload) {
        var payload_json = JSON.parse(payload.toString());
        console.log('message', topic, payload.toString());
        res.json(payload_json);
        //console.log(payload_json.Latitude);
    });
    
});



module.exports = router;
