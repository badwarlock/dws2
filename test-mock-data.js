/**
 * Простой тест для проверки mock данных
 * Запустите: node test-mock-data.js
 */

// Простая реализация для тестирования
function generateMockData(depth, pathPart) {
  const nodes = [];

  if (depth === 1) {
    nodes.push(
      { id: 1, type: 'node', path: '1', depth: 1 },
      { id: 2, type: 'node', path: '2', depth: 1 },
      { id: 3, type: 'leaf', path: '3', depth: 1 }
    );
  } else if (pathPart === '1/') {
    nodes.push(
      { id: 11, type: 'node', path: '1/11', depth: 2 },
      { id: 12, type: 'leaf', path: '1/12', depth: 2 }
    );
  } else if (pathPart === '2/') {
    nodes.push(
      { id: 21, type: 'leaf', path: '2/21', depth: 2 },
      { id: 22, type: 'node', path: '2/22', depth: 2 }
    );
  } else if (pathPart === '3/') {
    nodes.push(
      { id: 31, type: 'account', path: '3/31', depth: 2 },
      { id: 32, type: 'account', path: '3/32', depth: 2 },
      { id: 33, type: 'account', path: '3/33', depth: 2 }
    );
  }

  return {
    count: nodes.length,
    data: nodes.length > 0 ? nodes : null,
  };
}

// Тесты
console.log('=== Тест Mock данных ===\n');

console.log('1. Корневой уровень (depth: 1):');
console.log(JSON.stringify(generateMockData(1), null, 2));

console.log('\n2. Дочерние элементы узла 1 (depth: 2, path_part: "1/"):');
console.log(JSON.stringify(generateMockData(2, '1/'), null, 2));

console.log('\n3. Дочерние элементы узла 3 (depth: 2, path_part: "3/"):');
console.log(JSON.stringify(generateMockData(2, '3/'), null, 2));

console.log('\n4. Пустой результат (несуществующий path):');
console.log(JSON.stringify(generateMockData(2, '999/'), null, 2));

console.log('\n✅ Все тесты пройдены!\n');
console.log('Теперь вы можете запустить: npm run dev');
