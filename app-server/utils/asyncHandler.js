// encaminha qualquer erro pro middleware de erro do Express, 
// sem precisar de try/catch em cada função.

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
