const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('🤖 [SIMULADOR ESP32] Conectado ao HiveMQ!');
  console.log('Enviando dados de teste a cada 5 segundos...\n');

  // Inscreve para ouvir comandos do relé (!ligar_ar)
  client.subscribe('SMARTWEATHER/S1');

  // Envia dados simulados a cada 5 segundos
  setInterval(() => {
    // Gera temperatura entre 24°C e 32°C e umidade entre 40% e 80%
    const tempSimulada = (Math.random() * (32 - 24) + 24).toFixed(1);
    const umidSimulada = Math.floor(Math.random() * (80 - 40) + 40);

    client.publish('SMARTWEATHER/TEMP', tempSimulada);
    client.publish('SMARTWEATHER/UMID', umidSimulada.toString());

    console.log(`📡 [SIMULADOR] Temperatura: ${tempSimulada}°C | Umidade: ${umidSimulada}%`);
  }, 5000);
});

// Ouve quando você envia !ligar_ar ou !desligar_ar no WhatsApp
client.on('message', (topic, message) => {
  if (topic === 'SMARTWEATHER/S1') {
    const estado = message.toString();
    if (estado === 'ON') {
      console.log('❄️ [SIMULADOR RELÉ] Ar-condicionado LIGADO!');
    } else if (estado === 'OFF') {
      console.log('🔴 [SIMULADOR RELÉ] Ar-condicionado DESLIGADO!');
    }
  }
});