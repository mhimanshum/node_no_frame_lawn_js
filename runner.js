exports.run = async (fnArray, req, res) => {
  if (!Array.isArray(fnArray)) {
    throw new Error('fn arr is not array');
  }
  let data = {};
  for (let i = 0; i < fnArray.length; i++) {
    data = await fnArray[i](req, res, data);
    if (data?.next) {
      continue;
    }
    break;
  }
  return data;
};
