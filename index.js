const readline = require('readline-sync');
const robots = {
  text: require('./robots/text')
}

async function start() {
  const videoContent = {
    maximumSentences: 7
  };

  videoContent.subject = askAndReturnSubject();
  videoContent.prefix = askAndReturnPrefix();
  await robots.text(videoContent);

  console.dir(videoContent, {depth: 1})
}

function askAndReturnSubject() {
  return readline.question('Type the video subject: ')
}

function askAndReturnPrefix() {
  const prefixes = ['Who is', 'What is', 'The history of'];
  const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose an option: ');
  return prefixes[selectedPrefixIndex];;
}

start();
