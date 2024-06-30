// background.js
browser.messages.onNewMailReceived.addListener(async (folder, messages) => {
  for (let message of messages.messages) {
    let content = await browser.messages.getFull(message.id);
    let urls = extractUrls(content);

    for (let url of urls) {
      checkUrlWithPhishGuardAPI(url).then(result => {
        if (result.phish) {
          notifyUser(message.subject, url);
        }
      });
    }
  }
});

function extractUrls(content) {
  let urls = [];
  let regex = /https?:\/\/[^\s]+/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[0]);
  }
  return urls;
}

async function checkUrlWithPhishGuardAPI(url) {
  let response = await fetch('http://localhost:3000/check-url', {  // Change this URL to match your server's URL and port
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  let data = await response.json();
  return data;
}

function notifyUser(subject, url) {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.runtime.getURL("icons/icon-48.png"),
    "title": "Phishing Alert",
    "message": `Phishing URL detected in email with subject: ${subject}\nURL: ${url}`
  });
}
