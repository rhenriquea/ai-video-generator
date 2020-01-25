const readline = require('readline-sync');

function start() {
  const videoContent = {};

  videoContent.subject = askAndReturnSubject();
  videoContent.prefix = askAndReturnPrefix();
  console.log(videoContent)

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
