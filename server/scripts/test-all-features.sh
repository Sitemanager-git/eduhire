#!/bin/bash

# test-all-features.sh - Enhanced with Logging Mechanism
# Tests all features of Eduhire platform and stores results

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="./test-logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/test_${TIMESTAMP}.log"
SUMMARY_FILE="${LOG_DIR}/test_summary_${TIMESTAMP}.txt"
API_BASE_URL="http://localhost:5000/api"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Initialize log file
echo "========================================" | tee -a "$LOG_FILE"
echo "EDUHIRE PLATFORM TEST SUITE" | tee -a "$LOG_FILE"
echo "Test Started: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to log messages
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to log test results
log_test() {
    local test_name=$1
    local status=$2
    local details=$3

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name" | tee -a "$LOG_FILE"
        echo "  Status: PASSED" >> "$LOG_FILE"
        ((PASSED++))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $test_name" | tee -a "$LOG_FILE"
        echo "  Status: FAILED" >> "$LOG_FILE"
        echo "  Details: $details" >> "$LOG_FILE"
        ((FAILED++))
    else
        echo -e "${YELLOW}⊘${NC} $test_name" | tee -a "$LOG_FILE"
        echo "  Status: SKIPPED" >> "$LOG_FILE"
        ((SKIPPED++))
    fi
    echo "" >> "$LOG_FILE"
}

# Initialize counters
PASSED=0
FAILED=0
SKIPPED=0

# Function to check if server is running
check_server() {
    log "INFO" "Checking if server is running..."
    if curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/health" | grep -q "200\|404"; then
        log "INFO" "Server is running"
        return 0
    else
        log "ERROR" "Server is not responding"
        return 1
    fi
}

# Test 1: Server Health Check
test_server_health() {
    log "INFO" "Running: Server Health Check"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/health" 2>&1)
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        log_test "Server Health Check" "PASS"
    else
        log_test "Server Health Check" "FAIL" "Server returned status: $response"
    fi
}

# Test 2: User Registration
test_user_registration() {
    log "INFO" "Running: User Registration Test"
    response=$(curl -s -X POST "$API_BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Teacher",
            "email": "test_'$TIMESTAMP'@example.com",
            "password": "TestPass123!",
            "userType": "teacher"
        }' 2>&1)

    if echo "$response" | grep -q "success\|token\|user"; then
        log_test "User Registration" "PASS"
        # Save token for subsequent tests
        TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo "$TOKEN" > "${LOG_DIR}/test_token_${TIMESTAMP}.txt"
    else
        log_test "User Registration" "FAIL" "$response"
    fi
}

# Test 3: User Login
test_user_login() {
    log "INFO" "Running: User Login Test"
    response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "password123"
        }' 2>&1)

    if echo "$response" | grep -q "token\|success"; then
        log_test "User Login" "PASS"
    else
        log_test "User Login" "FAIL" "$response"
    fi
}

# Test 4: Job Search
test_job_search() {
    log "INFO" "Running: Job Search Test"
    response=$(curl -s "$API_BASE_URL/jobs/search?subject=Mathematics&limit=10" 2>&1)

    if echo "$response" | grep -q "jobs\|\[\]"; then
        log_test "Job Search" "PASS"
    else
        log_test "Job Search" "FAIL" "$response"
    fi
}

# Test 5: Job Details
test_job_details() {
    log "INFO" "Running: Job Details Test"
    # First get a job ID
    job_response=$(curl -s "$API_BASE_URL/jobs/search?limit=1" 2>&1)
    job_id=$(echo "$job_response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$job_id" ]; then
        response=$(curl -s "$API_BASE_URL/jobs/$job_id" 2>&1)
        if echo "$response" | grep -q "title\|description"; then
            log_test "Job Details" "PASS"
        else
            log_test "Job Details" "FAIL" "$response"
        fi
    else
        log_test "Job Details" "SKIP" "No jobs available to test"
    fi
}

