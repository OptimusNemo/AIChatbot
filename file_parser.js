let testData = [];

function parseFile(event, type) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;

    if (type === 'csv') {
      parseCSV(content);
    }
  };

  reader.readAsText(file);
}

function parseCSV(csvData) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  testData = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] ? values[i].trim() : '';
      return obj;
    }, {});
  });

  updateTestSummary(testData, headers);
}

function updateTestSummary(data, headers) {
  let pass = 0, fail = 0, flaky = 0, other = 0;

  const statusKey = headers.find(h => h.toLowerCase().includes("status")) || "";

  data.forEach(test => {
    const status = test[statusKey]?.toLowerCase() || "";

    if (status === "pass") pass++;
    else if (status === "fail") fail++;
    else if (status === "flaky") flaky++;
    else other++;
  });

  document.getElementById("totalCount").textContent = pass + fail + flaky + other;
  document.getElementById("passedCount").textContent = pass;
  document.getElementById("failedCount").textContent = fail;
  document.getElementById("flakyCount").textContent = flaky;
  document.getElementById("otherCount").textContent = other;

  // Show chart section
  document.getElementById("chartSection").style.display = "flex";

  // Update the chart if the function exists
  if (typeof updateSummaryChart === "function") {
    updateSummaryChart(pass, fail, flaky, other);
  }
}