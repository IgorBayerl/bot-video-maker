const readline = require('readline-sync')
const Parser = require('rss-parser');

const robots = {
    text: require('./robots/text.js')
}

const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR' 

async function start() {
    const content = {
        maximumSentences: 7
    }

    content.searchTerm = await askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    await robots.text(content) 

    async function askAndReturnSearchTerm(){
        
        const response = readline.question('Type a Wikipedia search term or G to fetch google trends: ')

        return (response.toUpperCase() === 'G') ?  await askAndReturnTrend() : response
        // return readline.question('Qual o termo de busca? :')
    }

    async function askAndReturnTrend(){
        console.log('Please Wait...')
        const trends = await getGoogleTrends()
        const choice = readline.keyInSelect(trends, 'Choose your trend:')
        return trends[choice]
    }

    async function getGoogleTrends (){
        const parser = new Parser()
        const trends = await parser.parseURL(TREND_URL)
        return trends.items.map(({title}) => title)
    }


    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Chose one option...')
        const selectedPrefix = prefixes[selectedPrefixIndex]
        
        return selectedPrefix
    }


    console.log(content)
}

start()