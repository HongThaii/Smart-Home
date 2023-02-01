var humi_graph = [];
var temp_graph = [];
var light_graph = [];
var gas_graph = [];
var date_graph = [];

function exportData(con,io){
    var newTemp
    var newHumi
    var newLight
    var newGas
    var m_time

    var sql1 = "SELECT * FROM data_sensors ORDER BY ID DESC limit 1"
    con.query(sql1, function(err, result, fields){
        if (err) throw err;
        console.log("Data selected");
        result.forEach(function(value){
            m_time = value.Time.toString().slice(4, 24);
            newTemp = value.Temperature
            newHumi = value.Humidity
            newLight = value.Light
            newGas = value.Gas
            io.sockets.emit('server-update-data', {temp: value.Temperature, humi: value.Humidity, light: value.Light, gas: value.Gas})
        })
        if (humi_graph.length < 20) {
            humi_graph.push(newHumi);
        }
        else {
            for (i = 0; i < 19; i++) {
                humi_graph[i] = humi_graph[i + 1];
            }
            humi_graph[19] = newHumi;
        }

        if (temp_graph.length < 20) {
            temp_graph.push(newTemp);
        }
        else {
            for (u = 0; u < 19; u++) {
                temp_graph[u] = temp_graph[u + 1];
            }
            temp_graph[19] = newTemp;
        }

        if (light_graph.length < 20) {
            light_graph.push(newLight);
        }
        else {
            for (k = 0; k < 19; k++) {
                light_graph[k] = light_graph[k + 1];
            }
            light_graph[19] = newLight;
            
        }

        if (gas_graph.length < 20) {
            gas_graph.push(newGas);
        }
        else {
            for (j = 0; j < 19; j++) {
                gas_graph[j] = gas_graph[j + 1];
            }
            gas_graph[19] = newGas;
            
        }

        if (date_graph.length < 20) {
            date_graph.push(m_time);
        }
        else {
            for (x = 0; x < 19; x++) {
                date_graph[x] = date_graph[x + 1];
            }
            date_graph[19] = m_time;
        }

        io.sockets.emit("server-send-humi_graph", humi_graph);
        io.sockets.emit("server-send-temp_graph", temp_graph);
        io.sockets.emit("server-send-date_graph", date_graph);
        io.sockets.emit("server-send-light_graph", light_graph);
        io.sockets.emit("server-send-gas_graph", gas_graph);
    }); 
}

module.exports = exportData