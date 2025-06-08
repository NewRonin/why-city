export const useInputHack = () => {
  // This will only run on client side
  if (process.client) {
    const getHackNum = (): number | null => {
      return null;
    };

    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLElement;
      if (
        ((target && /input|textarea/i.test(target.tagName)) ||
        target.contentEditable === "true") &&
        !target.dataset.hack
      ) {
        target.dataset.hack = "1";
        const getBoundingClientRect = target.getBoundingClientRect.bind(target);
        
        target.getBoundingClientRect = () => {
          const result = getBoundingClientRect();
          if (document.activeElement === target) {
            return {
              ...result,
              top: getHackNum() as number,
            };
          }
          return result;
        };
      }
    };

    onMounted(() => {
      document.addEventListener("focusin", handleFocusIn);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("focusin", handleFocusIn);
    });
  }
};