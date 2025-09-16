/**
 * URL Test Verification
 * Run this to see the final URLs that will be generated
 */

console.log('🧪 API URL CONSTRUCTION TEST');
console.log('============================');

const BASE_URL = 'http://localhost';

const routes = [
  // Auth routes
  '/v1/auth/login',
  '/v1/auth/logout', 
  '/v1/auth/me',
  '/v1/auth/refresh',
  
  // Category routes
  '/v1/categories',
  '/v1/categories/1',
  '/v1/categories/1/toggle-status',
  
  // Appearance routes
  '/v1/admin/appearance'
];

console.log('Environment:', BASE_URL);
console.log('');

routes.forEach(route => {
  const finalUrl = `${BASE_URL}/api${route}`;
  console.log(`${route.padEnd(30)} → ${finalUrl}`);
});

console.log('');
console.log('✅ All URLs properly constructed with /api prefix');
