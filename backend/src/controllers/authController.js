import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, execute } from '../models/db.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  const user = await queryOne('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
  
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  await execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    }
  });
};

export const register = async (req, res) => {
  const { username, email, password, firstName, lastName, role = 'user' } = req.body;
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await execute(
    'INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
    [username, email, passwordHash, firstName, lastName, role]
  );

  res.status(201).json({ id: result.lastID, username });
};

export const me = async (req, res) => {
  const user = await queryOne(
    'SELECT id, username, email, first_name, last_name, role, phone FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(user);
};
