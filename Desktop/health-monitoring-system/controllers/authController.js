// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!['doctor', 'patient', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Невірна роль користувача' });
    }

    const user = new User({ fullName, email, password, role });
    await user.save();
    res.status(201).json({ message: 'Користувач зареєстрований успішно' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при реєстрації', error });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Користувача не знайдено' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний пароль' });
    }

    // Генерация токена с id и ролью пользователя
    const token = jwt.sign({ id: user._id, role: user.role }, 'secretKey', { expiresIn: '1h' });

    res.json({ token }); // Отправляем токен
  } catch (error) {
    res.status(500).json({ message: 'Щось пішло не так' });
  }
};

