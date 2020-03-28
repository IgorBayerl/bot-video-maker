

function start() {
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()

    function askAndReturnSearchTerm() {
        return 'TERM EXAMPLE'
    }

    console.log(content)
}

start()