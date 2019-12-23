// const EventEmitter = require('events')
// const http = require('http')

// const myEmitter = new EventEmitter();

// myEmitter.on('newSale', () => {
//     console.log('A new item has been sold!')
// })

// myEmitter.on('newSale', () => {
//     console.log('Babar purchased an item!')
// })

// myEmitter.emit('newSale')


// ////////////////////////////////////////////////////////////////
// const server  = http.createServer();
// server.on('request', (req, res) => {
//     console.log('Request received!')
//     res.end('Request received')
// })

// server.on('request', (req, res) => {
//     console.log('Request received!')
//     res.end('Another Request received 😁')
// })

// server.on('close', (req, res) => {
//     console.log('Request recieved!')
//     res.end('Server closed 🙃')
// })

// server.listen(8000, '127.0.0.1', () => {
//     console.log('Server listening')
// })

const fs = require('fs')
const http  = require('http')
const server = http.createServer()

// Solution 1
server.on('request', (req, res) => {
    // fs.readFile('./test-file.txt', (err, data) => {
    //     if(err) console.log('File reading error', err)
    //     res.end(data)
    // })

    // Solution # 2
    // const readable = fs.createReadStream('./test-file.txt')
    // readable.on('data', data => {res.write(data)})
    // readable.on('end', () => {res.end()})
    // readable.on('error', (err) => {res.end('File not found')})

    // Solution # 3 😀
    const readable = fs.createReadStream('./test-file.txt')
    readable.pipe(res);
})




server.listen(8000, '127.0.0.1', () => { console.log('Server listening')})