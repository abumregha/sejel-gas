// Test shift correction flow: create → submit → reopen → fix → re-submit → re-close → verify reconciliation

const BASE_URL = 'http://localhost:8000';
const ADMIN_USER = {
	email: 'admin@sejel.local',
	password: 'admin',
	role: 'System Manager'
};

const SUPERVISOR_USER = {
	email: 'supervisor@sejel.local',
	password: 'password',
	role: 'Supervisor'
};

async function loginUser(page, user) {
	await page.goto(`${BASE_URL}/app/login`);
	await page.fill('input[name="email"]', user.email);
	await page.fill('input[name="password"]', user.password);
	await page.click('button[type="submit"]');
	await page.waitForLoadState('networkidle');
}

async function createShift(page, shiftData) {
	await page.goto(`${BASE_URL}/app/shifts/new`);
	await page.selectOption('select[name="station"]', shiftData.station);
	await page.fill('input[name="shift_name"]', shiftData.shift_name);
	await page.selectOption('select[name="employee"]', shiftData.employee);
	await page.fill('input[name="date"]', shiftData.date);
	await page.fill('input[name="start_time"]', shiftData.start_time);
	await page.fill('input[name="end_time"]', shiftData.end_time);
	await page.click('button:has-text("إضافة")');
	await page.waitForLoadState('networkidle');
	return page.url().match(/\/app\/shifts\/([^\/]+)/)[1];
}

async function submitShift(page, shiftName) {
	await page.goto(`${BASE_URL}/app/shifts/${shiftName}`);
	await page.click('button:has-text("إنهاء وتقديم")');
	await page.waitForLoadState('networkidle');
}

async function reopenShift(page, shiftName) {
	await page.goto(`${BASE_URL}/app/shifts/${shiftName}`);
	await page.click('button:has-text("↺ إعادة فتح للتصحيح")');
	await page.click('button:has-text("تأكيد")');
	await page.waitForLoadState('networkidle');
}

async function editShiftField(page, shiftName, field, value) {
	await page.goto(`${BASE_URL}/app/shifts/${shiftName}`);
	await page.fill(`input[name="${field}"]`, value);
	await page.click('button:has-text("حفظ")');
	await page.waitForLoadState('networkidle');
}

async function closeShift(page, shiftName) {
	await page.goto(`${BASE_URL}/app/shifts/${shiftName}`);
	await page.click('button:has-text("إقفال المناوبة وإنشاء التسوية")');
	await page.click('button:has-text("تأكيد")');
	await page.waitForLoadState('networkidle');
}

async function getShiftStatus(page, shiftName) {
	await page.goto(`${BASE_URL}/app/shifts/${shiftName}`);
	const statusBadge = await page.locator('.badge').first();
	const status = await statusBadge.textContent();
	return status;
}

async function getCorrectionLog(page, shiftName) {
	await page.goto(`${BASE_URL}/app/shifts/${shiftName}`);
	const logs = [];
	const rows = await page.locator('table.data-table tbody tr').all();
	for (const row of rows) {
		const cells = await row.locator('td').all();
		const log = {
			user: await cells[0].textContent(),
			date: await cells[1].textContent(),
			field: await cells[2].textContent(),
			oldValue: await cells[3].textContent(),
			newValue: await cells[4].textContent(),
			reason: await cells[5].textContent()
		};
		logs.push(log);
	}
	return logs;
}

// Test
const test = async (testName, testFn) => {
	const { chromium } = require('playwright');
	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	try {
		await testFn(page);
		console.log(`✅ ${testName}`);
	} catch (error) {
		console.error(`❌ ${testName}:`, error.message);
		throw error;
	} finally {
		await browser.close();
	}
};

// Run the test
(async () => {
	const shiftName = `SHIFT-CORRECTION-${Date.now()}`;
	const station = 'الرياض-1';
	const employee = 'موظف1';

	await test('Create shift with wrong time (7 PM instead of AM)', async (page) => {
		await loginUser(page, ADMIN_USER);
		await createShift(page, {
			shift_name: shiftName,
			station: station,
			employee: employee,
			date: new Date().toISOString().split('T')[0],
			start_time: '19:00', // Wrong time
			end_time: '03:00'
		});
	});

	await test('Submit shift', async (page) => {
		await submitShift(page, shiftName);
		const status = await getShiftStatus(page, shiftName);
		if (!status.includes('submitted')) {
			throw new Error('Shift status should be submitted');
		}
	});

	await test('Admin reopens shift', async (page) => {
		await loginUser(page, ADMIN_USER);
		await reopenShift(page, shiftName);
		const status = await getShiftStatus(page, shiftName);
		if (!status.includes('open')) {
			throw new Error('Shift status should be open after reopen');
		}
	});

	await test('Fix the time to AM', async (page) => {
		await loginUser(page, ADMIN_USER);
		await editShiftField(page, shiftName, 'start_time', '07:00'); // Correct time
	});

	await test('Re-submit shift', async (page) => {
		await submitShift(page, shiftName);
		const status = await getShiftStatus(page, shiftName);
		if (!status.includes('submitted')) {
			throw new Error('Shift status should be submitted again');
		}
	});

	await test('Close shift', async (page) => {
		await loginUser(page, ADMIN_USER);
		await closeShift(page, shiftName);
		const status = await getShiftStatus(page, shiftName);
		if (!status.includes('closed')) {
			throw new Error('Shift status should be closed');
		}
	});

	await test('Verify correction log entries exist', async (page) => {
		await loginUser(page, ADMIN_USER);
		const logs = await getCorrectionLog(page, shiftName);
		if (logs.length < 2) {
			throw new Error(`Expected at least 2 correction log entries, got ${logs.length}`);
		}
		const reopenLog = logs.find(l => l.reason && l.reason.includes('إعادة فتح'));
		if (!reopenLog) {
			throw new Error('Reopen correction log not found');
		}
		const statusChangeLog = logs.find(l => l.field === 'status' && l.newValue === 'closed');
		if (!statusChangeLog) {
			throw new Error('Status change to closed not found in correction log');
		}
		console.log('Correction logs found:', logs.map(l => `${l.field}: ${l.oldValue} → ${l.newValue}`));
	});

	console.log('\n✅ All shift correction tests passed!');
})();
