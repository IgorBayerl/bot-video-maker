const gm = require('gm').subClass({imageMagick: true})
const state = require('./state.js')
const spawn = require('child_process').spawn
const path = require('path')
const os = require('os');
const rootPath = path.resolve(__dirname, '..')
const { exec } = require('child_process');

const fromRoot = relPath => path.resolve(rootPath, relPath)

async function robot() {
  console.log('> [video-robot] Starting...')
  const content = state.load()

  console.log('> [video-robot] content loaded.')

  await convertAllImages(content)
  // await createAllSentenceImages(content)
  await createYouTubeThumbnail()
  await createAfterEffectsScript(content)
  // await renderVideoWithAfterEffects()

  state.save(content)

  async function convertAllImages(content) {
    console.log('> [video-robot] converting images...')
    for (let topicIndex = 0; topicIndex < content.topTenContentOriginal.length; topicIndex++) {
      const topic = content.topTenContentOriginal[topicIndex]
      if(topicIndex != 0){
        for (let imageIndex = 0; imageIndex < topic.images.length; imageIndex++) {
          await convertImage( topicIndex , imageIndex )
        }
      }
    }
  }

  async function convertImage( topicIndex, imageIndex) {

    console.log(`> [video-robot] converting image [${topicIndex}]-[${imageIndex}] .`)

    return new Promise((resolve, reject) => {
      const inputFile = fromRoot(`./content/images-original/${topicIndex}-${imageIndex}-original.png[0]`)
      const outputFile = fromRoot(`./content/images-converted/${topicIndex}-${imageIndex}-converted.png`)
      const width = 1920
      const height = 1080

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
            return reject(error)
          }
          console.log(`> [video-robot] Image converted: ${outputFile}`)
          resolve()
        })

    })
  }

  async function createAllSentenceImages(content) {
    await createSentenceImage(2, 'E não importa se o jogador prefere videogame em plataforma como Xbox, Wii, Sony, ou se a preferência é para jogar games no computador ou laptop.')
    // for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
    //   await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
    // }
  }

  async function createThumbnail( topicIndex, imageIndex) {

    console.log(`> [video-robot] converting image [${topicIndex}]-[${imageIndex}] .`)

    return new Promise((resolve, reject) => {
      const inputFile = fromRoot(`./content/images-original/${topicIndex}-${imageIndex}-original.png[0]`)
      const outputFile = fromRoot(`./content/images-converted/${topicIndex}-${imageIndex}-converted.png`)
      const width = 1920
      const height = 1080

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
        .sepia()
        .blur(30, 20)
        
        .write(outputFile, (error) => {
          if (error) {
            return reject(error)
          }
          console.log(`> [video-robot] Image converted: ${outputFile}`)
          resolve()
        })

    })
  }

  async function createSentenceImage(sentenceIndex, sentenceText) {
    return new Promise((resolve, reject) => {
      const outputFile = fromRoot(`./content/images-texts/${sentenceIndex}-sentence.png`)

      const templateSettings = {
        0: {
          size: '1920x400',
          gravity: 'center'
        },
        1: {
          size: '1920x1080',
          gravity: 'center'
        },
        2: {
          size: '800x1080',
          gravity: 'west'
        },
        3: {
          size: '1920x400',
          gravity: 'center'
        },
        4: {
          size: '1920x1080',
          gravity: 'center'
        },
        5: {
          size: '800x1080',
          gravity: 'west'
        },
        6: {
          size: '1920x400',
          gravity: 'center'
        }

      }

      gm()
        .out('-size', templateSettings[sentenceIndex].size)
        .out('-gravity', templateSettings[sentenceIndex].gravity)
        // .out('-text-font', 'Courier.ttf')
        .out('-background', 'transparent')
        .out('-fill', 'white')
        .out('-kerning', '-1')
        .out(`caption:${sentenceText}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error)
          }

          console.log(`> [video-robot] Sentence created: ${outputFile}`)
          resolve()
        })
    })
  }

  async function createYouTubeThumbnail() {
    await createYouTubeThumbnailWithoutArrow()
    await sleep(1000);
    exec(`convert ./content/seta2.png ./content/youtube-thumbnail.png -compose DstOver -composite ./content/youtube-thumbnail.png`)
  }

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function createYouTubeThumbnailWithoutArrow() {
    return new Promise((resolve, reject) => {
      const width = 1280
      const height = 720
      gm()
        .in(fromRoot('./content/images-converted/1-0-converted.png'))
        
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-blur', '0x9')
          .out('-resize', `${width}x${height}^`)
          // .sepia()
          .out('-modulate', '30,32,32')
          .borderColor('grey')
          .border(12, 12)
          .fontSize(110)
          .out('-fill', 'white')
          .font('Palatino-Linotype-Italic')
          .drawText(50, 50, 'Top 10 Games' , 'NorthEast')
        .out(')')
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-resize', `${width / 2 }x${height / 2 }`)
          .borderColor('white')
          .border(12, 12)
          .rotate('transparent', -15)
          .borderColor('transparent')
          .border(30, 30)
          .out('-gravity', 'SouthWest')
        .out(')')
        .out('-delete', '0')
        .out('-gravity', 'SouthWest')
        .out('-compose', 'over')
        .out('-composite')
        .write(fromRoot('./content/youtube-thumbnail.png'), (error) => {
          if (error) {
            return reject(error)
          }

          console.log('> [video-robot] YouTube thumbnail created')
          resolve()
        })
    })
  }



  async function createAfterEffectsScript(content) {
    await state.saveScript(content)
  }

  async function renderVideoWithAfterEffects() {
    return new Promise((resolve, reject) => {

      const aerenderFilePath = 'D:/ProgramFiles/Adobe/Adobe After Effects 2020/Support Files/aerender.exe'
      
      
      const templateFilePath = fromRoot('./templates/1/template.aep')
      const destinationFilePath = fromRoot('./content/output.mov')

      console.log('> [video-robot] Starting After Effects')

      const aerender = spawn(aerenderFilePath, [
        '-comp', 'main',
        '-project', templateFilePath,
        '-output', destinationFilePath
      ])

      aerender.stdout.on('data', (data) => {
        process.stdout.write(data)
      })

      aerender.on('close', () => {
        console.log('> [video-robot] After Effects closed')
        resolve()
      })
    })
  }

}

module.exports = robot