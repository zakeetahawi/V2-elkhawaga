#!/bin/bash

# Apache Bench Load Testing Script
# Week 3 - Day 6: Performance Testing

echo "🚀 Starting Apache Bench Load Tests"
echo "===================================="
echo ""

# Configuration
BASE_URL="http://localhost:8080/api/v1"
RESULTS_DIR="./results"
mkdir -p "$RESULTS_DIR"

# Test endpoints
declare -a ENDPOINTS=(
    "customers?page=1&limit=25"
    "sales/orders?page=1&limit=25"
    "inventory/products?page=1&limit=25"
    "production/orders?page=1&limit=25"
)

# Test scenarios
declare -a SCENARIOS=(
    "10:1000:Light Load (10 concurrent)"
    "50:5000:Medium Load (50 concurrent)"
    "100:10000:Heavy Load (100 concurrent)"
)

echo "📋 Test Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Endpoints: ${#ENDPOINTS[@]}"
echo "  Scenarios: ${#SCENARIOS[@]}"
echo ""

# Function to run a single test
run_test() {
    local endpoint=$1
    local concurrency=$2
    local requests=$3
    local scenario_name=$4
    
    local endpoint_name=$(echo "$endpoint" | cut -d'?' -f1 | tr '/' '_')
    local output_file="$RESULTS_DIR/ab_${endpoint_name}_c${concurrency}_n${requests}.txt"
    
    echo "  Testing: $endpoint"
    echo "  Concurrency: $concurrency, Requests: $requests"
    
    ab -n "$requests" -c "$concurrency" -g "$output_file.tsv" \
       "$BASE_URL/$endpoint" > "$output_file" 2>&1
    
    # Extract key metrics
    local rps=$(grep "Requests per second:" "$output_file" | awk '{print $4}')
    local mean_time=$(grep "Time per request:" "$output_file" | grep -v "across" | awk '{print $4}')
    local failed=$(grep "Failed requests:" "$output_file" | awk '{print $3}')
    
    echo "  ✅ RPS: $rps, Mean Time: ${mean_time}ms, Failed: $failed"
    echo ""
}

# Run tests
for scenario in "${SCENARIOS[@]}"; do
    IFS=':' read -r concurrency requests scenario_name <<< "$scenario"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Scenario: $scenario_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    for endpoint in "${ENDPOINTS[@]}"; do
        run_test "$endpoint" "$concurrency" "$requests" "$scenario_name"
    done
    
    echo ""
done

echo "✅ All tests complete!"
echo "Results saved to: $RESULTS_DIR"
echo ""
echo "📊 Summary Report:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate summary
for result_file in "$RESULTS_DIR"/ab_*.txt; do
    if [ -f "$result_file" ]; then
        filename=$(basename "$result_file")
        rps=$(grep "Requests per second:" "$result_file" | awk '{print $4}')
        mean_time=$(grep "Time per request:" "$result_file" | grep -v "across" | awk '{print $4}')
        p50=$(grep "50%" "$result_file" | awk '{print $2}')
        p95=$(grep "95%" "$result_file" | awk '{print $2}')
        p99=$(grep "99%" "$result_file" | awk '{print $2}')
        
        echo "$filename: RPS=$rps, Mean=${mean_time}ms, p50=${p50}ms, p95=${p95}ms, p99=${p99}ms"
    fi
done

echo ""
echo "🎯 Performance Targets:"
echo "  ✓ RPS > 200"
echo "  ✓ Mean Time < 50ms"
echo "  ✓ p95 < 50ms"
echo "  ✓ p99 < 100ms"
echo "  ✓ Error Rate < 0.1%"
