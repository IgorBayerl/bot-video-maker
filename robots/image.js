const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state');


const googleSearchCredentials = require('../credentials/google-search.json');
const { sentences } = require('sbd');


async function robot(){
    console.log('> [image-robot] Starting...')

    const content = state.load()

    await fetchImagesOfAllSentences(content)
    // await downloadAllImages(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        // for (const iterator of content.topTenContentOriginal) {
        //     console.log('oieee')
        // }
        for (let topicIndex = 0; topicIndex < content.topTenContentOriginal.length; topicIndex++) {
            
            let query
            if (topicIndex !== 0) {
                // for (let sentenceIndex = 0; sentenceIndex < content.topTenContentOriginal[topicIndex].sentences.length; sentenceIndex++) {
                for (let sentenceIndex = 0; sentenceIndex < content.imageQuantityForTopic; sentenceIndex++) {    
                    // const centence = content.topTenContentOriginal[topicIndex].sentences[sentenceIndex];

                    if (sentenceIndex === 0) {
                        query = `${content.topTenContentOriginal[topicIndex].title}`
                    } else {
                        query = `${content.topTenContentOriginal[topicIndex].title} ${content.topTenContentOriginal[topicIndex].sentences[sentenceIndex].keywords[0]}`
                        // query = `${content.topTenContentOriginal[topicIndex].title}`
                    }
                    console.log(`> [image-robot] Querying Google Images with: "${query}"`)
                    try {
                        content.topTenContentOriginal[topicIndex].sentences[sentenceIndex].images = await fetchGoogleAndReturnImagesLinks(query)
                    } catch (error) {
                        console.log(error)
                    }
                    content.topTenContentOriginal[topicIndex].sentences[sentenceIndex].googleSearchQuery = query
                    
                    
                }
                
            }
            

            // if (topicIndex === 0) {
            //     query = `${content.searchTerm}`
            // } else {
            //     // query = `${content.topTenContentOriginal[topicIndex].title} ${content.topTenContentOriginal[topicIndex].keywords[0]}`
            //     query = `${content.topTenContentOriginal[topicIndex].title}`
            // }

            // console.log(`> [image-robot] Querying Google Images with: "${query}"`)

            // content.topTenContentOriginal[topicIndex].images = await fetchGoogleAndReturnImagesLinks(query)
            // content.topTenContentOriginal[topicIndex].googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            num: 2,
            imgSize: 'huge'
        })
    
        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })
    
        return imagesUrl
    }  
    
    
    async function downloadAllImages(content) {
        content.downloadedImages = []
    
        for (let sentenceIndex = 0; sentenceIndex < content.topTenContentOriginal.length; sentenceIndex++) {
            const images = content.topTenContentOriginal[sentenceIndex].images
        
            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex]
        
                try {
                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error('Image already downloaded')
                    }
            
                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Image successfully downloaded: ${imageUrl}`)
                    break

                } catch(error) {
                    console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Error (${imageUrl}): ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(url, fileName) {
        return imageDownloader.image({
            url: url,
            dest: `./content/${fileName}`
        })
    }
    
}

module.exports = robot