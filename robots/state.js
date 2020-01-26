const fs = require('fs');

const videoContentFilePath = './video-content.json';

function saveVideoContent(videoContent) {
  const videoContentString = JSON.stringify(videoContent);
  return fs.writeFileSync(videoContentFilePath, videoContentString);
}

function loadVideoContent() {
  const fileBuffer = fs.readFileSync(videoContentFilePath, 'utf-8');
  return JSON.parse(fileBuffer);
}

module.exports = {
  saveVideoContent,
  loadVideoContent
}