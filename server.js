var express = require('express') 
var mysql = require('mysql2')     
var mqtt = require('mqtt')       
var exportData = require('./export.js')

var app = express();
var port = 4444;    

app.use(express.static("public"))
app.set("views engine", "ejs")
app.set("views", "./views")

app.get('/', function (req, res) {
    res.render('main.ejs')
})

var server = require("http").Server(app)
var io = require('socket.io')(server)

server.listen(port, function () {
    console.log('Server listening on port ' + port)
})

/*--------------------------------------------*/
var data_mqtt = {
    broker: "mqtt://localhost",
    port: 1883,
};
//Connect to mqtt
var topic1 = "ledChange";
var topic2 = "fanChange";
var topic3 = "Canhbao";
var topic4 = "nhapnhay";

var mqtt_client = mqtt.connect("mqtt://localhost");

mqtt_client.on("connect", function () {
    console.log("Connected to MQTT server");
});
mqtt_client.on("error", function (error) {
    console.log("Can't connect" + error);
    process.exit(1)
});
//----------------CONTROL DEVICE----------------------
io.sockets.on("connection",function(socket){
    console.log(socket.id + "connected");

    socket.on("disconnect",function(){
        console.log(socket.id + "disconnect");
    })

    socket.on("light",function(data){
        if(data == "on"){
            console.log("Den da duoc bat!");
            mqtt_client.publish(topic1,"onled");
        } else{
            console.log("Den da duoc tat!");
            mqtt_client.publish(topic1,"offled");
        }
    })
    socket.on("fan",function(data){
        if(data == "on"){
            console.log("Quat da duoc bat!");
            mqtt_client.publish(topic2,"onfan");
        } else{
            console.log("Quat da duoc tat!");
            mqtt_client.publish(topic2,"offFan");
        }
    })
    //----------------WARNING MODE----------------------
    socket.on("warning",function(data){
        if(data == "on"){
            console.log("Loa da duoc bat!");
            mqtt_client.publish(topic3,"onbuzzer");
        } else{
            console.log("Loa da duoc tat!");
            mqtt_client.publish(topic3,"offbuzzer");
        }
    })

    socket.on("blink",function(data){
        if(data == "on"){
            console.log("blink led")
            mqtt_client.publish(topic4,"onblink");
        } else{
            mqtt_client.publish(topic4,"offblink");
        }
    })
})
/*----------------------------------------------*/

//------------------SQL------------------
var con = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'iot'
});
//------------------CREAT TABLE------------------
con.connect(function (err) {
    if (err) throw err;
    console.log("mysql connected");
    var sql = 
    "CREATE TABLE IF NOT EXISTS data_sensors (ID int(10) not null primary key auto_increment, Temperature int(10) not null, Humidity int(10) not null, Light int(10) not null, Gas int(10) not null, Time datetime not null)"
    con.query(sql, function (err) {
        if (err)
            throw err;
        console.log("Table created");
    });
})
/*----------------------------------------------*/

var client_topic = ["sensors"];
mqtt_client.subscribe("sensors");

//Nhan data cam bien
var newTemp
var newHumi
var newLight
var newGas
var m_time

var check = 0;

mqtt_client.on('message',function(topic,message,packet){
    console.log("message is " + message)
    console.log("topic is " + topic)
    const objData = JSON.parse(message)
    if (topic == client_topic[0]) {
        check = check + 1;
        newTemp  = objData.Temperature;
        newHumi  = objData.Humidity;
        newLight = objData.Light;
        newGas = objData.Gas;
    }

    if(check == 1) {
        var n = new Date()
        console.log(newGas)
        var month = n.getMonth() + 1
        var Date_and_Time = n.getFullYear() + "-" + month + "-" + n.getDate() + " " + n.getHours() + ":" + n.getMinutes() + ":" + n.getSeconds();
        var sql = "INSERT INTO data_sensors (Temperature, Humidity, Light, Gas, Time) VALUES ('" + newTemp + "', '" + newHumi + "', '"+ newLight + "', '" +  newGas + "', '" + Date_and_Time.toString() + "')"
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table inserted");
        });

        exportData(con, io);
        check = 0;
    }
})