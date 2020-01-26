const robots = {
  text: require('./robots/text'),
  input: require('./robots/user-input'),
  state: require('./robots/state')
}

async function start() {

  robots.input()
  await robots.text();
  
  const videoContent = robots.state.loadVideoContent();

  console.dir(videoContent, { depth: null })
}

start();
