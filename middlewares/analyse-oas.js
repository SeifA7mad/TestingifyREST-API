const SwaggerParser = require('@apidevtools/swagger-parser');

exports.transformRoutes = async (req, res, next) => {
  const routesMap = {
    get: {},
    post: {},
    put: {},
    patch: {},
    delete: {},
  };

  try {
    const oas = await SwaggerParser.dereference(req.workingFilePath);
    const oasPaths = oas.paths;

    // later: work on file streams (chunks) instead of looping on whole file
    // if big --> split to chunks and work parallel on each chunck
    for (let path in oasPaths) {
      for (let op in oasPaths[path]) {
        // routesMap[op.toString().toLowerCase()][path] = { ex: 'ex' };
      }
    }
    console.log(routesMap);
    next();
  } catch (err) {
    next(err);
  }
};
