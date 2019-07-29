
const path = require('path');
const fs = require('fs');
const xmldoc = require('xmldoc');
const Hyphen = require('hyphen');
const JSZip = require('jszip');

class FB2HTML {
    constructor(data, options) {

        options = Object.assign({
            hyphenate: false
        }, options);

        if (data) {
            this.fictionBook = new xmldoc.XmlDocument(data);
        }
        if (options.hyphenate) {
            try {
                const lang = this.getLanguage().toLowerCase();
                this.hyphenate = new Hyphen(require(`hyphen/patterns/${lang}`));
            } catch(e) {}
        }
    }

    static read(filePath, options) {

        if (path.extname(filePath) === '.zip') {
            return FB2HTML.readZip(filePath, options)
        }
        else {
            return FB2HTML.readFile(filePath, options);
        }

    }

    static readFile(filePath, options) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) reject(err);
                else resolve(new FB2HTML(data, options));
            })
        })
    }

    static readZip(filePath, options) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) reject(err);

                JSZip.loadAsync(data)
                    .then((zip) => {
                        let files = zip.filter((relativePath) => 
                            path.extname(relativePath) === '.fb2'
                        )
                        if (files && files.length) {
                            return zip.file(files[0].name).async('text');
                        }
                        throw new Error('Zip archive does not contains .fb2 files');
                    })
                    .then((data) => {
                        resolve(new FB2HTML(data, options));
                    })
            })
        })
    }

    format() {
        const book = {
            title: this.getTitle(),
            author: this.getAuthors(),
            genre: this.getGenres(),
            annotation: this.getAnnotation(),
            cover: this.getCover(),
            body: this.getBody()
        }

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
        const element = this.fictionBook
            .descendantWithPath('description.title-info.book-title');

        return element.val;
    }
    
    getAuthors() {
        const element = this.fictionBook
            .descendantWithPath('description.title-info');

        if (!element) return;

        const authors = element.childrenNamed('author');
    
        return authors.map(author => {
            const firstName = author.childNamed('first-name');
            const middleName = author.childNamed('middle-name');
            const lastName = author.childNamed('last-name');

            return [
                firstName && firstName.val,
                middleName && middleName.val,
                lastName && lastName.val
            ]
            .filter(a => a != null)
            .join(' ')
        }).join(', ')
    }
    
    getGenres() {
        const genres = this.fictionBook
            .descendantWithPath('description.title-info')
            .childrenNamed('genre')
    
        return genres
            .map(genre => genre.val)
            .join(', ');
    }

    getAnnotation() {
        const anotation = this.fictionBook
            .descendantWithPath('description.title-info.annotation');

        if (!anotation) return;

        return this.__content(anotation.children);
    }

    getLanguage() {
        const element = this.fictionBook
            .descendantWithPath('description.title-info.lang');
        return element.val;
    }

    getCover() {
        const element = this.fictionBook
            .descendantWithPath('description.title-info.coverpage');

        if (!element) return;

        const image = element.childNamed('image');

        if (!image) return;

        const imageHref = image.attr['l:href'];

        if (imageHref.charAt(0) === '#') {
            return this.__image(imageHref.substr(1));
        }

        return imageHref;
    }

    getBody() {
        const bodies = this.fictionBook.childrenNamed('body')

        return this.__content(bodies);
    }

    __image(id) {
        const binaries = this.fictionBook.childrenNamed('binary')

        const binary = binaries.find(binary => binary.attr['id'] === id);

        if (binary) {
            return `data:${binary.attr['content-type']};base64,${binary.val}`;
        }

        return '';
    }

    __content(node, tmpl) {        
        if (typeof node === 'string') {
            return tmpl
                ? tmpl.replace('%DATA%', this.__content(node))
                : this.hyphenate ? this.hyphenate(node) : node;
        }

        if (Array.isArray(node)) {
            return node.map(item => this.__content(item, tmpl)).join('');
        }

        if (node.type === 'text') {
            return this.__content(node.text, tmpl);
        }

        if (node.type === 'element') {
            switch (node.name) {
                case 'p':
                    return this.__content(node.children, '<p>%DATA%</p>')
                case 'strong':
                    return this.__content(node.children, '<b>%DATA%</b>')  
                case 'emphasis':
                    return this.__content(node.children, '<i>%DATA%</i>')
                case 'epigraph':
                    return this.__content(node.children, '<blockquote>%DATA%</blockquote>') 
                case 'cite':
                case 'text-author':
                    return this.__content(node.children, '<cite>%DATA%</cite>') 
                default:
                    return this.__content(node.children, tmpl);
            }
        }
    }
}

module.exports = FB2HTML;