const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const watsonApiKey = require('../credentials/watson-nlu.json').apikey;
const watsonURL = require('../credentials/watson-nlu.json').url;
const sentenceBoundaryDetector = require('sbd');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const state =  require('./state');

const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
  version: '2018-04-05',
  url: watsonURL
});

async function robot() {
  const videoContent = state.loadVideoContent();

  await fetchContentFromWikipedia(videoContent);
  sanitizeContent(videoContent);
  breakContentIntoSentences(videoContent);
  limitMaximumSentences(videoContent);
  await fetchKeywordsFromAllSentences(videoContent);

  state.saveVideoContent(videoContent);
}

async function fetchContentFromWikipedia(videoContent) {
  const algorithmiaAuth = algorithmia(algorithmiaApiKey);
  const wikipediaAlgorithm = algorithmiaAuth.algo('web/WikipediaParser/0.1.2');
  const wikipediaResponse = await wikipediaAlgorithm.pipe(videoContent.subject);
  const wikipediaContent = wikipediaResponse.get();
  videoContent.sourceContentOriginal = wikipediaContent.content;
}

function sanitizeContent(videoContent) {
  const noBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(videoContent.sourceContentOriginal);
  const noDatesAndExtraSpaces = removeDatesInParenthesis(noBlankLinesAndMarkdown);
  videoContent.sourceContentSanitized = noDatesAndExtraSpaces;
}

function removeBlankLinesAndMarkdown(text) {
  const allLines = text.split('\n');
  const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
    if (line.trim().length === 0 || line.trim().startsWith('=')) {
      return false;
    }
    return true
  });
  return withoutBlankLinesAndMarkdown.join(' ');
}

function removeDatesInParenthesis(text) {
  return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace('/  /g', ' ');
}

function breakContentIntoSentences(videoContent) {
  const sentences = sentenceBoundaryDetector.sentences(videoContent.sourceContentSanitized);
  videoContent.sentences = sentences.map((sentence) => ({ text: sentence, keywords: [], images: [] }));
}


function limitMaximumSentences(videoContent) {
  videoContent.sentences = videoContent.sentences.slice(0, videoContent.maximumSentences);
}

async function fetchKeywordsFromAllSentences(videoContent) {
  for (const sentence of videoContent.sentences) {
    sentence.keywords = await fetchwatsonAndReturnKeywords(sentence.text);
  }
}

async function fetchwatsonAndReturnKeywords(sentence) {
  try {
    const { result } = await nlu.analyze({
      html: sentence, // Buffer or String
      features: {
        keywords: {}
      }
    });
    return result.keywords.map(keyword => keyword.text);
  } catch(err) {
    console.log('error: ', err);
  }
} 

module.exports = robot;
