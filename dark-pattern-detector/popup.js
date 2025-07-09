document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) {
      updateOutput("❌ No active tab found.", "error");
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          let text = "";
          const tags = ["p", "span", "a", "button", "h1", "h2", "h3", "h4", "li"];
          tags.forEach(tag => {
            document.querySelectorAll(tag).forEach(el => {
              if (el.offsetWidth > 0 && el.offsetHeight > 0 && el.innerText.trim()) {
                text += el.innerText.trim() + "\n";
              }
            });
          });
          return text;
        }
      },
      (injectionResults) => {
        if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
          updateOutput("⚠️ Failed to extract text from this page.", "error");
          return;
        }

        const pageText = injectionResults[0].result;
        updateOutput("🔍 Analyzing page content with AI...", "loading");

        fetch("http://127.0.0.1:5000/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: pageText })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            updateOutput(`⚠️ Server error: ${data.error}`, "error");
          } else {
            const aiVerdict = data.is_dark_pattern ? "⚠️ Dark Pattern Detected" : "✅ No Dark Pattern";
            const confidence = (data.ml_confidence * 100).toFixed(2);
            const heuristics = data.heuristics.join("\n");

            const resultMsg = `
🤖 AI Verdict: ${aiVerdict}
🔢 Confidence: ${confidence}%

📋 Heuristic Analysis:
${heuristics}
            `.trim();

            updateOutput(resultMsg, data.is_dark_pattern ? "error" : "success");
          }
        })
        .catch(err => {
          console.error("Fetch failed:", err);
          updateOutput("❌ Failed to connect to the AI server. Is it running on port 5000?", "error");
        });
      }
    );
  });
});

function updateOutput(message, status) {
  const output = document.getElementById("output");
  output.textContent = message;
  output.className = status; // Uses .loading, .error, .success styles
}
