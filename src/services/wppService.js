const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { dadosSensor, ligarAr, desligarAr } = require('../config/mqtt');
const { analisarConfortoTermico } = require('./aiService');
const { gerarPdfRelatorio } = require('./pdfService');

function iniciarWhatsApp() {
  const wppClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  wppClient.on('qr', (qr) => {
    console.log('[WhatsApp] Leia o QR Code abaixo no seu aplicativo:');
    qrcode.generate(qr, { small: true });
  });

  wppClient.on('ready', () => {
    console.log('[WhatsApp] Bot conectado e pronto para uso!');
  });

  wppClient.on('message', async (msg) => {
    // Comando: !relatorio
    if (msg.body === '!relatorio') {
      console.log(`[WhatsApp] Comando !relatorio recebido de ${msg.from}`);

      try {
        await msg.reply('Entendido! Solicitando análise da IA e gerando o PDF. Aguarde um instante...');

        const analise = await analisarConfortoTermico(dadosSensor.temperatura, dadosSensor.umidade);
        const caminhoPdf = await gerarPdfRelatorio(dadosSensor.temperatura, dadosSensor.umidade, analise);

        // Carrega o PDF e converte para Base64
        const pdfBase64 = fs.readFileSync(caminhoPdf, { encoding: 'base64' });
        const nomeArquivo = path.basename(caminhoPdf);
        const media = new MessageMedia('application/pdf', pdfBase64, nomeArquivo);

        // Envia usando a instância de chat resolvida pelo próprio evento da mensagem
        const chat = await msg.getChat();
        await chat.sendMessage(media, { sendMediaAsDocument: true });

        console.log('[WhatsApp] PDF enviado com sucesso!');

        // Limpeza do arquivo temporário
        setTimeout(() => {
          if (fs.existsSync(caminhoPdf)) {
            fs.unlinkSync(caminhoPdf);
          }
        }, 3000);

      } catch (error) {
        console.error('[Erro ao enviar via WhatsApp]:', error);
        
        // Em caso de falha no envio do arquivo, envia a análise formatada no próprio chat
        try {
          const analise = await analisarConfortoTermico(dadosSensor.temperatura, dadosSensor.umidade);
          await msg.reply(`*Laudo Climatológico Smart Weather*\n\n${analise}`);
        } catch (e) {
          await msg.reply('Ocorreu um erro ao processar o relatório.');
        }
      }
    }

    // Comando: !ligar_ar
    if (msg.body === '!ligar_ar') {
      ligarAr();
      await msg.reply('Comando enviado para ligar o Ar Condicionado (Relé S1).');
    }

    // Comando: !desligar_ar
    if (msg.body === '!desligar_ar') {
      desligarAr();
      await msg.reply('Comando enviado para desligar o Ar Condicionado (Relé S1).');
    }
  });

  wppClient.initialize();
}

module.exports = { iniciarWhatsApp };