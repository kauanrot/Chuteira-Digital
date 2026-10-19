const createApp = require('./app');

const PORT = process.env.PORT || 3000;
createApp().listen(PORT, () => {
  console.log(`Chuteira Digital API rodando em http://localhost:${PORT}`);
});
