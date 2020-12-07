const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state');

const googleSearchCredentials = require('../credentials/google-search.json');



async function robot(){
    console.log('> [image-robot] Starting...')

    const content = state.load()

    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content) {

        for (let topicIndex = 0; topicIndex < content.topTenContentOriginal.length; topicIndex++) {
            
            let query
            if (topicIndex !== 0) {
                for (let sentenceIndex = 0; sentenceIndex < content.imageQuantityForTopic; sentenceIndex++) {   
                    if(sentenceIndex < content.topTenContentOriginal[topicIndex].sentences.length ){
                        if (sentenceIndex === 0) {
                            query = `${content.topTenContentOriginal[topicIndex].title}`
                        } else {
                            query = `${content.topTenContentOriginal[topicIndex].title} ${content.topTenContentOriginal[topicIndex].sentences[sentenceIndex].keywords[0]}`
                        }

                    }else{
                        query = `${content.topTenContentOriginal[topicIndex].title}`
                    }
                    
                    console.log(`> [image-robot] Querying Google Images with: "${query}"`)
                    try {
                        
                        content.topTenContentOriginal[topicIndex].images[sentenceIndex] = await fetchGoogleAndReturnImagesLinks(query)

                    } catch (error) {
                        console.log(error)
                    }
                    
                }
                
            }

        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            num: 3,
            imgSize: 'huge'
        })
    
        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })
    
        return imagesUrl
    }  
    
    async function downloadAllImages(content) {
        content.downloadedImages = []
    
        for (let topicIndex = 1; topicIndex < content.topTenContentOriginal.length; topicIndex++) {
            const images = content.topTenContentOriginal[topicIndex].images
        
            for (let imageArrayIndex = 0; imageArrayIndex < images.length; imageArrayIndex++) {
                const imageURLArray = images[imageArrayIndex]

                for (let imageIndex = 0; imageIndex < imageURLArray.length; imageIndex++) {
                    const imageUrl = imageURLArray[imageIndex];
                    try {
                        if (content.downloadedImages.includes(imageUrl)) {
                            throw new Error('Image already downloaded')
                        }
                
                        await downloadAndSave(imageUrl, `${topicIndex}-${imageArrayIndex}-original.png`)
                        content.downloadedImages.push(imageUrl)
                        console.log(`> [image-robot] [${topicIndex}][${imageArrayIndex}][${imageIndex}] Image successfully downloaded: ${imageUrl}`)
                        break

                    } catch(error) {
                        console.log(`> [image-robot] [${topicIndex}][${imageArrayIndex}][${imageIndex}] Error (${imageUrl}): ${error}`)
                    }
                }
                // await downloadAndSave(imageUrl, `${topicIndex}-${imageArrayIndex}-original.png`)
                
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