;
const { server, connectDB } = require('./app');
const anilibriaService = require('./services/anilibriaService');
const Anime = require('./models/Anime');

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`
рџљЂ Server is running!
рџ“Ќ Environment: ${process.env.NODE_ENV || 'development'}
рџЊђ Port: ${PORT}
рџ”— URL: http://localhost:${PORT}
рџ“Љ Health Check: http://localhost:${PORT}/health
рџ“љ API Base: http://localhost:${PORT}/api
рџ—„пёЏ  MongoDB: Connected
      `);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

async function autoImportIfEmpty() {
  const count = await Anime.countDocuments();
  if (count === 0) {
    console.log('Р‘Р°Р·Р° РїСѓСЃС‚Р°, РёРјРїРѕСЂС‚РёСЂСѓРµРј Р°РЅРёРјРµ РёР· AniLibria...');
    await anilibriaService.importPopularAnime(50);
    console.log('РРјРїРѕСЂС‚ Р·Р°РІРµСЂС€С‘РЅ!');
  }
}

// Start the server
startServer();

