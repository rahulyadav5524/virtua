import { test, expect } from "@playwright/test";
import {
  storyUrl,
  scrollableSelector,
  getLastItem,
  scrollWithTouch,
  getScrollTop,
} from "./utils";

test.describe("check if scroll jump compensation in iOS WebKit works", () => {
  test("reverse scroll", async ({ page }) => {
    await page.goto(storyUrl("basics-vlist--reverse"));

    const component = await page.waitForSelector(scrollableSelector);
    await component.waitForElementState("stable");

    // check if last is displayed
    const last = await getLastItem(component);
    await expect(last.text).toEqual("999");
    await expect(last.bottom).toBeLessThanOrEqual(1); // FIXME: may not be 0 in Safari

    await component.tap();

    const [w, h] = await page.evaluate(() => [
      window.outerWidth,
      window.outerHeight,
    ]);
    const centerX = w / 2;
    const centerY = h / 2;

    let top: number = await getScrollTop(component);
    for (let i = 0; i < 10; i++) {
      await scrollWithTouch(component, {
        fromX: centerX,
        fromY: centerY - h / 8,
        toX: centerX,
        toY: centerY + h / 8,
      });

      // wait flush
      const [nextTopBeforeFlush /* nextLastItemBeforeFlush */] =
        await Promise.all([
          getScrollTop(component),
          // getLastItem(component),
        ]);
      await page.waitForTimeout(300);
      const [nextTop /* nextLastItem */] = await Promise.all([
        getScrollTop(component),
        // getLastItem(component),
      ]);

      expect(nextTop).toBeLessThan(top);
      expect(nextTop).not.toBe(nextTopBeforeFlush);
      // expect(nextLastItem).toEqual(nextLastItemBeforeFlush);

      top = nextTop;
    }
  });

  // TODO momentum scroll

  // TODO shift/unshift

  // TODO display none
});
