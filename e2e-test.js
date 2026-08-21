const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(30000);

  try {
    console.log("1. Navigating to Home...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log("2. Looking for 'Start New Project' button...");
    const startBtnSelector = 'a[href="/new"]';
    await page.waitForSelector(startBtnSelector);
    
    console.log("3. Clicking 'Start New Project'...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click(startBtnSelector)
    ]);

    console.log("4. On /new page. Filling form...");
    const nameInput = await page.waitForSelector('input[placeholder="Name your project..."]');
    await nameInput.type("E2E Test Project");

    const operatorInput = await page.$('input[placeholder="Operator Designation (Name)"]');
    await operatorInput.type("Test Operator");

    const descInput = await page.$('textarea');
    await descInput.type("This is an end-to-end test project to verify all core functionalities of the Hackathon Coach application.");

    console.log("5. Submitting form...");
    // Find the button with text GENERATE MISSION ROADMAP
    const submitBtnHandle = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('GENERATE MISSION ROADMAP'));
    });
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
      submitBtnHandle.click()
    ]);

    console.log("6. On Project page. Wait for chat initialization...");
    // Check for MISSION STATE text
    await page.waitForFunction(() => document.body.innerText.includes('MISSION STATE'));
    
    console.log("7. Testing Chat Panel...");
    const chatInput = await page.waitForSelector('input[placeholder="Enter command or query..."]');
    await chatInput.type("Test message to coach");
    await chatInput.press('Enter');

    console.log("8. Waiting for AI response...");
    await page.waitForFunction(() => {
      const el = document.querySelector('input[placeholder="Enter command or query..."]');
      return el && !el.disabled;
    }, { timeout: 30000 });

    console.log("9. Toggling a milestone...");
    const milestoneSummary = await page.evaluateHandle(() => {
      return document.querySelector('summary');
    });
    if (milestoneSummary) {
      await milestoneSummary.click();
      await new Promise(r => setTimeout(r, 500));
      const checkbox = await page.evaluateHandle((summary) => summary.querySelector('button'), milestoneSummary);
      if (checkbox) await checkbox.click();
    }

    console.log("10. Testing time simulation...");
    const simTimeBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simulate Time'));
    });
    if (simTimeBtn) {
      await simTimeBtn.click();
    }

    console.log("11. Marking mission complete...");
    const completeBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MARK_MISSION_COMPLETE'));
    });
    if (completeBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        completeBtn.click()
      ]);
    }

    console.log("12. Back on Home page. Verifying completion...");
    await page.waitForFunction(() => document.body.innerText.includes('Active Missions'));
    console.log("SUCCESS! All core user flows verified.");

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
