const fs = require('fs');
const path = require('path');
const FB2HTML = require('./../src/parser');

const documentsPath = path.resolve(__dirname, 'documents');
const files = fs.readdirSync(documentsPath);


describe('Read files', () => {
    files.forEach(function(filePath, i) {
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