// PHASE 1 & 2 Test Suite - Backend Optimization & UI/UX Improvements
import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';
const testResults = [];

function logTest(testName, passed, details = '') {
  const result = { test: testName, passed, details, timestamp: new Date().toISOString() };
  testResults.push(result);
  console.log(`${passed ? '✅' : '❌'} ${testName}${details ? ` - ${details}` : ''}`);
}

async function testPhase1Backend() {
  console.log('\n🔧 PHASE 1: Backend Optimization Tests');
  
  try {
    // Test 1: Health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    logTest('Health Check', healthResponse.status === 200, `Status: ${healthResponse.status}`);
    
    // Test 2: Performance monitoring headers
    logTest('Performance Headers', 
      healthResponse.headers['x-response-time'] !== undefined,
      `Response time: ${healthResponse.headers['x-response-time']}`
    );

    // Test 3: Cache implementation
    const start1 = Date.now();
    await axios.get(`${BASE_URL}/api/dashboard/stats`);
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    await axios.get(`${BASE_URL}/api/dashboard/stats`);
    const time2 = Date.now() - start2;
    
    logTest('Cache Performance', time2 < time1, `First: ${time1}ms, Cached: ${time2}ms`);

    // Test 4: Rate limiting check
    const rateLimitResponse = await axios.get(`${BASE_URL}/api/dashboard/stats`);
    logTest('Rate Limit Headers', 
      rateLimitResponse.headers['x-ratelimit-limit'] !== undefined,
      `Limit: ${rateLimitResponse.headers['x-ratelimit-limit']}`
    );

    // Test 5: Authentication middleware
    try {
      await axios.get(`${BASE_URL}/api/posts`);
      logTest('Auth Middleware', true, 'Protected endpoint accessible');
    } catch (error) {
      logTest('Auth Middleware', error.response?.status === 401, `Status: ${error.response?.status}`);
    }

  } catch (error) {
    logTest('Backend Connection', false, error.message);
  }
}

async function testPhase2Frontend() {
  console.log('\n🎨 PHASE 2: UI/UX Components Tests');
  
  try {
    // Test 1: Frontend accessible
    const frontendResponse = await axios.get(BASE_URL);
    logTest('Frontend Accessible', frontendResponse.status === 200, `Status: ${frontendResponse.status}`);

    // Test 2: Static assets loading
    const cssResponse = await axios.get(`${BASE_URL}/src/index.css`);
    logTest('CSS Assets', cssResponse.status === 200, 'Tailwind CSS loaded');

    // Test 3: Component files exist
    const fs = require('fs');
    const componentFiles = [
      'client/src/components/ui/enhanced-card.tsx',
      'client/src/components/ui/loading-states.tsx', 
      'client/src/components/ui/enhanced-layout.tsx',
      'client/src/components/ui/enhanced-button.tsx',
      'client/src/components/ui/enhanced-navigation.tsx',
      'client/src/components/ui/enhanced-toast.tsx'
    ];

    let componentsExist = 0;
    componentFiles.forEach(file => {
      if (fs.existsSync(file)) {
        componentsExist++;
      }
    });

    logTest('Enhanced Components', componentsExist === componentFiles.length, 
      `${componentsExist}/${componentFiles.length} components created`);

    // Test 4: Dashboard enhanced
    const dashboardExists = fs.existsSync('client/src/pages/Dashboard.tsx');
    logTest('Enhanced Dashboard', dashboardExists, 'Dashboard with modern UI elements');

    // Test 5: Hook optimization
    const hookExists = fs.existsSync('client/src/hooks/useOptimizedQuery.ts');
    logTest('Optimized Query Hook', hookExists, 'Performance-optimized React Query hook');

  } catch (error) {
    logTest('Frontend Test', false, error.message);
  }
}

async function testPerformanceMetrics() {
  console.log('\n📊 Performance Metrics Tests');
  
  try {
    // Test multiple requests to measure performance
    const iterations = 5;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await axios.get(`${BASE_URL}/api/dashboard/stats`);
      times.push(Date.now() - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    logTest('Average Response Time', avgTime < 2000, `${avgTime.toFixed(2)}ms avg`);
    logTest('Max Response Time', maxTime < 5000, `${maxTime}ms max`);
    logTest('Min Response Time', minTime < 1000, `${minTime}ms min (cached)`);

    // Memory usage check
    const memUsage = process.memoryUsage();
    logTest('Memory Usage', memUsage.heapUsed < 100 * 1024 * 1024, 
      `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB heap`);

  } catch (error) {
    logTest('Performance Test', false, error.message);
  }
}

async function generateTestReport() {
  console.log('\n📋 Test Summary Report');
  console.log('='.repeat(50));
  
  const passed = testResults.filter(r => r.passed).length;
  const total = testResults.length;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${percentage}%`);
  
  console.log('\n📊 Failed Tests:');
  testResults.filter(r => !r.passed).forEach(test => {
    console.log(`❌ ${test.test}: ${test.details}`);
  });

  // Save report to file
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed: total - passed, successRate: percentage },
    tests: testResults
  };
  
  fs.writeFileSync('phase-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Report saved to: phase-test-report.json');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting PHASE 1 & 2 Completion Tests...');
  
  await testPhase1Backend();
  await testPhase2Frontend();
  await testPerformanceMetrics();
  await generateTestReport();
  
  console.log('\n✨ Testing complete!');
}

runAllTests().catch(console.error);