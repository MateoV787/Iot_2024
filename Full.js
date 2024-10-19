// Imports
import Chart from 'chart.js/auto';
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './App.css';

// Función para hacer la petición HTTP con parámetros de fecha en milisegundos
function httpGetWithDates(start, end) {
  const theUrl = `https://h1v4tef587.execute-api.us-east-1.amazonaws.com/alfa/data/range?start_time=${start}&end_time=${end}`;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); 
  xmlHttp.send();
  return xmlHttp.responseText;
}

// Componente principal
function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: "ESP32 Temperature",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: [],
      },
      {
        label: "ESP32 Humidity",
        backgroundColor: "rgb(132,99,255)",
        borderColor: "rgb(132, 99, 255)",
        data: [],
      }
    ],
  });

  // Clic en "Filtrar"
  const handleFilterClick = () => {
    // Convertir fechas a milisegundos
    const start = new Date(startDate).getTime(); 
    const end = new Date(endDate).getTime();

    // Obtener los datos filtrados de la API
    const JSONResponse = httpGetWithDates(start, end);
    const esp32Items = JSON.parse(JSONResponse);

    // Procesar los datos recibidos desde la API
    const tempValues = esp32Items.map((item) => item.temp);
    const humValues = esp32Items.map((item) => item.hum);
    const labels = esp32Items.map((item) => {
      const myDate = new Date(item.timestamp);
      return myDate.getDate().toString()
        + "-" + (myDate.getMonth() + 1).toString()
        + "-" + myDate.getFullYear()
        + " " + myDate.getHours()
        + ":" + myDate.getMinutes();
    });

    // Actualizar el gráfico con los datos filtrados
    setData({
      labels: labels,
      datasets: [
        {
          label: "ESP32 Humidity",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: humValues,
        },
        {
          label: "ESP32 Temperature",
          backgroundColor: "rgb(132, 99, 255)",
          borderColor: "rgb(132, 99, 255)",
          data: tempValues,
        }
      ],
    });
  };

  return (
    <div>
      <h2>Seleccione el rango de fechas</h2>
      <div>
        <label>Fecha de inicio: </label>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
      </div>
      <div>
        <label>Fecha de fin: </label>
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
      </div>
      <button onClick={handleFilterClick}>Filtrar</button>
      
      <Line data={data} />
    </div>
  );
}

export default App;
