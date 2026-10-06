require('dotenv').config();
const { iniciarWhatsApp } = require('./services/wppService');

// Inicializa a aplicação e escutas do WhatsApp/MQTT
console.log('Iniciando Smart Weather Backend...');
iniciarWhatsApp();