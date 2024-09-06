const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize WhatsApp client
const WhatsAppclient = new Client({
  authStrategy: new LocalAuth(),
});

WhatsAppclient.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

WhatsAppclient.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

WhatsAppclient.on('auth_failure', (msg) => {
  console.error('Authentication failed:', msg);
});

WhatsAppclient.on('error', (err) => {
  console.error('Client error:', err);
});

WhatsAppclient.on('disconnected', (reason) => {
  console.error('Client disconnected:', reason);
  // Attempt to reinitialize the client
  WhatsAppclient.initialize().catch((err) => {
    console.error('Failed to reinitialize WhatsApp client:', err);
  });
});

// Handle reinitialization logic in case of errors
const initializeClient = async () => {
  try {
    await WhatsAppclient.initialize();
  } catch (err) {
    console.error('Failed to initialize WhatsApp client:', err);
    // Retry after a delay
    setTimeout(initializeClient, 30000); // Retry after 30 seconds
  }
};

// Start the initialization
initializeClient();

module.exports = WhatsAppclient;