# Test 6: Application Submission
test_application_submission() {
    log "INFO" "Running: Application Submission Test"

    # Check if we have a token
    if [ -f "${LOG_DIR}/test_token_${TIMESTAMP}.txt" ]; then
        TOKEN=$(cat "${LOG_DIR}/test_token_${TIMESTAMP}.txt")

        # Get a job ID
        job_response=$(curl -s "$API_BASE_URL/jobs/search?limit=1" 2>&1)
        job_id=$(echo "$job_response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

        if [ -n "$job_id" ] && [ -n "$TOKEN" ]; then
            response=$(curl -s -X POST "$API_BASE_URL/applications/$job_id" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN" \
                -d '{
                    "coverLetter": "This is a test application"
                }' 2>&1)

            if echo "$response" | grep -q "success\|application"; then
                log_test "Application Submission" "PASS"
            else
                log_test "Application Submission" "FAIL" "$response"
            fi
        else
            log_test "Application Submission" "SKIP" "Missing job ID or auth token"
        fi
    else
        log_test "Application Submission" "SKIP" "No auth token available"
    fi
}

# Test 7: Notification System
test_notifications() {
    log "INFO" "Running: Notification System Test"

    if [ -f "${LOG_DIR}/test_token_${TIMESTAMP}.txt" ]; then
        TOKEN=$(cat "${LOG_DIR}/test_token_${TIMESTAMP}.txt")
        response=$(curl -s "$API_BASE_URL/notifications" \
            -H "Authorization: Bearer $TOKEN" 2>&1)

        if echo "$response" | grep -q "notifications\|\[\]"; then
            log_test "Notification System" "PASS"
        else
            log_test "Notification System" "FAIL" "$response"
        fi
    else
        log_test "Notification System" "SKIP" "No auth token available"
    fi
}

# Test 8: Review System
test_review_system() {
    log "INFO" "Running: Review System Test"
    response=$(curl -s "$API_BASE_URL/reviews?entityType=Teacher&limit=5" 2>&1)

    if echo "$response" | grep -q "reviews\|\[\]"; then
        log_test "Review System" "PASS"
    else
        log_test "Review System" "FAIL" "$response"
    fi
}

# Main execution
main() {
    echo ""
    log "INFO" "Starting comprehensive feature tests..."
    echo ""

    # Check server first
    if ! check_server; then
        log "ERROR" "Server is not running. Please start the server and try again."
        echo "========================================" >> "$LOG_FILE"
        echo "Test suite aborted - Server not running" >> "$LOG_FILE"
        echo "========================================" >> "$LOG_FILE"
        exit 1
    fi

    echo ""

    # Run all tests
    test_server_health
    test_user_registration
    test_user_login
    test_job_search
    test_job_details
    test_application_submission
    test_notifications
    test_review_system

    # Generate summary
    echo "" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "TEST SUMMARY" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "Total Tests: $((PASSED + FAILED + SKIPPED))" | tee -a "$LOG_FILE"
    echo -e "${GREEN}Passed: $PASSED${NC}" | tee -a "$LOG_FILE"
    echo -e "${RED}Failed: $FAILED${NC}" | tee -a "$LOG_FILE"
    echo -e "${YELLOW}Skipped: $SKIPPED${NC}" | tee -a "$LOG_FILE"
    echo "Test Completed: $(date)" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "Full log saved to: $LOG_FILE" | tee -a "$SUMMARY_FILE"
    echo "Summary saved to: $SUMMARY_FILE" | tee -a "$SUMMARY_FILE"

    # Save summary
    echo "TEST SUMMARY - $(date)" > "$SUMMARY_FILE"
    echo "Total: $((PASSED + FAILED + SKIPPED))" >> "$SUMMARY_FILE"
    echo "Passed: $PASSED" >> "$SUMMARY_FILE"
    echo "Failed: $FAILED" >> "$SUMMARY_FILE"
    echo "Skipped: $SKIPPED" >> "$SUMMARY_FILE"

    # Exit with appropriate code
    if [ $FAILED -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function
main
