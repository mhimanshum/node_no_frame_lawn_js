const { ServerError } = require('../error');
const { readFile, writeFile } = require('../file');
const { generateNextId } = require('../utils');

exports.createAsset = async (req, res, data) => {
  if (!req.body.name) {
    throw new ServerError(400, 'name not supplied');
  }
  const price = parseFloat(req.body?.price);
  if (!req.body.price || isNaN(price)) {
    throw new ServerError(400, 'invalid price');
  }
  const cid = parseInt(req.body?.cid);
  if (!req.body.cid || isNaN(cid)) {
    throw new ServerError(400, 'invalid category id supplied');
  }

  const dbData = await readFile();

  // check for existing categories
  const allCategories = dbData.categories;

  let isMatched = false;
  for (let i = 0; i < allCategories.length; i++) {
    if (allCategories[i].id === cid) {
      isMatched = true;
      break;
    }
  }

  if (!isMatched) {
    throw new ServerError(404, 'category not found');
  }

  // check for available repeated asset
  for (let i = 0; i < dbData.assets.length; i++) {
    if (dbData.assets[i].name === req.body.name) {
      throw new ServerError(400, 'asset name already exists');
    }
  }

  const newAssetId = generateNextId(dbData.assets);
  const asset = {
    id: newAssetId,
    name: req.body.name,
    price,
    cid,
    description: req.body.description,
  };

  dbData.assets.push(asset);

  await writeFile(dbData);

  res.end(JSON.stringify(asset));
};

exports.getAssets = async (req, res, data) => {
  const dbData = await readFile();

  const cid = parseInt(req.params.cid);
  if (!cid) {
    throw new ServerError(400, 'please enter id');
  }

  let asset = [];
  for (let i = 0; dbData.assets.length > i; i++) {
    if (dbData.assets[i].cid === cid) {
      asset.push(dbData.assets[i]);
    }
  }

  res.end(JSON.stringify(asset));
};

exports.updateAsset = async (req, res, data) => {
  const idStr = req.params.id;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    throw new ServerError(400, 'asset id is invalid');
  }

  const priceFloat = parseFloat(req.body.price);

  if (req.body.price && isNaN(priceFloat)) {
    throw new ServerError(400, 'asset price is invalid');
  }

  const dbData = await readFile();
  let i = 0;
  for (i = 0; i < dbData.assets.length; i++) {
    if (dbData.assets[i].id === id) {
      dbData.assets[i].name = req.body.name
        ? req.body.name
        : dbData.assets[i].name;
      dbData.assets[i].price = req.body.price
        ? priceFloat
        : dbData.assets[i].price;
      break;
    }
  }

  await writeFile(dbData);

  res.end(JSON.stringify(dbData.assets[i]));
};

exports.deleteAsset = async (req, res, data) => {
  const dbData = await readFile();
  const assets = dbData['assets'];

  for (let i = 0; assets.length > i; i++) {
    if (assets[i].id === req.body.id) {
      assets.splice(i, 1);
    }
  }
  await writeFile(dbData);

  res.end('asset deleted');
};
