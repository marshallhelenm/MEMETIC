const devLog = (messages) => {
  if (process.env.NODE_ENV === "development") {
    let printable = "";
    if (typeof messages === "string") {
      messages = [messages];
    }
    messages.forEach((message) => {
      if (typeof message === "object") {
        printable += JSON.stringify(message, null, 2) + " ";
      } else {
        printable += message + " ";
      }
    });
    console.log(printable);
  }
};

const waitUntil = (condition, ping) => {
  var start = Date.now();
  var pingCount = 0;
  return new Promise(waitForConditional);

  function waitForConditional(resolve, reject) {
    if (condition) {
      // devLog("condition met");
      resolve(true);
    } else if (Date.now() - start >= 5000) {
      // timeout after 5 seconds
      // devLog("timeout exceeded, rejecting promise");
      reject(new Error("timeout"));
    } else if (ping && pingCount < 10) {
      ping();
      pingCount++;
      // devLog(["pinging", "count:", pingCount]);
    } else {
      // devLog(["waiting for condition to be met", condition]);
      setTimeout(waitForConditional.bind(this, resolve, reject), 30);
    }
  }
};

function randomCardKey(keys) {
  if (!keys) return;
  let min = Math.ceil(0);
  let max = Math.floor(23);
  let index = Math.floor(Math.random() * (max - min + 1)) + min;
  return keys[index];
}

export { devLog, waitUntil, randomCardKey };
