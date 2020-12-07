const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    toptentext: require('./robots/top10text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/image.js'),
    video: require('./robots/video.js'),
    youtube: require('./robots/youtube.js')
  }
  
  async function start() {
    // await robots.input()
    // await robots.text()
    // await robots.toptentext()
    // await robots.image()
    await robots.video()
    // await robots.youtube()
  }
  
  start()