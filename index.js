const robots = {
  text: require('./robots/text'),
  input: require('./robots/user-input'),
  state: require('./robots/state'),
  image: require('./robots/image')
}

async function start() {
  robots.input()
  await robots.text();
  await robots.image();

  const videoContent = robots.state.loadVideoContent();

  // console.dir(videoContent, { depth: null })
}

start();
