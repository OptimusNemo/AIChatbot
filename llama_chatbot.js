


let chatTestCaseCounts = {
  pass: 0,
  fail: 0,
  flaky: 0
};

let chatTestCaseData = [];
let totalDefectsRaised = 0;
let moduleTestCaseMap = {};
let moduleFailedCountMap = {};
let moduleDefectCountMap = {};
 
 
function loadChatCsv(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const statusIndex = headers.indexOf('status');
    const nameIndex = headers.indexOf('name');
    const reasonIndex = headers.indexOf('failure reason');
    const defectIndex = headers.indexOf('defect _raised');
    const moduleIndex = headers.indexOf('module');

    chatTestCaseCounts = { pass: 0, fail: 0, flaky: 0 };
    chatTestCaseData = [];
    totalDefectsRaised = 0;
    moduleTestCaseMap = {};
    moduleFailedCountMap = {};
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const status = row[statusIndex]?.trim().toLowerCase();
      const name = row[nameIndex]?.trim();
      const reason = row[reasonIndex]?.trim();
      const defectRaw = row[defectIndex]?.trim();
      const defectCount = parseInt(defectRaw, 10);
      const module = row[moduleIndex]?.trim();

      if (!isNaN(defectCount)) {
        totalDefectsRaised += defectCount;
      }

      if (module && name) {
        if (!moduleTestCaseMap[module]) {
          moduleTestCaseMap[module] = [];
        }
        moduleTestCaseMap[module].push(name);
      }

      // ✅ Correctly count defects per module
      if (module && !isNaN(defectCount)) {
        moduleDefectCountMap[module] = (moduleDefectCountMap[module] || 0) + defectCount;
      }

      if (module && status === 'fail') {
        moduleFailedCountMap[module] = (moduleFailedCountMap[module] || 0) + 1;
      }

      if (status === 'pass') chatTestCaseCounts.pass++;
      else if (status === 'fail') chatTestCaseCounts.fail++;
      else if (status === 'flaky') chatTestCaseCounts.flaky++;

      chatTestCaseData.push({
        name,
        status,
        reason
      });
    }
  };
  reader.readAsText(file);
}

