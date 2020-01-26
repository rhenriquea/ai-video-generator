const imageDownloader = require('image-downloader');
const google = require('googleapis').google;
const gm = require('gm').subClass({ imageMagick: true });
const customSearch = google.customsearch('v1');
const googleCredentials = require('../credentials/google-search.json');
const state = require('./state');

async function robot() {
  const videoContent = state.loadVideoContent();

  await fetchImagesOfAllSentences(videoContent);
  await downloadAllImages(videoContent);
  await convertAllImages(videoContent);
  await createAllSentenceImages(videoContent);
  await createYouTubeThumbnail(videoContent);

  state.saveVideoContent(videoContent);
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

async function convertAllImages(videoContent) {
  for (let sentenceIndex = 0; sentenceIndex < videoContent.sentences.length; sentenceIndex++) {
    await convertImage(sentenceIndex);
  }
}

async function convertImage(sentenceIndex) {
  return new Promise((resolve, reject) => {
    const inputFile = `./content/${sentenceIndex}-original.png[0]`;
    const outputFile = `./content/${sentenceIndex}-converted.png`;
    const width = 1920;
    const height = 1080;

    gm()
      .in(inputFile)
      .out('(')
      .out('-clone')
      .out('0')
      .out('-background', 'white')
      .out('-blur', '0x9')
      .out('-resize', `${width}x${height}^`)
      .out(')')
      .out('(')
      .out('-clone')
      .out('0')
      .out('-background', 'white')
      .out('-resize', `${width}x${height}`)
      .out(')')
      .out('-delete', '0')
      .out('-gravity', 'center')
      .out('-compose', 'over')
      .out('-composite')
      .out('-extent', `${width}x${height}`)
      .write(outputFile, (error) => {
        if (error) {
          return reject(error);
        }
        console.log(`> Image converted: ${inputFile}`);
        resolve();
      });
  });
}

async function createAllSentenceImages(videoContent) {
  for (let sentenceIndex = 0; sentenceIndex < videoContent.sentences.length; sentenceIndex++) {
    await createSentenceImage(sentenceIndex, videoContent.sentences[sentenceIndex].text);
  }
}

async function createSentenceImage(sentenceIndex, sentenceText) {
  return new Promise((resolve, reject) => {
    const outputFile = `./content/${sentenceIndex}-sentence.png`;

    const templateSettings = {
      0: {
        size: '1920x400',
        gravity: 'center'
      },
      1: {
        size: '1920x400',
        gravity: 'center'
      },
      2: {
        size: '1920x400',
        gravity: 'center'
      },
      3: {
        size: '1920x400',
        gravity: 'center'
      },
      4: {
        size: '1920x400',
        gravity: 'center'
      },
      5: {
        size: '1920x400',
        gravity: 'center'
      },
      6: {
        size: '1920x400',
        gravity: 'center'
      }
    };

    gm()
      .out('-size', templateSettings[sentenceIndex].size)
      .out('-gravity', templateSettings[sentenceIndex].gravity)
      .out('-background', 'transparent')
      .out('-fill', 'white')
      .out('-kerning', '-1')
      .out(`caption:${sentenceText}`)
      .write(outputFile, (error) => {
        if (error) {
          return reject(error);
        }
        console.log(`> Sentence created: ${outputFile}`);
        resolve();
      });
  });
}

async function createYouTubeThumbnail(videoContent) {
  return new Promise((req, res) => {
    gm()
      .in('./content/0-converted.png')
      .write('./content/youtube-thumbnail.jpg', (error) => {
        if (error) {
          return reject(error);
        }
        console.log('> Thumbnail for YouTube created');
        resolve();
      });
  });
}

module.exports = robot;
