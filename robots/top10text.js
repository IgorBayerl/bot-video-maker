const puppeteer = require('puppeteer')
const sentenceBoundaryDetection = require('sbd')
const state = require('./state.js')
const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1')
const { IamAuthenticator } = require('ibm-watson/auth');

const nlu = new NaturalLanguageUnderstandingV1({
    authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
    version: '2018-04-05',
    serviceUrl: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});
/// pegar os textos do top 10

const tema = 'top-10-melhores-jogos-para-pc-de-todos-os-tempos/'

async function robot(){

    const content = state.load()

    await getTop10Titles(content)
    breakContentIntoSentences(content)
    await fetchKeywordsOfAllSentences(content)

    
    state.save(content)
    
    

    async function getTop10Titles(){
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(`https://top10mais.org/${tema}`);

        const topTenContent = await page.evaluate(() => {

            const topTenListContentOriginalArray = document.querySelectorAll('#mvp-content-main p')
            const topTenListTitlesOriginalArray = document.querySelectorAll('#mvp-content-main h2 span')


            let arrayContentSanitized = []
            for (let i = 0; i < topTenListContentOriginalArray.length; i++) {
                const texto = topTenListContentOriginalArray[i].outerText.replace(/(\r\n|\n|\r)/gm, " ")
                
                if( i != 0 ){
                    const title = topTenListTitlesOriginalArray[i-1].textContent
                    arrayContentSanitized.push({
                        title: title,
                        texto: texto,
                        sentences: []
                    })
                }else{
                    arrayContentSanitized.push({
                        title: 'introduction',
                        texto: texto,
                        sentences: []
                    })
                }
            }
            return arrayContentSanitized
        });
        content.topTenContentOriginal = topTenContent

        await browser.close()
    }


    function breakContentIntoSentences(content) {

        const topTenArray = content.topTenContentOriginal

        topTenArray.forEach(item => {
            const sentences = sentenceBoundaryDetection.sentences(item.texto)
            sentences.forEach((sentence) => {
                item.sentences.push(sentence)
            })
        });
    
        console.dir(content, {depth: null})
    }

    

    async function fetchKeywordsOfAllSentences(content) {
        console.log('> [text-robot] Starting to fetch keywords from Watson')
    
        for (const sentence of content.topTenContentOriginal) {
            console.log(`> [text-robot] Sentence: "${sentence.texto}"`)
        
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.texto)
        
            console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
        }
            

    }

    async function fetchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {

            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    reject(error)
                    return
                }
                const keywords = response.result.keywords.map((keyword) => {
                    return keyword.text
                })
        
            resolve(keywords)
            })
        })
    }


}

module.exports = robot