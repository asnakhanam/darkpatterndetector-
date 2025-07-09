// Extracts visible text content from page and sends it to background.js
function extractVisibleText() {
  let text = "";
  const tagsToScan = ["p", "span", "a", "button", "h1", "h2", "h3", "h4", "li"];

  tagsToScan.forEach((tag) => {
    document.querySelectorAll(tag).forEach((el) => {
      const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0;
      const content = el.innerText.trim();

      if (isVisible && content.length > 0) {
        text += content + "\n";
      }
    });
  });

  return text;
}

// Send to background for heuristic analysis
const extractedText = extractVisibleText();

chrome.runtime.sendMessage(
  {
    type: "PAGE_TEXT",
    data: extractedText
  },
  (response) => {
    if (chrome.runtime.lastError) {
      console.warn("⚠️ Could not send message to background:", chrome.runtime.lastError.message);
    } else {
      console.log("📤 Text sent to background successfully");
    }
  }
);
