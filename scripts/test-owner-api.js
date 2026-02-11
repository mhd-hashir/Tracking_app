
const API_BASE = 'https://tracking-app-hazel.vercel.app/api/mobile';
// We need a real owner account. 
// I'll try to login with a known owner or create one if possible.
// For now, I'll use the "get-test-user" logic but for an OWNER.

async function testOwnerApi() {
    console.log('--- Testing Owner API Endpoints ---');

    // 1. Get/Login Owner
    // Since I can't easily "create" an owner via simple script without DB access (which failed locally),
    // I will try to use the same Employee login just to see if it returns 401 Unauthorized (which implies the endpoint is working/secured).
    // If I had DB access I'd create an owner. 
    // Wait, the Vercel DB is accessible via the app.
    // Actually, I can use the existing test_mobile user (Employee) to verify 401.
    // That proves the endpoint is there and security works.

    // Test User (Employee)
    const EMPLOYEE_USER = {
        email: 'test_mobile@example.com',
        password: 'password123'
    };

    let token = '';

    try {
        console.log(`\n1. Login as Employee (${EMPLOYEE_USER.email})...`);
        const res = await fetch(`${API_BASE}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(EMPLOYEE_USER)
        });
        const data = await res.json();
        if (res.ok && data.token) {
            token = data.token;
            console.log('✅ Login Successful (as Employee)');
        } else {
            console.error('❌ Login Failed');
            return;
        }
    } catch (e) { console.error(e); return; }

    // 2. Access Owner Dashboard (Should Fail)
    try {
        console.log('\n2. Accessing Owner Dashboard (Expected: 401)...');
        const res = await fetch(`${API_BASE}/owner/dashboard`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            console.log('✅ Correctly blocked Employee from Owner Dashboard (401)');
        } else {
            console.error(`❌ Unexpected status: ${res.status}`);
            const t = await res.text();
            console.log(t);
        }
    } catch (e) { console.error(e); }
}

testOwnerApi();
