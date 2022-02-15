const fs = require('fs');

exports.saveOasToFile = (req, res, next) => {
  const fileName = req.body.info.title.join(' ');
  const path = `../data/${fileName}.json`;

  try {
    fs.writeFileSync(path, req.body);
  } catch (err) {
    console.log(err);
  }
};
