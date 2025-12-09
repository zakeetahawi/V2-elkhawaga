// k6 Load Testing Script - Simple API Health Check
// Week 3 - Day 6: Performance Testing

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests should be below 100ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // Test 1: Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });
  errorRate.add(healthRes.status !== 200);

  sleep(1);

  // Test 2: Customers endpoint with pagination
  const customersRes = http.get(`${BASE_URL}/customers?page=1&limit=25`);
  check(customersRes, {
    'customers status is 200': (r) => r.status === 200,
    'customers response time < 50ms': (r) => r.timings.duration < 50,
  });
  errorRate.add(customersRes.status !== 200);

  sleep(1);

  // Test 3: Products endpoint
  const productsRes = http.get(`${BASE_URL}/inventory/products?page=1&limit=25`);
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 50ms': (r) => r.timings.duration < 50,
  });
  errorRate.add(productsRes.status !== 200);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'results/k6_simple_test.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}✅ Test Complete\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  summary += `${indent}📊 Key Metrics:\n`;
  summary += `${indent}  Checks: ${data.metrics.checks.values.passes}/${data.metrics.checks.values.passes + data.metrics.checks.values.fails}\n`;
  summary += `${indent}  Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  summary += `${indent}  Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  
  return summary;
}
