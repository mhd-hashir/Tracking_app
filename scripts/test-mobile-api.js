
// const fetch = require('node-fetch'); // Not needed in Node 18+

const API_BASE = 'https://tracking-app-hazel.vercel.app/api/mobile';
const TEST_USER = {
    email: 'test_mobile@example.com',
    password: 'password123'
};

async function testApi() {
    console.log('--- Testing Mobile API Endpoints ---');

    // 1. Auth Headers
    let token = '';

    // 2. Login
    try {
        console.log(`\n1. Testing Login (${TEST_USER.email})...`);
        const res = await fetch(`${API_BASE}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const data = await res.json();

        if (res.ok && data.token) {
            console.log('✅ Login Successful');
            token = data.token;
            console.log('User ID:', data.user.id);
        } else {
            console.error('❌ Login Failed:', data);
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Connection Error:', e.message);
        process.exit(1);
    }

    // 3. Toggle Duty
    try {
        console.log('\n2. Testing Duty Toggle...');
        const res = await fetch(`${API_BASE}/duty`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                isOnDuty: true,
                latitude: 12.3456,
                longitude: 78.9012
            })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            console.log(`✅ Duty Toggled: ${data.isOnDuty}`);
        } else {
            console.error('❌ Duty Toggle Failed:', data);
        }
    } catch (e) {
        console.error('❌ Duty Error:', e.message);
    }

    // 4. Tracking
    try {
        console.log('\n3. Testing Location Tracking...');
        const res = await fetch(`${API_BASE}/tracking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                latitude: 12.3456,
                longitude: 78.9012,
                timestamp: new Date().toISOString()
            })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            console.log('✅ Tracking Data Saved');
        } else {
            console.error('❌ Tracking Failed:', data);
        }
    } catch (e) {
        console.error('❌ Tracking Error:', e.message);
    }
}

testApi();
