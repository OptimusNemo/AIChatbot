let summaryChartInstance = null;

function updateSummaryChart(pass, fail, flaky, other) {
  document.getElementById('graphSection').style.display = 'flex';

  const canvas = document.getElementById('summaryChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Use solid colors for best hover effect
  const passColor = "#4CAF50";
  const failColor = "#F44336";
  const flakyColor = "#2196F3";
  const otherColor = "#E0E0E0";

  const dataArr = [pass, fail, flaky, other];

  if (summaryChartInstance) {
    summaryChartInstance.data.datasets[0].data = dataArr;
    summaryChartInstance.data.datasets[0].backgroundColor = [
      passColor, failColor, flakyColor, otherColor
    ];
    summaryChartInstance.update();
  } else {
    summaryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Flaky', 'Other'],
        datasets: [{
          data: dataArr,
          backgroundColor: [
            passColor, failColor, flakyColor, otherColor
          ],
          borderWidth: 2,
          hoverOffset: 8, // Reduced for less distortion
          borderColor: "#fff"
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: "#fff",
            titleColor: "#333",
            bodyColor: "#333",
            borderColor: "#333",
            borderWidth: 1,
            padding: 12,
            caretSize: 8,
            displayColors: true,
            animation: { duration: 400 }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }

  // Update legend colors to match
  const legend = document.getElementById('graphLegend');
  legend.innerHTML = `
    <div class="graph-legend-item"><span class="legend-dot" style="background:${passColor}"></span>Passed <strong>${pass}</strong></div>
    <div class="graph-legend-item"><span class="legend-dot" style="background:${failColor}"></span>Failed <strong>${fail}</strong></div>
    <div class="graph-legend-item"><span class="legend-dot" style="background:${flakyColor}"></span>Flaky <strong>${flaky}</strong></div>
    <div class="graph-legend-item"><span class="legend-dot" style="background:${otherColor}"></span>Other <strong>${other}</strong></div>
  `;
}