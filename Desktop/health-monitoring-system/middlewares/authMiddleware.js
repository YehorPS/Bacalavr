const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log("Received Token:", token);  // Логування токена для перевірки

  if (!token) {
    return res.status(403).json({ message: 'Токен не надано' });
  }

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) {
      console.log("Error in token verification:", err);  // Логування помилки токена
      return res.status(403).json({ message: 'Невірний токен' });
    }
    req.user = decoded; 
    next();
  });
};

