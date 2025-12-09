// k6 Load Testing Script - Full API Test Suite
// Week 3 - Day 6: Performance Testing

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const customerTrend = new Trend('customer_requests');
const salesTrend = new Trend('sales_requests');
const inventoryTrend = new Trend('inventory_requests');
const productionTrend = new Trend('production_requests');

// Test configuration - Progressive load testing
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Light load: 10 users
    { duration: '2m', target: 10 },   // Stay at 10
    { duration: '1m', target: 50 },   // Medium load: 50 users
    { duration: '2m', target: 50 },   // Stay at 50
    { duration: '1m', target: 100 },  // Heavy load: 100 users
    { duration: '2m', target: 100 },  // Stay at 100
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<100', 'p(99)<200'], // 95% < 100ms, 99% < 200ms
    'http_req_failed': ['rate<0.001'],                // Error rate < 0.1%
    'errors': ['rate<0.001'],
    'customer_requests': ['p(95)<50'],
    'sales_requests': ['p(95)<50'],
    'inventory_requests': ['p(95)<50'],
    'production_requests': ['p(95)<50'],
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // Group 1: Customer Operations
  group('Customer Operations', () => {
    const start = Date.now();
    
    // List customers with pagination
    const listRes = http.get(`${BASE_URL}/customers?page=1&limit=25`);
    check(listRes, {
      'customers list status is 200': (r) => r.status === 200,
      'customers list has data': (r) => JSON.parse(r.body).data !== undefined,
    });
    errorRate.add(listRes.status !== 200);
    customerTrend.add(Date.now() - start);
    
    sleep(0.5);
    
    // Search customers
    const searchRes = http.get(`${BASE_URL}/customers?page=1&limit=25&search=test`);
    check(searchRes, {
      'customers search status is 200': (r) => r.status === 200,
    });
    errorRate.add(searchRes.status !== 200);
  });

  sleep(1);

  // Group 2: Sales Operations
  group('Sales Operations', () => {
    const start = Date.now();
    
    // List sales orders
    const ordersRes = http.get(`${BASE_URL}/sales/orders?page=1&limit=25`);
    check(ordersRes, {
      'sales orders status is 200': (r) => r.status === 200,
      'sales orders has data': (r) => JSON.parse(r.body).data !== undefined,
    });
    errorRate.add(ordersRes.status !== 200);
    salesTrend.add(Date.now() - start);
    
    sleep(0.5);
    
    // Filter by status
    const filterRes = http.get(`${BASE_URL}/sales/orders?page=1&limit=25&status=pending`);
    check(filterRes, {
      'sales filter status is 200': (r) => r.status === 200,
    });
    errorRate.add(filterRes.status !== 200);
  });

  sleep(1);

  // Group 3: Inventory Operations
  group('Inventory Operations', () => {
    const start = Date.now();
    
    // List products
    const productsRes = http.get(`${BASE_URL}/inventory/products?page=1&limit=25`);
    check(productsRes, {
      'products list status is 200': (r) => r.status === 200,
      'products list has data': (r) => JSON.parse(r.body).data !== undefined,
    });
    errorRate.add(productsRes.status !== 200);
    inventoryTrend.add(Date.now() - start);
    
    sleep(0.5);
    
    // Search products
    const searchRes = http.get(`${BASE_URL}/inventory/products?page=1&limit=25&search=product`);
    check(searchRes, {
      'products search status is 200': (r) => r.status === 200,
    });
    errorRate.add(searchRes.status !== 200);
    
    sleep(0.5);
    
    // List categories
    const categoriesRes = http.get(`${BASE_URL}/inventory/categories`);
    check(categoriesRes, {
      'categories status is 200': (r) => r.status === 200,
    });
    errorRate.add(categoriesRes.status !== 200);
  });

  sleep(1);

  // Group 4: Production Operations
  group('Production Operations', () => {
    const start = Date.now();
    
    // List production orders
    const ordersRes = http.get(`${BASE_URL}/production/orders?page=1&limit=25`);
    check(ordersRes, {
      'production orders status is 200': (r) => r.status === 200,
      'production orders has data': (r) => JSON.parse(r.body).data !== undefined,
    });
    errorRate.add(ordersRes.status !== 200);
    productionTrend.add(Date.now() - start);
    
    sleep(0.5);
    
    // Filter by status
    const filterRes = http.get(`${BASE_URL}/production/orders?page=1&limit=25&status=in_progress`);
    check(filterRes, {
      'production filter status is 200': (r) => r.status === 200,
    });
    errorRate.add(filterRes.status !== 200);
  });

  sleep(2);
}

export function handleSummary(data) {
  console.log('\n✅ Full Load Test Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 Overall Performance:');
  console.log(`  Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`  Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(3)}%`);
  console.log(`  Avg Duration: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`  p50 Duration: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms`);
  console.log(`  p95 Duration: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`  p99 Duration: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);
  
  console.log('\n📈 Module Performance:');
  console.log(`  Customers p95: ${data.metrics.customer_requests.values['p(95)'].toFixed(2)}ms`);
  console.log(`  Sales p95: ${data.metrics.sales_requests.values['p(95)'].toFixed(2)}ms`);
  console.log(`  Inventory p95: ${data.metrics.inventory_requests.values['p(95)'].toFixed(2)}ms`);
  console.log(`  Production p95: ${data.metrics.production_requests.values['p(95)'].toFixed(2)}ms`);
  
  console.log('\n✅ Checks Passed: ' + data.metrics.checks.values.passes);
  console.log('❌ Checks Failed: ' + data.metrics.checks.values.fails);
  
  console.log('\n🎯 Performance Targets:');
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const p99 = data.metrics.http_req_duration.values['p(99)'];
  const errRate = data.metrics.http_req_failed.values.rate;
  
  console.log(`  ${p95 < 100 ? '✅' : '❌'} p95 < 100ms (actual: ${p95.toFixed(2)}ms)`);
  console.log(`  ${p99 < 200 ? '✅' : '❌'} p99 < 200ms (actual: ${p99.toFixed(2)}ms)`);
  console.log(`  ${errRate < 0.001 ? '✅' : '❌'} Error rate < 0.1% (actual: ${(errRate * 100).toFixed(3)}%)`);
  
  return {
    'results/k6_full_load_test.json': JSON.stringify(data, null, 2),
  };
}
