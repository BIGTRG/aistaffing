import { runTest } from "./auth";

runTest("Feature 1: Test Conversation", async (helper) => {
	const { page } = helper;

	// Navigate to dashboard
	await helper.goto("/dashboard");
	await page.waitForTimeout(3000);

	// Screenshot dashboard with Test buttons
	await helper.screenshot("dashboard-test-buttons.png");

	// Use title attribute for more reliable selection
	const testBtn = page.locator('[title="Test this agent"]').first();
	const isVisible = await testBtn.isVisible();
	console.log("Test button (by title) visible:", isVisible);

	if (isVisible) {
		// Force click with position
		await testBtn.click({ force: true });
		await page.waitForTimeout(2000);

		// Check if dialog opened
		let dialogVisible = await page.locator('[role="dialog"]').isVisible();
		console.log("Dialog visible after click:", dialogVisible);

		if (!dialogVisible) {
			// Try JS click
			console.log("Trying JS click...");
			await testBtn.evaluate((el: HTMLElement) => el.click());
			await page.waitForTimeout(2000);
			dialogVisible = await page.locator('[role="dialog"]').isVisible();
			console.log("Dialog visible after JS click:", dialogVisible);
		}

		if (!dialogVisible) {
			// Try dispatching click event
			console.log("Trying dispatchEvent click...");
			await testBtn.evaluate((el: HTMLElement) => {
				el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			});
			await page.waitForTimeout(2000);
			dialogVisible = await page.locator('[role="dialog"]').isVisible();
			console.log("Dialog visible after dispatchEvent:", dialogVisible);
		}

		if (dialogVisible) {
			await helper.screenshot("test-chat-dialog.png");

			// Type and send a message
			const chatInput = page.locator('input[placeholder="Type a message as a visitor..."]');
			if (await chatInput.isVisible()) {
				await chatInput.fill("Hi, I need a cleaning service quote");
				await chatInput.press("Enter");
				console.log("Message sent, waiting for response...");
				await page.waitForTimeout(10000);
				await helper.screenshot("test-chat-conversation.png");
			}
		} else {
			console.log("Dialog never opened. Taking debug screenshot...");
			await helper.screenshot("test-dialog-debug.png");
			// Dump all visible buttons for debugging
			const buttons = await page.locator('button').allInnerTexts();
			console.log("All buttons:", buttons.join(" | "));
		}
	}

	console.log("Feature 1 test complete!");
}).catch(() => process.exit(1));
