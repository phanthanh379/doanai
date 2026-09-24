import { test } from './fixture';

// Pilot: xác nhận Midscene + model đã cấu hình hoạt động end-to-end trên app
// thực nghiệm (đăng nhập bằng ngôn ngữ tự nhiên). Yêu cầu: .env đã có API key.
// Sau lần chạy thành công đầu tiên: ghim model ID snapshot + token/call vào
// docs/pilot-model-cost.md.
test('pilot: VLM đăng nhập và đọc được bảng sản phẩm', async ({
  page,
  aiInput,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await aiInput('the username field of the sign-in form', { value: 'admin' });
  await aiInput('the password field of the sign-in form', { value: 'admin123' });
  await aiTap('the button that submits the sign-in form');

  await aiAssert('a page titled "Products" with a table of products is visible');
  const rows = await aiNumber('how many product rows does the table contain?');
  console.log(`[pilot] VLM counted ${rows} product rows (expected 12)`);
});
