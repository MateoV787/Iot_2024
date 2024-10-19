// Imports
import React, { useState, useEffect } from "react";
import Chart from 'chart.js/auto';
import { Line } from "react-chartjs-2";
import useWebSocket from 'react-use-websocket';
import './App.css'

// Componente App
function App() {

  const [socketUrl] = useState('wss://g9l3d0cfg2.execute-api.us-east-1.amazonaws.com/production/');
  const { lastMessage } = useWebSocket(socketUrl);
  
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

  useEffect(() => {
    if (lastMessage != null) {
      // Parseamos el mensaje recibido del WebSocket
      const esp32Data = JSON.parse(lastMessage.data);

      // Extraemos los valores de temperatura y humedad
      const tempValue = esp32Data.temp;
      const humValue = esp32Data.hum;

      // Obtenemos la fecha y hora actual
      const currentDate = new Date();
      const label = currentDate.getDate().toString() + "-"
        + (currentDate.getMonth() + 1).toString() + "-"
        + currentDate.getFullYear() + " "
        + currentDate.getHours() + ":"
        + currentDate.getMinutes();

      // Actualizamos el estado de los datos con los nuevos valores
      setData((prevData) => {
        const updatedTempData = [...prevData.datasets[0].data, tempValue];
        const updatedHumData = [...prevData.datasets[1].data, humValue];
        const updatedLabels = [...prevData.labels, label];

        return {
          ...prevData,
          labels: updatedLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: updatedTempData,
            },
            {
              ...prevData.datasets[1],
              data: updatedHumData,
            }
          ]
        };
      });
    }
  }, [lastMessage]);

  return (
    <div>
      <p id="paragraph2"></p>
      <Line data={data} />
    </div>
  );
}

export default App;
