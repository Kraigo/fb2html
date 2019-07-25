const fs = require('fs');
const fileUrl = './test/Minina_Porok-serdca.mHTyIQ.198265.fb2';
const FB2HTML = require('./src/parser');

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

fs.readFile(fileUrl,'utf8', (err, data) => {
    if (err) return;
    var bookData = new FB2HTML(data).format();
    var book = template.replace('{{body}}', bookData);

    fs.writeFile('./dist/result.html', book, (err) => {
        if (err) console.log(err);
    })
})