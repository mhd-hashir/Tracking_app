
const API_BASE = 'https://tracking-app-hazel.vercel.app/api/mobile';

async function testEmployeeParity() {
    console.log('--- Testing Employee Parity API ---');

    // 1. Login
    const EMP = {
        email: 'test_mobile@example.com',
        password: 'password123'
    };
    let token = '';

    try {
        const res = await fetch(`${API_BASE}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(EMP)
        });
        const data = await res.json();
        if (data.token) {
            token = data.token;
            console.log('✅ Login OK');
        } else {
            console.error('❌ Login Failed', data);
            return;
        }
    } catch (e) { console.error('Login Error', e); return; }

    // 2. Fetch Routes
    try {
        const res = await fetch(`${API_BASE}/employee/routes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            console.log(`✅ Routes Fetched: ${data.routes?.length || 0} routes`);
        } else {
            console.error('❌ Routes Fetch Failed', data);
        }
    } catch (e) { console.error('Routes Error', e); }

    // 3. Fetch Shops
    let shopId = '';
    try {
        const res = await fetch(`${API_BASE}/employee/shops`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.shops?.length > 0) {
            console.log(`✅ Shops Fetched: ${data.shops.length} shops`);
            shopId = data.shops[0].id; // Pick first for collection test
        } else {
            console.log('⚠️ No shops found (or error)', data);
        }
    } catch (e) { console.error('Shops Error', e); }

    // 4. Submit Collection (if shop exists)
    if (shopId) {
        try {
            const res = await fetch(`${API_BASE}/employee/collection`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shopId,
                    amount: 100,
                    paymentMode: 'CASH',
                    remarks: 'Parity Test',
                    latitude: 12.9716,
                    longitude: 77.5946
                })
            });
            const data = await res.json();
            if (res.ok) {
                console.log('✅ Collection Submitted', data.collection?.id);
            } else {
                console.error('❌ Collection Failed', data);
            }
        } catch (e) { console.error('Collection Error', e); }
    }
}

testEmployeeParity();
