
var socket = io("http://localhost:4444")
var ga_data;

$(document).ready(function(){
  socket.on("server-update-data", function(data){
    $("#Nhietdo").html(data.temp + '°C')
    $("#Doam").html(data.humi + '%')
    $("#Anhsang").html(data.light + ' ' + 'lux')
    $("#Khigas").html(data.gas + ' ' + 'ppm')
    ga_data = data.gas
  })
})

//--------------Warning mode--------------
function checkGas(){
  if(ga_data >= 1600) {
    document.getElementById("ga").style.backgroundColor = "red"
    socket.emit("warning", "on");
  } else {
    document.getElementById("ga").style.backgroundColor = "lavenderblush"
    socket.emit("warning", "off");
  }
}
var tmp = 0;
var myInterval;
function warning() {
  if(tmp == 0){      
      if(confirm("Bật cảnh báo ?") == true){
        myInterval = setInterval(checkGas,500);    
        tmp = 1;
      } 
    } else if(confirm("Tắt cảnh báo ?") == true) {
        document.getElementById("ga").style.backgroundColor = "lavenderblush"
        socket.emit("warning", "off"); 
        clearInterval(myInterval);
        tmp = 0;
      }   
}

function ledWarning() {
  socket.on("server-update-data",function(data){
    if(data.light < 50){
      socket.emit("blink","on");
    } else{
      socket.emit("blink","off");
    }
  })
}
// ledWarning();
//--------------DEN--------------
document.getElementById("batden").style.display = "none"
document.getElementById("tatden").style.display = "inline"

function on() {
  if(confirm("Xác nhận bật đèn ?") == true){
    document.getElementById("batden").style.display = "inline"
    document.getElementById("tatden").style.display = "none"
    document.getElementById("den1").style.backgroundColor = "limegreen"
    document.getElementById("den2").style.backgroundColor = "dodgerblue"
    socket.emit("light","on");
  }
}

function off() {
  if(confirm("Xác nhận tắt đèn ?") == true){
    document.getElementById("batden").style.display = "none"
    document.getElementById("tatden").style.display = "inline"
    document.getElementById("den2").style.backgroundColor = "red"
    document.getElementById("den1").style.backgroundColor = "dodgerblue"
    socket.emit("light","off")
  }
}

//-------------DIEU HOA---------------
document.getElementById("batdh").style.display = "none"
document.getElementById("tatdh").style.display = "inline"

function bat() {
  if(confirm("Xác nhận bật điều hòa ?") == true){
    document.getElementById("batdh").style.display = "inline"
    document.getElementById("tatdh").style.display = "none"
    document.getElementById("dieuhoa1").style.backgroundColor = "limegreen"
    document.getElementById("dieuhoa2").style.backgroundColor = "dodgerblue"
    socket.emit("fan","on")
  }
}

function tat() {
  if(confirm("Xác nhận tắt điều hòa ?") == true){
    document.getElementById("batdh").style.display = "none"
    document.getElementById("tatdh").style.display = "inline"
    document.getElementById("dieuhoa2").style.backgroundColor = "red"
    document.getElementById("dieuhoa1").style.backgroundColor = "dodgerblue"
    socket.emit("fan","off")
  }
}

//-------------BIEU DO------------
var check = 0;
document.getElementById("container1").style.display = "block"
document.getElementById("container2").style.display = "none"

function Chart1() {
  if(check == 0 ) {
    if(confirm("Đổi sang đồ thị ánh sáng-khí ga ?") == true){
      document.getElementById("container1").style.display = "none"
      document.getElementById("container2").style.display = "block"
      check = 1;
    }
  } else if(confirm("Đổi sang đồ thị nhiệt độ-độ ẩm ?") == true) {
    document.getElementById("container1").style.display = "block"
    document.getElementById("container2").style.display = "none"
    check = 0;
  }
}

var chart1 = Highcharts.chart('container1', {
  chart: {
      zoomType: 'xy'
  },
  title: {
      text: 'Đồ thị nhiệt độ - độ ẩm'
  },

  xAxis: [{
      categories: [],
      tickWidth: 1,
      tickLength: 20
  }],
  yAxis: [{ // Primary yAxis
      labels: {
          format: '{value}',
          style: {
              color: '#FF6600'
          }
      },
      title: {
          text: 'Nhiệt độ (°C)',
          style: {
              color: '#FF6600'
          }
      },
  }, { // Secondary yAxis
      title: {
          text: 'Độ ẩm (%)',
          style: {
              color: Highcharts.getOptions().colors[0]
          }
      },
      labels: {
          format: '{value}',
          style: {
              color: Highcharts.getOptions().colors[0]
          }
      },
      opposite: true
  }],
  legend: {
      layout: 'vertical',
      align: 'left',
      x: 60,
      verticalAlign: 'top',
      y: 50,
      floating: true,
      backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || // theme
          'rgba(255,255,255,0.25)'
  },
  series: [{
      name: 'Nhiệt độ',
      type: 'column',
      data: [],
      tooltip: {
          valueSuffix: '°C'
      },
      color: '#FF6600'

  }, {
    name: 'Độ ẩm',
    type: 'column',
    yAxis: 1,
    data: [],
    tooltip: {
        valueSuffix: '%'
    }
  }],
});


var chart2 = Highcharts.chart('container2', {
  chart: {
      zoomType: 'xy'
  },
  title: {
      text: 'Đồ thị ánh sáng - khí gas'
  },

  xAxis: [{
      categories: [],
      tickWidth: 1,
      tickLength: 20
  }],
  yAxis: [{ // Primary yAxis
      labels: {
          format: '{value}',
          style: {
              color: '#00CC99'
          }
      },
      title: {
          text: 'Ánh sáng (lux)',
          style: {
              color: '#00CC99'
          }
      },
  }, { // Secondary yAxis
      title: {
          text: 'Khí ga (ppm)',
          style: {
              color: '#FF9966'
          }
      },
      labels: {
          format: '{value}',
          style: {
              color: '#FF9966'
          }
      },
      opposite: true
  }],
  legend: {
      layout: 'vertical',
      align: 'left',
      x: 60,
      verticalAlign: 'top',
      y: 50,
      floating: true,
      backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || // theme
          'rgba(255,255,255,0.25)'
  },
  series: [{
      name: 'Ánh sáng',
      type: 'spline',
      data: [],
      tooltip: {
          valueSuffix: 'lux'
      },
      color: '#00CC99'
  }, {
      name: 'Khí ga',
      type: 'spline',
      data: [],
      tooltip: {
          valueSuffix: 'ppm'
      },
      color: '#FF9966'
  }],
});

socket.on("server-send-humi_graph", function (data) {
  chart1.series[1].setData(data);
});

socket.on("server-send-temp_graph", function (data) {
  chart1.series[0].setData(data);
});

socket.on("server-send-date_graph", function (data) {
  chart1.xAxis[0].setCategories(data);
  chart2.xAxis[0].setCategories(data);
});

socket.on("server-send-light_graph", function (data) {
  chart2.series[0].setData(data);
});

socket.on("server-send-gas_graph", function (data) {
  chart2.series[1].setData(data);
});