const http = require('http');

// Проверяем несколько портов, на которых может работать сервер
const ports = [5000, 3000, 8080, 9000];

function testPort(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Порт ${port}: Ответ - ${res.statusCode}`);
      resolve({ port, status: 'success', statusCode: res.statusCode });
    });

    req.on('error', (error) => {
      // console.log(`❌ Порт ${port}: ${error.message}`);
      resolve({ port, status: 'error', error: error.message });
    });

    req.on('timeout', () => {
      // console.log(`⏰ Порт ${port}: Таймаут`);
      req.destroy();
      resolve({ port, status: 'timeout' });
    });

    req.end();
  });
}

async function testAllPorts() {
  console.log('🔍 Проверка доступных портов...\n');
  
  const results = await Promise.all(ports.map(testPort));
  
  console.log('\n📊 Результаты проверки:');
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ Порт ${result.port}: Доступен (статус: ${result.statusCode})`);
    } else {
      console.log(`❌ Порт ${result.port}: ${result.status === 'timeout' ? 'Таймаут' : 'Ошибка'}`);
    }
  });
  
  const workingPort = results.find(r => r.status === 'success');
  if (workingPort) {
    console.log(`\n🎉 Найден работающий сервер на порту ${workingPort.port}`);
    console.log(`🔗 URL: http://localhost:${workingPort.port}/health`);
  } else {
    console.log('\n😞 Не удалось найти работающий сервер на проверенных портах');
  }
}

testAllPorts();