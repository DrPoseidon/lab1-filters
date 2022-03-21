const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const sharp = require('sharp');
const app = express();
const port = 3000;

app.use(cors());
app.use(fileUpload(undefined));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.post('/', async (req, res) => {
  try {
    const { uploadFile = undefined} = req?.files;
    if (uploadFile) {
      const uploadPath = __dirname + "/uploads/"  + uploadFile.name;
      await uploadFile.mv(uploadPath);

      const sharpRes = await sharpImage(uploadFile.name.split('.')[0], uploadPath);
      if (sharpRes.status) {
        res.sendFile(sharpRes.fileName);
      } else {
        res.status(500).send({ message: 'Ошибка сохранения файла' })
      }
    } else {
      res.status(500).send({ message: 'Ошибка чтения файла!' });
    }
  } catch(err) {
    console.log(err);
    res.sendStatus(500);
  }
});

async function sharpImage(name, data) {
  try {
    const metadata = await sharp(data).metadata();
    if (metadata) {
      const { format } = metadata;
      const fileName = `filtered/${name}.${format === 'jpeg' ? 'png' : 'jpeg'}`;

      await sharp(data)
        .grayscale()
        .blur(10)
        .negate()
        .toFile(fileName);

      return { status: true, fileName: `${__dirname}/${fileName}` };
    }
  } catch(err) {
    console.log(err);
    return { status: false };
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});












