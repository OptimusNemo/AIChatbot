

function simulateUpload(buttonId, inputId) {
  const btn = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  const textSpan = btn.querySelector('.upload-cta__text');
  const wrapper = btn.closest('.upload-cta-wrap');

  input.addEventListener('change', () => {
    if (input.files.length === 0) return;

    // Start uploading
    wrapper.classList.remove('is-done'); // reset if previously done
    wrapper.classList.add('is-uploading');
    btn.classList.add('is-uploading');
    textSpan.textContent = 'Uploading...';

    // Simulate 2-second upload
    setTimeout(() => {
      wrapper.classList.remove('is-uploading');
      wrapper.classList.add('is-done');
      btn.classList.remove('is-uploading');
      btn.classList.add('is-done');
      textSpan.textContent = 'Uploaded';
    }, 2000);
  });
}


// Initialize all upload buttons
simulateUpload('csvUploadBtn', 'csvFileInput');
simulateUpload('chatCsvUploadBtn', 'chatCsvFileInput');
