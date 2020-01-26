const imageDownloader = require('image-downloader');
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const googleCredentials = require('../credentials/google-search.json');
const state = require('./state');

async function robot() {
  const videoContent = state.loadVideoContent();
  await fetchImagesOfAllSentences(videoContent);

  state.saveVideoContent(videoContent);
  await downloadAllImages(videoContent);
  // console.dir(videoContent, { depth: null });
  process.exit(0);
}

async function fetchImagesOfAllSentences(videoContent) {
  for (const sentence of videoContent.sentences) {
    const query = `${videoContent.subject} ${sentence.keywords[0]}`;
    sentence.images = await fetchGoogleAndReturnImageLinks(query);
    sentence.googleSearchQuery = query;
  }
}

async function fetchGoogleAndReturnImageLinks(query) {

  const response = await customSearch.cse.list({
    auth: googleCredentials.api_key,
    cx: googleCredentials.search_engine_id,
    searchType: 'image',
    q: query,
    num: 2
  });

  return response.data.items.map((item) => item.link);;
}

async function downloadAllImages(videoContent) {
  videoContent.downloadedImages = [];

  for (let sentenceIndex = 0; sentenceIndex < videoContent.sentences.length; sentenceIndex++) {
    const images = videoContent.sentences[sentenceIndex].images;
    for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
      const imageURL = images[imageIndex];

      try {
        if (videoContent.downloadedImages.includes(imageURL)) {
          throw new Error('Image already downloaded');
        }
        videoContent.downloadedImages.push(imageURL);
        await downloadAndSaveImage(imageURL, `${sentenceIndex}-original.png`);
        console.log(`> Successfuly downloaded image from ${imageURL}`);
        break;
      } catch (error) {
        console.log(`> Failed to load image ${imageURL}: Error: ${error}`);
      }
    }
  }
}

async function downloadAndSaveImage(url, fileName) {
  return imageDownloader.image({
    url,
    dest: `./content/${fileName}`
  });
}

module.exports = robot;
