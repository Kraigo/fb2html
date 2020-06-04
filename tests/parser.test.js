const fs = require('fs');
const path = require('path');
const FB2HTML = require('./../src/parser');

const documentsPath = path.join(__dirname, '..', 'documents');
const files = fs.readdirSync(documentsPath);


describe('Parse data', () => {
    files
    .filter(filePath => path.extname(filePath) === '.fb2')
    .forEach(function(filePath, i) {
        describe(`File #${i} (${filePath})`, () => {
            const data = fs.readFileSync(path.resolve(documentsPath, filePath));
            let book;
    
            test('Parse without exception', () => {
                expect(() => {
                    book = new FB2HTML(data, {hyphenate: false});
                }).not.toThrowError();
            })
    
            test('All fields presents', () => {
                expect(typeof book.getTitle()).toBe('string');
                expect(typeof book.getAuthors()).toBe('string');
                expect(typeof book.getGenres()).toBe('string');
            })
            
            test('Format to HTML', () => {
                expect(typeof book.format()).toBe('string');
            })

        })
    })
})

describe('Read local file', () => {
    const filePath = path.resolve(documentsPath, 'Harry-Potter-and-the-Chamber-of-Secrets.fb2');

    test('Parse without exception', (done) => {
        expect(() => {
            FB2HTML.read(filePath).then((book) => {                
                expect(typeof book.getTitle()).toBe('string');
                expect(typeof book.getAuthors()).toBe('string');
                expect(typeof book.getGenres()).toBe('string');
                done();

            });
        }).not.toThrowError();
    })
})

describe('Read zip file', () => {
    const filePath = path.resolve(documentsPath, 'harry_potter.zip');

    test('Parse without exception', (done) => {
        expect(() => {
            const options = {hyphenate: false};
            FB2HTML.read(filePath, options).then((book) => {                
                expect(typeof book.getTitle()).toBe('string');
                expect(typeof book.getAuthors()).toBe('string');
                expect(typeof book.getGenres()).toBe('string');
                done();

            });
        }).not.toThrowError();
    })
});