type DevLogMessage = string | object;

const devLog = (messages: DevLogMessage | DevLogMessage[]): void => {
  if (process.env.NODE_ENV === "development") {
    let printable = "";
    if (typeof messages === "string" || typeof messages === "object" && !Array.isArray(messages)) {
      messages = [messages];
    }
    (messages as DevLogMessage[]).forEach((message) => {
      if (typeof message === "object") {
        printable += JSON.stringify(message, null, 2) + " ";
      } else {
        printable += message + " ";
      }
    });
    console.log(printable);
  }
};

const waitUntil = (
  condition: boolean | (() => boolean),
  ping?: () => void
): Promise<boolean> => {
  var start = Date.now();
  var pingCount = 0;
  return new Promise(waitForConditional);

  function waitForConditional(resolve: (value: boolean) => void, reject: (reason?: any) => void) {
    const cond = typeof condition === "function" ? condition() : condition;
    if (cond) {
      resolve(true);
    } else if (Date.now() - start >= 5000) {
      reject(new Error("timeout"));
    } else if (ping && pingCount < 10) {
      ping();
      pingCount++;
    } else {
      setTimeout(waitForConditional.bind(this, resolve, reject), 30);
    }
  }
};

function randomCardKey<T = any>(keys: T[]): T | undefined {
  if (!keys) return;
  let min = Math.ceil(0);
  let max = Math.floor(23);
  let index = Math.floor(Math.random() * (max - min + 1)) + min;
  return keys[index];
}

const calculateDialogWidth = (breakpoint: string): string => {
  switch (breakpoint) {
    case "1":
      return "230px";
    case "2":
      return "300px";
    case "3":
      return "400px";
    case "4":
      return "500px";
    case "5":
      return "700px";
    case "6":
      return "800px";
    default:
      return "400px";
  }
};

export { devLog, waitUntil, randomCardKey, calculateDialogWidth };
