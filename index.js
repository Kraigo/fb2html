const fs = require('fs');
const path = require('path');
const FB2HTML = require('./src/parser');

const fileName = 'sonya_shah_pandemiya_vsemirnaya_.zip';
const fileUrl = path.join(__dirname, 'documents', fileName);

const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    {{body}}
</body>
</html>`;

if (!fs.existsSync('./dist')){
    fs.mkdirSync('./dist');
}


FB2HTML.read(fileUrl)
    .then((book) => {
        var bookData = book.format();
        var result = template.replace('{{body}}', bookData);

        return fs.promises.writeFile('./dist/result.html', result);
    });