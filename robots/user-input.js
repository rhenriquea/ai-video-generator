const readline = require('readline-sync');
const state =  require('./state');

function robot() {
  const videoContent = {
    maximumSentences: 7
  };
  
  videoContent.subject = askAndReturnSubject();
  videoContent.prefix = askAndReturnPrefix();
  state.saveVideoContent(videoContent);
  
  function askAndReturnSubject() {
    return readline.question('Type the video subject: ')
  }
  
  function askAndReturnPrefix() {
    const prefixes = ['Who is', 'What is', 'The history of'];
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose an option: ');
    return prefixes[selectedPrefixIndex];;
  }
}

module.exports = robot;