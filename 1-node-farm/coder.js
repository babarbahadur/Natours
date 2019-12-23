const fs = require('fs');
const http = require('http')
const url = require('url');

// const text = fs.readFileSync('./starter/txt/input.txt', 'utf-8')

// const text2 = `I am doing great coding?: ${text}`
// fs.writeFileSync('./starter/txt/coder.txt', text2)
// console.log(text2)


///////SERVER/////////////
const replaceTemplate = (template, product) => {
    let output = template.replace(/{%PRODUCT_NAME%}/g, product.productName)
    output = output.replace(/{%IMAGE%}/g, product.image)
    output = output.replace(/{%FROM%}/g, product.from)
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients)
    output = output.replace(/{%QUANTITY%}/g, product.quantity)
    output = output.replace(/{%PRICE%}/g, product.price)
    output = output.replace(/{%DESCRIPTION%}/g, product.description)
    output = output.replace(/{%ID%}/g, product.id)

    if(!product.organic) output.replace(/{%NOT_ORGANIC%}/g, 'not-organic')

    return output
}
const tempOverview = fs.readFileSync(`${__dirname}/starter/templates/overview.html`, 'utf-8')
const tempProductComponent = fs.readFileSync(`${__dirname}/starter/templates/product-template.html`, 'utf-8')
const tempDetails = fs.readFileSync(`${__dirname}/starter/templates/product.html`, 'utf-8')

const data = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8')
const dataObj = JSON.parse(data)

const server = http.createServer( (req, res) => {

    const {query, pathname } = url.parse(req.url, true)
   

    if(pathname === '/' || pathname === '/overview') {
        res.writeHead(200, {'Content-Type': 'text/html'})
        const cardHtml = dataObj.map( el => replaceTemplate(tempProductComponent, el)).join('')
        const output = tempOverview.replace('{%PRODUCT_CARDS%', cardHtml)
        res.end(output)
    } else if (pathname === '/product') {
        res.writeHead(200, {'Content-Type': 'text/html'})
        const product = dataObj[query.id]
        const output = replaceTemplate(tempDetails, product)
        res.end(output)
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(data)
    } else {
        res.writeHead(404, {'Content-Type': 'text/html', 'my-own-header': 'hello-world'})
        res.end('<h1>Page not found<h1>')
    }
})

server.listen('8000', '127.0.0.1', () => {
    console.log('Server is listening on local host port 8000 😇')
})
//This is simple server
// const server = http.createServer((req, res) => {
//     console.log(req.url)
//     res.end('Hello from the server! 😁')
// })

// server.listen('8000', '127.0.0.1', ()=> {
//     console.log('Listening to requests on port 8000')
// })