function renderChatMessage(message, sender) {
  const chatbox = document.getElementById('chatbox');
  const msgDiv = document.createElement('div');
  msgDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
  msgDiv.textContent = message;
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const userInput = inputField.value.trim();
  if (!userInput) return;

  appendMessage("You", userInput);

  const msg = userInput.toLowerCase();

  // ✅ Place this block BEFORE the "total defects" block
if (msg.includes("total defects per module") || msg.includes("module wise defect count")) {
  if (Object.keys(moduleDefectCountMap).length === 0) {
    appendMessage("QApture AI", "Module-wise defect data is not available. Please upload a valid CSV file.");
  } else {
    const defectSummary = Object.entries(moduleDefectCountMap)
      .map(([mod, count]) => `- ${mod}: ${count} defects`)
      .join('\n');
    appendMessage("QApture AI", `Here is the total defect count per module:\n${defectSummary}`);
  }
  inputField.value = '';
  return;
}

  if (msg.includes("total defects") || msg.includes("sum of defects") || msg.includes("How many defects are raised?")) {
    appendMessage("QApture AI", `Total defects raised in the last build: ${totalDefectsRaised}`);
    inputField.value = '';
    return;
  }

if (msg.includes("defect density")|| msg.includes("what is the defect density") || msg.includes("What is the total defect density?") || msg.includes("Calculate defect density for my project.")
   || msg.includes("What is the total defect density?") || msg.includes("How many defects are raised?")){
    const failedCount = chatTestCaseCounts.fail;
    const defectCount = totalDefectsRaised;
 
    if (failedCount === 0) {
      appendMessage("QApture AI", "Defect density cannot be calculated because there are no failed test cases.");
    } else {
      const density = (defectCount / failedCount).toFixed(2);
      appendMessage("QApture AI", `Defect Density for the last build: ${density} (Defects: ${defectCount}, Failed Cases: ${failedCount})`);
    }
 
    inputField.value = '';
    return;
  }

  if (msg.includes("module wise test case count")) {
    if (Object.keys(moduleTestCaseMap).length === 0) {
      appendMessage("QApture AI", "Module-wise test case data is not available. Please upload a valid CSV file.");
    } else {
      const moduleSummary = Object.entries(moduleTestCaseMap)
        .map(([mod, names]) => `- ${mod}: ${names.length} test cases`)
        .join('\n');
      appendMessage("QApture AI", `Here is the module-wise test case count:\n${moduleSummary}`);
    }
    inputField.value = '';
    return;
  }

  if (msg.includes("module wise failed test case count")) {
    if (Object.keys(moduleFailedCountMap).length === 0) {
      appendMessage("QApture AI", "Module-wise failed test case data is not available. Please upload a valid CSV file.");
    } else {
      const failedSummary = Object.entries(moduleFailedCountMap)
        .map(([mod, count]) => `- ${mod}: ${count} failed test cases`)
        .join('\n');
      appendMessage("QApture AI", `Here is the module-wise failed test case count:\n${failedSummary}`);
    }
    inputField.value = '';
    return;
  }  

  // ✅ Check for pass/fail ratio firstF
  if (msg.includes("pass/fail ratio")) {
    const passCount = chatTestCaseData.filter(test => test.status === "pass").length;
    const failCount = chatTestCaseData.filter(test => test.status === "fail" || test.status === "flaky").length;
    const ratio = failCount !== 0 ? (passCount / failCount).toFixed(2) : "Infinity";

    appendMessage("QApture AI", `Pass/Fail Ratio for the last build: ${ratio} (Pass: ${passCount}, Fail: ${failCount})`);
    inputField.value = '';
    return;
  }
  if (msg.includes("what failed in the last regression run") || msg.includes("list all failed test cases from the last build")
    || msg.includes("list all fail") || msg.includes("list all failed") || msg.includes("list all fail test") || msg.includes("list all faileed test cases") || msg.includes("list all fail test cases") || msg.includes("list of fail test cases") || msg.includes("list of failed test cases")) {
    const failedTests = chatTestCaseData.filter(t => t.status === "fail");
    if (failedTests.length > 0) {
      const failedList = failedTests.map(t => `- ${t.name}`).join("\n");
      appendMessage("QApture AI", `Here are the failed test cases:\n${failedList}`);
    } else {
      appendMessage("QApture AI", "No failed test cases found in the last build.");
    }
    inputField.value = '';
    return;
  }

  if (msg.includes("what flaky in the last regression run") || msg.includes("list all flaky test cases from the last build")
    || msg.includes("list all flaky") || msg.includes("list all flaky test") || msg.includes("list all flaky test cases") || msg.includes("list all flaky test case") || msg.includes("list of flaky test case")) {
    const flakyTests = chatTestCaseData.filter(t => t.status === "flaky");
    if (flakyTests.length > 0) {
      const flakyList = flakyTests.map(t => `- ${t.name}`).join("\n");
      appendMessage("QApture AI", `Here are the flaky test cases:\n${flakyList}`);
    } else {
      appendMessage("QApture AI", "No flaky test cases found in the last build.");
    }
    inputField.value = '';
    return;
  }

  if (msg.includes("what passed in the last regression run") || msg.includes("list all passed test cases from the last build")
    || msg.includes("list all pass") || msg.includes("list all passed") || msg.includes("list all pass test") || msg.includes("list all passed test cases") || msg.includes("list all pass test cases") || msg.includes("list of pass test cases") || msg.includes("list of passed test cases")) {
    const passedTests = chatTestCaseData.filter(t => t.status === "pass");
    if (passedTests.length > 0) {
      const passedList = passedTests.map(t => `- ${t.name}`).join("\n");
      appendMessage("QApture AI", `Here are the passed test cases:\n${passedList}`);
    } else {
      appendMessage("QApture AI", "No passed test cases found in the last build.");
    }
    inputField.value = '';
    return;
  }

  if (msg.includes("pass") && !msg.includes("did") && !msg.includes("fail")) {
    appendMessage("QApture AI", `There are ${chatTestCaseCounts.pass} passed test cases.`);
    inputField.value = '';
    return;
  } else if (msg.includes("fail") && !msg.includes("did") && !msg.includes("why") && !msg.includes("reason")) {
    appendMessage("QApture AI", `There are ${chatTestCaseCounts.fail} failed test cases.`);
    inputField.value = '';
    return;
  } else if (msg.includes("flaky")) {
    appendMessage("QApture AI", `There are ${chatTestCaseCounts.flaky} flaky test cases.`);
    inputField.value = '';
    return;
  }

  if (msg.includes("why") || msg.includes("failure reason") || msg.includes("did")) {
    const match = msg.match(/test case\s*(\d+)/i);
    if (match && match[1]) {
      const testNumber = match[1];
      const test = chatTestCaseData.find(t => t.name?.toLowerCase().includes(`test_${testNumber}_`));
      if (test) {
        if (msg.includes("fail")) {
          if (test.status === "fail") {
            if (test.reason) {
              appendMessage("QApture AI", `Yes, it failed due to: ${test.reason}`);
            } else {
              appendMessage("QApture AI", `Yes, it failed but no specific failure reason was documented.`);
            }
          } else if (test.status === "flaky") {
            appendMessage("QApture AI", `No, flaky execution was witnessed for test case ${testNumber}.`);
          } else if (test.status === "pass") {
            appendMessage("QApture AI", `No, the test case got passed successfully.`);
          } else {
            appendMessage("QApture AI", `Status unknown for test case ${testNumber}.`);
          }
        } else if (msg.includes("pass")) {
          if (test.status === "pass") {
            appendMessage("QApture AI", `Yes, the test case "${test.name}" passed successfully.`);
          } else if (test.status === "fail") {
            if (test.reason) {
              appendMessage("QApture AI", `No, it failed due to: ${test.reason}`);
            } else {
              appendMessage("QApture AI", `No, it failed but no specific failure reason was documented.`);
            }
          } else if (test.status === "flaky") {
            appendMessage("QApture AI", `No, flaky execution was witnessed for test case ${testNumber}.`);
          } else {
            appendMessage("QApture AI", `Status unknown for test case ${testNumber}.`);
          }
        } else {
          if (test.reason) {
            appendMessage("QApture AI", `The failure reason for "${test.name}" is: ${test.reason}`);
          } else {
            appendMessage("QApture AI", `No specific failure reason found for "${test.name}". It might have passed or not documented.`);
          }
        }
      } else {
        appendMessage("QApture AI", `I couldn't find a test case matching number ${testNumber}. Please check the number and try again.`);
      }
      inputField.value = '';
      return;
    }
  }

  

  if (msg.includes("pass/fail ratio") && msg.includes("last build")) {
    const passCount = chatTestCaseData.filter(test => test.status === "pass").length;
    const failCount = chatTestCaseData.filter(test => test.status === "fail" || test.status === "flaky").length;
    const ratio = failCount !== 0 ? (passCount / failCount).toFixed(2) : "Infinity";

    appendMessage("QApture AI", `Pass/Fail Ratio for the last build: ${ratio} (Pass: ${passCount}, Fail: ${failCount})`);
    inputField.value = '';
    return;
  }


  if (msg.includes("common failure reasons")) {
    const reasonFrequency = {};

    chatTestCaseData.forEach(test => {
      if ((test.status === "fail" || test.status === "flaky") && test.reason) {
        const reason = test.reason.trim();
        reasonFrequency[reason] = (reasonFrequency[reason] || 0) + 1;
      }
    });


    const sortedReasons = Object.entries(reasonFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `- ${reason} (${count})`);

    const response = sortedReasons.length
      ? `The most common failure reasons are:\n${sortedReasons.join("\n")}`
      : "No failure reasons found in the uploaded data.";

    appendMessage("QApture AI", response);
    inputField.value = '';
    return;
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {      
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are a QA assistant. Analyze test failures and suggest reasons and fixes."
        },
        {
          role: "user",
          content: userInput
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: false
    })
  });

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || "⚠️ No response from LLaMA.";
  appendMessage("QApture AI", reply);
  inputField.value = '';
}

function appendMessage(sender, text) {
  const chatbox = document.getElementById("chatbox");
  const messageDiv = document.createElement("div");
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function clearChat() {
  document.getElementById("chatbox").innerHTML = '';
}
