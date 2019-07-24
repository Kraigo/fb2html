// const xmldoc = require('xmldoc');
const xml = require('fast-xml-parser');

class FB2JS {
    constructor(data) {
        const options = {
            ignoreAttributes: false,
            textNodeName: '@_text'
        }
        this.fictionBook = xml.parse(data, options)['FictionBook'];
        // this.fictionBook = new xmldoc.XmlDocument(data);

        this.book = {
            title: this.getTitle(),
            author: this.getAuthors(),
            genre: this.getGenres(),
            annotation: this.getAnnotation(),
            cover: this.getCover(),
            body: this.getBody()
        };
    }

    format() {
        const book = this.book;

        return `
            <img src="${book.cover}"></img>
            <h1>${book.title}</h1>
            <h2>${book.author}</h2>
            <h3>${book.genre}</h3>

            <div>${book.annotation}</div>
            <div>${book.body}</div>
        `;
    }

    getTitle() {
        const fictionBook = this.fictionBook;

        return fictionBook['description']['title-info']['book-title'];
    }
    
    getAuthors() {
        const fictionBook = this.fictionBook;
        const node = fictionBook['description']['title-info']['author'];
        const authors = Array.isArray(node) ? node : [node];
    
        return authors.map(author => 
           [author['first-name'], author['middle-name'], author['last-name']]
            .filter(a => a != null)
            .join(' ')
        ).join(', ');
    }
    
    getGenres() {
        const fictionBook = this.fictionBook;
        const node = fictionBook['description']['title-info']['genre'];
        const genres = Array.isArray(node) ? node : [node];
    
        return genres.join(', ');
    }

    getAnnotation() {
        const fictionBook = this.fictionBook;
        const node = fictionBook['description']['title-info']['annotation'];

        return this.__content(node);
    }

    getCover() {
        const fictionBook = this.fictionBook;
        const coverpage = fictionBook['description']['title-info']['coverpage'];
        const image = coverpage && coverpage['image'] && coverpage['image'];
        const imageHref = image['@_l:href']

        if (imageHref.charAt(0) === '#') {
            return this.__image(imageHref.substr(1))
        }

        return imageHref;
    }

    getBody() {
        const fictionBook = this.fictionBook;
        const node = fictionBook['body'];
        const bodies = Array.isArray(node) ? node : [node];

        return this.__content(bodies);
    }

    __image(id) {
        const fictionBook = this.fictionBook;
        const binaries = Array.isArray(fictionBook.binary) ? fictionBook.binary : [fictionBook.binary];

        const binary = binaries.find(binary => binary['@_id'] === id);

        if (binary) {
            return `data:${binary['@_content-type']};base64,${binary['#text']}`;
        }

        return '';
    }

    __content(node, tmpl) {
        if (typeof node === 'string') {
            return tmpl
                ? tmpl.replace('%DATA%', this.__content(node))
                : node;
        }

        if (Array.isArray(node)) {
            return node.map(item => this.__content(item, tmpl)).join('\n');
        }

        if (node === Object(node)) {

            return Object.keys(node)
                .map(key => {
                    switch (key) {
                        case 'p':
                            return this.__content(node[key], '<p>%DATA%</p>')
                        case 'strong':
                            return this.__content(node[key], '<b>%DATA%</b>')  
                        case 'emphasis':
                            return this.__content(node[key], '<i>%DATA%</i>')  
                        default:
                            return this.__content(node[key], tmpl);
                    }
                })
                .join('\n');
        }
    }
}

module.exports = FB2JS;