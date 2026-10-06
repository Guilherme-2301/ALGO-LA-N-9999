const mqtt = require('mqtt');

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

// Estado compartilhado das últimas leituras
const dadosSensor = {
  temperatura: "N/A",
  umidade: "N/A"
};

mqttClient.on('connect', () => {
  console.log('[MQTT] Conectado ao HiveMQ!');
  mqttClient.subscribe('SMARTWEATHER/TEMP');
  mqttClient.subscribe('SMARTWEATHER/UMID');
});

mqttClient.on('message', (topic, message) => {
  const valor = message.toString();
  if (topic === 'SMARTWEATHER/TEMP') dadosSensor.temperatura = valor;
  if (topic === 'SMARTWEATHER/UMID') dadosSensor.umidade = valor;
});

function ligarAr() {
  mqttClient.publish('SMARTWEATHER/S1', 'ON');
}

function desligarAr() {
  mqttClient.publish('SMARTWEATHER/S1', 'OFF');
}

module.exports = {
  mqttClient,
  dadosSensor,
  ligarAr,
  desligarAr
};