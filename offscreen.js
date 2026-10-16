chrome.runtime.onMessage.addListener((message) => {
  if (message.target !== 'offscreen' || message.type !== 'copy-to-clipboard') return;

  const textarea = document.getElementById('copy-target');
  textarea.value = message.text;
  textarea.select();
  document.execCommand('copy');
});
