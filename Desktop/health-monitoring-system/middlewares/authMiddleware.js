const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Токен не надано' });
  }

  try {
    const decodedToken = jwt.verify(token, 'secretKey'); // Використовуйте свій секретний ключ
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    req.user = user; // Додаємо користувача до запиту
    console.log('Додано користувача до req.user:', req.user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен закінчився, будь ласка, увійдіть знову' });
    }
    console.error('Помилка при перевірці токену:', error);
    return res.status(401).json({ message: 'Невірний токен' });
  }
};
