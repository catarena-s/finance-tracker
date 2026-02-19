// Тест формата API после исправлений
const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testApiFormat() {
  console.log('🧪 Тестирование формата API\n');

  // 1. Категории
  console.log('1️⃣ Тест категорий...');
  const categoriesResponse = await makeRequest({
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/v1/categories/',
    method: 'GET'
  });

  if (categoriesResponse.statusCode === 200) {
    const categories = categoriesResponse.data;
    console.log(`   ✅ Статус: ${categoriesResponse.statusCode}`);
    console.log(`   📦 Тип данных: ${Array.isArray(categories) ? 'Array' : 'Object'}`);
    console.log(`   📊 Количество: ${categories.length}`);
    if (categories.length > 0) {
      console.log(`   🔑 Ключи первого элемента: ${Object.keys(categories[0]).join(', ')}`);
      console.log(`   📝 Пример: ${categories[0].name} ${categories[0].icon}`);
    }
  } else {
    console.log(`   ❌ Ошибка: ${categoriesResponse.statusCode}`);
  }

  console.log('');

  // 2. Транзакции
  console.log('2️⃣ Тест транзакций...');
  const transactionsResponse = await makeRequest({
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/v1/transactions/',
    method: 'GET'
  });

  if (transactionsResponse.statusCode === 200) {
    const data = transactionsResponse.data;
    console.log(`   ✅ Статус: ${transactionsResponse.statusCode}`);
    console.log(`   📦 Тип данных: ${typeof data}`);
    console.log(`   🔑 Ключи верхнего уровня: ${Object.keys(data).join(', ')}`);
    console.log(`   📊 Всего транзакций: ${data.total}`);
    console.log(`   📄 Страница: ${data.page} из ${data.pages}`);
    if (data.items && data.items.length > 0) {
      console.log(`   🔑 Ключи транзакции: ${Object.keys(data.items[0]).join(', ')}`);
      console.log(`   📝 Пример: ${data.items[0].description || 'Без описания'} - ${data.items[0].amount} ${data.items[0].currency}`);
    }
  } else {
    console.log(`   ❌ Ошибка: ${transactionsResponse.statusCode}`);
  }

  console.log('');

  // 3. Аналитика
  console.log('3️⃣ Тест аналитики...');
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const analyticsResponse = await makeRequest({
    hostname: '127.0.0.1',
    port: 8000,
    path: `/api/v1/analytics/summary?start_date=${monthAgo}&end_date=${today}`,
    method: 'GET'
  });

  if (analyticsResponse.statusCode === 200) {
    const summary = analyticsResponse.data;
    console.log(`   ✅ Статус: ${analyticsResponse.statusCode}`);
    console.log(`   🔑 Ключи: ${Object.keys(summary).join(', ')}`);
    console.log(`   💰 Доход: ${summary.total_income}`);
    console.log(`   💸 Расход: ${summary.total_expense}`);
    console.log(`   📊 Баланс: ${summary.balance}`);
  } else {
    console.log(`   ❌ Ошибка: ${analyticsResponse.statusCode}`);
  }

  console.log('');
  console.log('✨ Тестирование завершено!');
  console.log('');
  console.log('📝 Выводы:');
  console.log('   - Категории возвращаются как массив (Array)');
  console.log('   - Транзакции возвращаются как объект с полями: items, total, page, page_size, pages');
  console.log('   - Аналитика возвращается как объект с полями: total_income, total_expense, balance, transaction_count');
  console.log('   - Все поля используют snake_case (created_at, transaction_date, etc.)');
  console.log('');
  console.log('🔧 Фронтенд должен:');
  console.log('   1. Преобразовывать snake_case в camelCase автоматически');
  console.log('   2. Обрабатывать формат {items, total, page, page_size, pages} для транзакций');
  console.log('   3. Обрабатывать массивы напрямую для категорий и бюджетов');
}

testApiFormat().catch(console.error);
