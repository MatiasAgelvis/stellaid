const { DOMParser } = require('linkedom');
html = '<!DOCTYPE html ><html><body><h1>FOO BAR</h1><p>pizza</p></body></html>'
doc = (new DOMParser).parseFromString(html, 'text/html')
doc.location = {
    host: "www.example.com",
    hostname: "www.example.com",
    href: "https://www.example.com/page",
    origin: "https://www.example.com",
    pathname: "/page",
    protocol: "https:"
}

global.document = doc