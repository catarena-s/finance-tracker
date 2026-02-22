// Создание тестовых данных для проверки интеграции
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ 
            statusCode: res.statusCode, 
            data: responseData ? JSON.parse(responseData) : null 
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createTestData() {
  console.log('🎨 Создание тестовых данных для проверки интеграции\n');

  // 1. Получаем существующие категории
  console.log('1️⃣ Получение категорий...');
  const categoriesResponse = await makeRequest({
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/v1/categories/',
    method: 'GET'
  });

  if (categoriesResponse.statusCode !== 200) {
    console.log('❌ Ошибка получения категорий');
    return;
  }

  const categories = categoriesResponse.data;
  console.log(`   ✅ Получено ${categories.length} категорий`);

  // Найдем категории для расходов и доходов
  const expenseCategory = categories.find(c => c.type === 'expense');
  const incomeCategory = categories.find(c => c.type === 'income');

  if (!expenseCategory || !incomeCategory) {
    console.log('❌ Не найдены необходимые категории');
    return;
  }

  console.log(`   📦 Категория расходов: ${expenseCategory.name} ${expenseCategory.icon}`);
  console.log(`   💰 Категория доходов: ${incomeCategory.name} ${incomeCategory.icon}`);

  // 2. Создаем транзакции
  console.log('\n2️⃣ Создание тестовых транзакций...');
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const transactions = [
    {
      amount: 50000,
      type: 'income',
      category_id: incomeCategory.id,
      description: 'Зарплата за февраль',
      transaction_date: today
    },
    {
      amount: 1500,
      type: 'expense',
      category_id: expenseCategory.id,
      description: 'Покупка продуктов',
      transaction_date: today
    },
    {
      amount: 800,
      type: 'expense',
      category_id: expenseCategory.id,
      description: 'Кофе в кафе',
      transaction_date: yesterday
    },
    {
      amount: 3000,
      type: 'expense',
      category_id: expenseCategory.id,
      description: 'Ужин в ресторане',
      transaction_date: yesterday
    }
  ];

  for (const tx of transactions) {
    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/api/v1/transactions/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, tx);

    if (response.statusCode === 201) {
      console.log(`   ✅ Создана транзакция: ${tx.description} (${tx.amount} ₽)`);
    } else {
      console.log(`   ❌ Ошибка создания транзакции: ${tx.description}`);
      console.log(`      Статус: ${response.statusCode}`);
    }
  }

  // 3. Создаем бюджет
  console.log('\n3️⃣ Создание тестового бюджета...');
  
  const startDate = new Date();
  startDate.setDate(1); // Первый день месяца
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // Последний день месяца

  const budget = {
    category_id: expenseCategory.id,
    amount: 15000,
    period: 'monthly',
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0]
  };

  const budgetResponse = await makeRequest({
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/v1/budgets/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, budget);

  if (budgetResponse.statusCode === 201) {
    console.log(`   ✅ Создан бюджет: ${budget.amount} ₽ на категорию "${expenseCategory.name}"`);
  } else {
    console.log(`   ⚠️  Бюджет не создан (возможно, уже существует)`);
  }

  // 4. Проверяем итоговые данные
  console.log('\n4️⃣ Проверка созданных данных...');
  
  const txListResponse = await makeRequest({
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/v1/transactions/',
    method: 'GET'
  });

  if (txListResponse.statusCode === 200) {
    const allTransactions = txListResponse.data;
    console.log(`   ✅ Всего транзакций в системе: ${allTransactions.length}`);
    
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    console.log(`   💰 Общий доход: ${totalIncome.toFixed(2)} ₽`);
    console.log(`   💸 Общий расход: ${totalExpense.toFixed(2)} ₽`);
    console.log(`   📊 Баланс: ${(totalIncome - totalExpense).toFixed(2)} ₽`);
  }

  console.log('\n✨ Тестовые данные созданы!');
  console.log('\n📝 Теперь откройте браузер и проверьте:');
  console.log('   🌐 http://localhost:3000');
  console.log('   ');
  console.log('   Что проверить:');
  console.log('   1. Дашборд показывает правильные суммы доходов и расходов');
  console.log('   2. Список транзакций отображается корректно');
  console.log('   3. Бюджеты показывают прогресс');
  console.log('   4. Графики и аналитика работают');
}

createTestData().catch(console.error);
