const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const googleCredentials = require('../credentials/google-search.json');
const state = require('./state');

async function robot() {
  const videoContent = state.loadVideoContent();
  await fetchImagesOfAllSentences(videoContent);
  console.dir(videoContent, { depth: null });
  process.exit(0);
}

async function fetchImagesOfAllSentences(videoContent) {
  for (const sentence of videoContent.sentences) {
    const query = `${videoContent.subject} ${sentence.keywords[0]}`;
    sentence.images =  await fetchGoogleAndReturnImageLinks(query);
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


module.exports = robot;
