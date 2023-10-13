import { ElementHandle } from "@playwright/test";

export const storyUrl = (id: string) =>
  `http://localhost:6006/iframe.html?id=${id}&viewMode=story`;

export const scrollableSelector = '*[style*="overflow"]';

export const approxymate = (v: number): number => Math.round(v / 100) * 100;

export const clearInput = (input: ElementHandle<HTMLInputElement>) =>
  input.evaluate((element) => (element.value = ""));

export const getFirstItem = (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  return scrollable.evaluate((s) => {
    const rect = s.getBoundingClientRect();
    const el = document.elementFromPoint(rect.left + 2, rect.top + 2)!;
    const elRect = el.getBoundingClientRect();
    return {
      text: el.textContent!,
      top: elRect.top - rect.top,
      left: elRect.left - rect.left,
    };
  });
};

export const getLastItem = (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  return scrollable.evaluate((s) => {
    const rect = s.getBoundingClientRect();
    const el = document.elementFromPoint(rect.left + 2, rect.bottom - 2)!;
    return {
      text: el.textContent!,
      bottom: el.getBoundingClientRect().bottom - rect.bottom,
    };
  });
};

// export const getFirstItemRtl = (
//   scrollable: ElementHandle<HTMLElement | SVGElement>
// ) => {
//   return scrollable.evaluate((s) => {
//     const rect = s.getBoundingClientRect();
//     const el = document.elementFromPoint(rect.right - 2, rect.top + 2)!;
//     return {
//       text: el.textContent!,
//       top: el.getBoundingClientRect().top - rect.top,
//       right: el.getBoundingClientRect().right - rect.right,
//     };
//   });
// };

export const getScrollTop = (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  return scrollable.evaluate((e) => e.scrollTop);
};

export const getScrollBottom = (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  return scrollable.evaluate((e) => e.scrollHeight - e.scrollTop);
};

export const getScrollLeft = (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  return scrollable.evaluate((e) => e.scrollLeft);
};

export const getScrollRight = (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  return scrollable.evaluate((e) => e.scrollWidth - e.scrollLeft);
};

export const scrollBy = (
  scrollable: ElementHandle<HTMLElement | SVGElement>,
  offset: number
) => {
  return scrollable.evaluate((e, offset) => {
    e.scrollTop += offset;
  }, offset);
};

export const scrollToBottom = (
  scrollable: ElementHandle<HTMLElement | SVGElement>
): Promise<void> => {
  return scrollable.evaluate((e) => {
    return new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      const onScroll = () => {
        e.scrollTop = e.scrollHeight;

        if (timer !== null) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          if (e.scrollTop + (e as HTMLElement).offsetHeight >= e.scrollHeight) {
            e.removeEventListener("scroll", onScroll);
            resolve();
          } else {
            onScroll();
          }
        }, 50);
      };
      e.addEventListener("scroll", onScroll);

      onScroll();
    });
  });
};

export const scrollToRight = async (
  scrollable: ElementHandle<HTMLElement | SVGElement>
): Promise<void> => {
  return scrollable.evaluate((e) => {
    return new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      const onScroll = () => {
        e.scrollLeft = e.scrollWidth;

        if (timer !== null) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          if (e.scrollLeft + (e as HTMLElement).offsetWidth >= e.scrollWidth) {
            e.removeEventListener("scroll", onScroll);
            resolve();
          } else {
            onScroll();
          }
        }, 50);
      };
      e.addEventListener("scroll", onScroll);

      onScroll();
    });
  });
};

// export const scrollToLeft = async (
//   scrollable: ElementHandle<HTMLElement | SVGElement>
// ) => {
//   await scrollable.evaluate((e) => {
//     e.scrollLeft = -e.scrollWidth;
//   });
//   await scrollable.waitForElementState("stable");
//   // FIXME: scroll twice to reach definitely
//   await scrollable.evaluate((e) => {
//     e.scrollLeft = -e.scrollWidth;
//   });
//   await scrollable.waitForElementState("stable");
// };

export const windowScrollToBottom = async (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  await scrollable.evaluate((e) => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await scrollable.waitForElementState("stable");
  // FIXME: scroll twice to reach definitely
  await scrollable.evaluate((e) => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await scrollable.waitForElementState("stable");
};

export const windowScrollToRight = async (
  scrollable: ElementHandle<HTMLElement | SVGElement>
) => {
  await scrollable.evaluate((e) => {
    window.scrollTo(document.body.scrollWidth, 0);
  });
  await scrollable.waitForElementState("stable");
  // FIXME: scroll twice to reach definitely
  await scrollable.evaluate((e) => {
    window.scrollTo(document.body.scrollWidth, 0);
  });
  await scrollable.waitForElementState("stable");
};

export const scrollWithTouch = (
  scrollable: ElementHandle<HTMLElement | SVGElement>,
  target: { fromX: number; toX: number; fromY: number; toY: number }
) => {
  return scrollable.evaluate(
    async (e, [fromX, toX, fromY, toY]) => {
      e.addEventListener(
        "touchstart",
        () => {
          e.dispatchEvent(
            new TouchEvent(
              "touchmove"
              //  {
              //   bubbles: true,
              //   cancelable: true,
              //   composed: true,
              //   touches: [
              //     new Touch({
              //       identifier: 1,
              //       target: e,
              //       clientX: fromX,
              //       clientY: fromY,
              //     }),
              //   ],
              // }
            )
          );
          e.scrollTop += fromY - toY;
          e.scrollLeft += fromX - toX;
        },
        { once: true, passive: true }
      );

      e.addEventListener(
        "scroll",
        () => {
          e.dispatchEvent(
            new TouchEvent(
              "touchend"
              //  {
              //   bubbles: true,
              //   cancelable: true,
              //   composed: true,
              //   touches: [],
              // }
            )
          );
        },
        { once: true, passive: true }
      );

      let resolve: () => void;
      const touchEnded = new Promise<void>((r) => (resolve = r));
      e.addEventListener(
        "touchend",
        () => {
          resolve();
        },
        { once: true, passive: true }
      );

      e.dispatchEvent(
        new TouchEvent(
          "touchstart"
          // {
          //   bubbles: true,
          //   cancelable: true,
          //   composed: true,
          //   touches: [
          //     new Touch({
          //       identifier: 1,
          //       target: e,
          //       clientX: fromX,
          //       clientY: fromY,
          //     }),
          //   ],
          // }
        )
      );

      await touchEnded;
    },
    [target.fromX, target.toX, target.fromY, target.toY]
  );
};
