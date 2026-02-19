// Тест интеграции фронтенда и бэкенда
const http = require('http');

// Функция для выполнения HTTP запроса
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: data });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testIntegration() {
  console.log('🧪 Тестирование интеграции фронтенда и бэкенда\n');

  // 1. Проверка бэкенда
  console.log('1️⃣ Проверка бэкенда (http://127.0.0.1:8000)...');
  try {
    const backendResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/api/v1/categories/',
      method: 'GET'
    });
    
    if (backendResponse.statusCode === 200) {
      const categories = JSON.parse(backendResponse.data);
      console.log(`   ✅ Бэкенд работает! Получено ${categories.length} категорий`);
      console.log(`   📋 Примеры категорий:`);
      categories.slice(0, 3).forEach(cat => {
        console.log(`      - ${cat.name} ${cat.icon} (${cat.type})`);
      });
    } else {
      console.log(`   ❌ Ошибка: статус ${backendResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Ошибка подключения к бэкенду: ${error.message}`);
    return;
  }

  console.log('');

  // 2. Проверка фронтенда
  console.log('2️⃣ Проверка фронтенда (http://127.0.0.1:3000)...');
  try {
    const frontendResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    
    if (frontendResponse.statusCode === 200) {
      console.log(`   ✅ Фронтенд работает!`);
      console.log(`   📄 Размер страницы: ${frontendResponse.data.length} байт`);
    } else {
      console.log(`   ❌ Ошибка: статус ${frontendResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Ошибка подключения к фронтенду: ${error.message}`);
    return;
  }

  console.log('');

  // 3. Проверка API транзакций
  console.log('3️⃣ Проверка API транзакций...');
  try {
    const transactionsResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/api/v1/transactions/',
      method: 'GET'
    });
    
    if (transactionsResponse.statusCode === 200) {
      const transactions = JSON.parse(transactionsResponse.data);
      console.log(`   ✅ API транзакций работает! Получено ${transactions.length} транзакций`);
    } else {
      console.log(`   ❌ Ошибка: статус ${transactionsResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
  }

  console.log('');

  // 4. Проверка API бюджетов
  console.log('4️⃣ Проверка API бюджетов...');
  try {
    const budgetsResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/api/v1/budgets/',
      method: 'GET'
    });
    
    if (budgetsResponse.statusCode === 200) {
      const budgets = JSON.parse(budgetsResponse.data);
      console.log(`   ✅ API бюджетов работает! Получено ${budgets.length} бюджетов`);
    } else {
      console.log(`   ❌ Ошибка: статус ${budgetsResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
  }

  console.log('');
  console.log('✨ Тестирование завершено!');
  console.log('');
  console.log('📝 Следующие шаги:');
  console.log('   1. Откройте браузер: http://localhost:3000');
  console.log('   2. Проверьте, что данные отображаются корректно');
  console.log('   3. Попробуйте создать новую транзакцию');
  console.log('   4. Проверьте обновление дашборда');
}

testIntegration().catch(console.error);
