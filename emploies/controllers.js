const { ServerError } = require('../error');
const { readFile, writeFile } = require('../file');
const { hashPassword, verifyPassword, generateToken } = require('../utils');

exports.employeeLogin = async (req, res, data) => {
  if (!req.body.email) {
    throw new ServerError(400, 'email not supplied');
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
    throw new ServerError(400, 'invalid email');
  }
  if (!req.body.password) {
    throw new ServerError(400, 'password not supplied');
  }
  if (req.body.password.length < 6) {
    throw new ServerError(400, 'password is less than 6 character');
  }

  // find user
  const dbData = await readFile();
  const employeeData = dbData.emploies[req.body.email];
  if (!employeeData) {
    throw new ServerError(404, 'email not found, contact your admin');
  }

  // verify password
  if (!(await verifyPassword(req.body.password, employeeData.password))) {
    throw new ServerError(404, 'password is wrong');
  }

  // generate JWT token
  const token = generateToken({
    email: req.body.email,
    role: employeeData.role,
    iat: Date.now(),
  });

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify({ message: 'login successful', token }));
};

exports.employeeSignup = async (req, res, data) => {
  if (!req.body.email) {
    throw new ServerError(400, 'email not supplied');
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
    throw new ServerError(400, 'invalid email');
  }
  if (!req.body.password) {
    throw new ServerError(400, 'password not supplied');
  }
  if (req.body.password.length < 6) {
    throw new ServerError(400, 'password is less than 6 character');
  }
  if (!req.body.name) {
    throw new ServerError(400, 'name not supplied');
  }
  if (req.body.name.length < 2) {
    throw new ServerError(400, 'name is less than 2 character');
  }
  const dbData = await readFile();
  if (dbData.emploies[req.body.email]) {
    throw new ServerError(
      403,
      'already registred, use another email to signup',
    );
  }
  const hashedPassword = await hashPassword(req.body.password);
  dbData.emploies[req.body.email] = {
    name: req.body.name,
    password: hashedPassword,
    role: 'm2',
  };
  await writeFile(dbData);
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify({ message: 'signup successful' }));
};

exports.myProfile = async (req, res, data) => {
  if (!req.tokenData.email) {
    throw new Error('something went wrong');
  }

  // find user
  const dbData = await readFile();
  const employeeData = dbData.emploies[req.tokenData.email];
  if (!employeeData) {
    throw new ServerError(404, 'user not found');
  }
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  delete employeeData.password;
  res.end(JSON.stringify(employeeData));
};

exports.updateMyProfile = async (req, res, data) => {
  if (!req.tokenData.email) {
    throw new Error('something went wrong');
  }

  // find user
  const dbData = await readFile();
  const employeeData = dbData.emploies[req.tokenData.email];
  if (!employeeData) {
    throw new ServerError(404, 'user not found');
  }

  employeeData.name = req.body.name;
  employeeData.phone = req.body.phone;
  employeeData.alternatePhone = req.body.alternatePhone;
  employeeData.address = req.body.address;

  delete employeeData.password;
  await writeFile(dbData);

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(employeeData));
};

exports.employeeProfile = async (req, res, data) => {
  if (!req.tokenData.email) {
    throw new Error('something went wrong');
  }
  // find user
  const dbData = await readFile();
  const employeeData = dbData.emploies[req.tokenData.email];
  if (!employeeData) {
    throw new ServerError(404, 'user not found');
  }
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(employeeData));
};

exports.updateEmployeeProfile = async (req, res, data) => {
  if (!req.tokenData.email) {
    throw new Error('something went wrong');
  }

  // find user
  const dbData = await readFile();
  const employeeData = dbData.emploies[req.tokenData.email];
  if (!employeeData) {
    throw new ServerError(404, 'user not found');
  }

  employeeData.name = req.body.name;
  employeeData.phone = req.body.phone;
  employeeData.alternatePhone = req.body.alternatePhone;
  employeeData.address = req.body.address;

  await writeFile(dbData);
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(employeeData));
};
