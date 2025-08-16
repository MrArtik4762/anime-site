// Унифицированный запуск сервера через app.js
const { app, server, connectDB } = require('./app');

// Запускаем сервер только если этот файл вызван напрямую
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  const startServer = async () => {
    try {
      await connectDB();
      server.listen(PORT, () => {
        console.log(`
🚀 Server is running!
📌 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📡 API Base: http://localhost:${PORT}/api
🗄️  Database: Connected
        `);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
}

module.exports = { app, server };