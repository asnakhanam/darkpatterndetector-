chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Dark Pattern Detector Extension Installed");
});

chrome.action.onClicked.addListener((tab) => {
  console.log("🔔 Extension icon clicked on:", tab.url);
});

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PAGE_TEXT") {
    console.log("📩 Received page text from content script");

    const pageText = message.data;
    const result = runHeuristicAnalysis(pageText);

    // Store for access in popup or other components
    chrome.storage.local.set({ heuristicAnalysis: result }, () => {
      console.log("✅ Heuristic result stored");
    });

    sendResponse({ status: "done" });
  }
});

// Simple rule-based logic (can be improved later)
function runHeuristicAnalysis(text) {
  const lowered = text.toLowerCase();
  let findings = [];

  if (lowered.includes("only") && lowered.includes("left")) {
    findings.push("⏱️ Fake urgency: 'Only X left'");
  }
  if (lowered.includes("subscribe now")) {
    findings.push("🔔 Pushy language: 'Subscribe now'");
  }
  if (lowered.includes("don’t miss out") || lowered.includes("don't miss out")) {
    findings.push("⚠️ FOMO tactic: 'Don’t miss out'");
  }
  if (lowered.includes("you’ll regret") || lowered.includes("you will regret")) {
    findings.push("😢 Emotional manipulation: 'You'll regret...'");
  }
  if (lowered.includes("click before it’s too late")) {
    findings.push("🚨 Urgency pressure: 'Click before it’s too late'");
  }
  if (lowered.includes("unsubscribe") && !lowered.includes("click here")) {
    findings.push("🕵️ Hidden unsubscribe or poor visibility");
  }

  return findings.length > 0
    ? findings.join("\n")
    : "✅ No manipulative patterns detected by heuristics.";
}
