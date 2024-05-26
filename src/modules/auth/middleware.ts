const authentication = (req, res, next) => {
  const token = req.header('Authorization');
  console.log(token);

  next();
};

export default authentication;
