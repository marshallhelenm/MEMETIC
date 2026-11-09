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
  const start = Date.now();
  let pingCount = 0;
  return new Promise(waitForConditional);

  function waitForConditional(resolve: (value: boolean) => void, reject: (reason?: unknown) => void) {
    const cond = typeof condition === "function" ? condition() : condition;
    if (cond) {
      resolve(true);
    } else if (Date.now() - start >= 5000) {
      reject(new Error("timeout"));
    } else if (ping && pingCount < 10) {
      ping();
      pingCount++;
    } else {
      setTimeout(() => waitForConditional(resolve, reject), 30);
    }
  }
};

function randomCardKey<T>(keys: T[]): T | undefined {
  if (!keys) return;
  const min = Math.ceil(0);
  const max = Math.floor(23);
  const index = Math.floor(Math.random() * (max - min + 1)) + min;
  return keys[index];
}

export { devLog, waitUntil, randomCardKey };
