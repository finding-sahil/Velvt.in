// Route verification script
const routes = [
  '/',
  '/events',
  '/events/velvt-curse-2-o',
  '/tickets',
  '/volunteers',
  '/volunteers/register',
  '/verify',
  '/gallery',
  '/press',
  '/team',
  '/about',
  '/contact',
  '/admin/login',
  '/api/public/events',
  '/api/public/roles',
  '/non-existent-page-test'
];

async function verify() {
  console.log("Starting route health verification...\n");
  let passed = 0;
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      const text = await res.text();
      const is404Test = route === '/non-existent-page-test';
      const expectedStatus = is404Test ? 404 : 200;

      if (res.status === expectedStatus) {
        console.log(`✓ [HTTP ${res.status}] ${route} - Content Length: ${text.length}`);
        if (is404Test) {
          if (text.includes("Lost in the Shadows") || text.includes("404")) {
            console.log("  ↳ Custom 404 page content detected successfully!");
          }
        }
        passed++;
      } else {
        console.error(`✗ [HTTP ${res.status}] ${route} (Expected: ${expectedStatus})`);
      }
    } catch (err) {
      console.error(`✗ [ERROR] ${route} -> ${err.message}`);
    }
  }
  console.log(`\nVerification completed: ${passed}/${routes.length} routes passed perfectly.`);
}

verify();
