# Load Testing Setup

## Prerequisites

### Install Apache Bench
```bash
# Ubuntu/Debian
sudo apt-get install apache2-utils

# macOS
brew install httpd

# Arch Linux
sudo pacman -S apache
```

### Install k6
```bash
# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS
brew install k6

# Arch Linux
yay -S k6-bin
```

## Test Scripts

### 1. Apache Bench Tests
Run from project root:
```bash
# Start server first
./start.sh

# Run tests
cd backend/tests/load
./ab_tests.sh
```

### 2. k6 Tests
```bash
# Simple test
k6 run simple_test.js

# API endpoints test
k6 run api_test.js

# Full load test
k6 run full_load_test.js
```

## Test Scenarios

### Scenario 1: Light Load (10 concurrent users)
- 1000 requests total
- 10 requests/second

### Scenario 2: Medium Load (50 concurrent users)
- 5000 requests total
- 50 requests/second

### Scenario 3: Heavy Load (100 concurrent users)
- 10000 requests total
- 100 requests/second

## Expected Results

Based on our optimizations:
- Response time p50: <10ms
- Response time p95: <50ms
- Response time p99: <100ms
- Error rate: <0.1%
- Throughput: >200 req/sec
