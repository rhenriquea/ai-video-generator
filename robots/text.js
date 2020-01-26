const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetector = require('sbd');

async function robot(videoContent) {
  await fetchContentFromWikipedia(videoContent);
  sanitizeContent(videoContent);
  breakContentIntoSentences(videoContent);
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

module.exports = robot;
