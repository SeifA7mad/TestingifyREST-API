const fs = require('fs');
const path = require('path');

exports.saveOasToFile = (req, res, next) => {
  const fileName = `${req.body.info.title}`.trim().split(' ').join('');
  const dir = path.join(process.cwd(), `/data/${fileName}.json`);

  try {
    fs.writeFileSync(dir, JSON.stringify(req.body));
    console.log('File SAVED!');
    req.workingFilePath = dir;
    next();
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};


