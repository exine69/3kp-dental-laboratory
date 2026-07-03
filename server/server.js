import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '3kp_dental_laboratory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB Connection
pool.getConnection()
  .then((conn) => {
    console.log('Connected to MySQL database successfully.');
    conn.release();
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

// --- AUTHENTICATION API ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const uname = username.trim().toLowerCase();

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(username) = ? AND password_hash = SHA2(?, 256)', [uname, password]);
    if (rows.length > 0) {
      const user = rows[0];
      return res.json({ success: true, role: user.role, user: { username: user.username, name: user.name, role: user.role, email: user.email, phone: user.phone, id: user.id } });
    }
    return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, password, name, email, phone } = req.body;
  const uname = username.trim().toLowerCase();
  
  if (!uname || !password || !name.trim() || !email.trim() || !phone.trim()) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  if (uname === 'admin') {
    return res.status(400).json({ success: false, error: "Cannot use 'admin' as username." });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? OR phone = ?', [uname, email.trim().toLowerCase(), phone.trim()]);
    if (existingUser.length > 0) {
      if (existingUser[0].username.toLowerCase() === uname) return res.status(400).json({ success: false, error: 'Username already taken.' });
      if (existingUser[0].email && existingUser[0].email.toLowerCase() === email.trim().toLowerCase()) return res.status(400).json({ success: false, error: 'Email already registered.' });
      return res.status(400).json({ success: false, error: 'Phone number already registered.' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (username, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, SHA2(?, 256), "user")',
      [uname, name.trim(), email.trim().toLowerCase(), phone.trim(), password]
    );
    
    res.json({ success: true, role: 'user', user: { id: result.insertId, username: uname, name: name.trim(), role: 'user', email: email.trim().toLowerCase(), phone: phone.trim() } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// --- APPOINTMENTS API ---
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, customer_name AS name, DATE_FORMAT(appointment_date, "%Y-%m-%d") AS date, time_slot AS time FROM appointments ORDER BY appointment_date DESC, id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get booked slots for a specific date (for double-booking prevention)
app.get('/api/appointments/booked-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.json([]);
  try {
    const [rows] = await pool.query(
      'SELECT time_slot FROM appointments WHERE DATE_FORMAT(appointment_date, "%Y-%m-%d") = ? AND status != "Cancelled"',
      [date]
    );
    res.json(rows.map(r => r.time_slot));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { public_id, customer_name, service, appointment_date, time_slot, email, contact, clinic, notes, user_id, status } = req.body;
  
  // Check for double booking
  try {
    const [existing] = await pool.query(
      'SELECT id FROM appointments WHERE DATE_FORMAT(appointment_date, "%Y-%m-%d") = ? AND time_slot = ? AND status != "Cancelled"',
      [appointment_date, time_slot]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'This time slot is already booked.' });
    }

    const [result] = await pool.query(
      'INSERT INTO appointments (public_id, customer_name, service, appointment_date, time_slot, email, contact, clinic, notes, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [public_id, customer_name, service, appointment_date, time_slot, email || null, contact || null, clinic || null, notes || null, user_id || null, status || 'Pending']
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  const { status, appointment_date, time_slot } = req.body;
  const updates = [];
  const values = [];
  if (status) { updates.push('status = ?'); values.push(status); }
  if (appointment_date) { updates.push('appointment_date = ?'); values.push(appointment_date); }
  if (time_slot) { updates.push('time_slot = ?'); values.push(time_slot); }
  
  if (updates.length === 0) return res.json({ success: true });
  
  values.push(req.params.id);
  try {
    await pool.query(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, values);
    
    // Auto-create order if status is Completed
    if (status === 'Completed') {
      const [apptRows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
      if (apptRows.length > 0) {
        const appt = apptRows[0];
        // Check if an order already exists for this appointment
        const [existingOrders] = await pool.query('SELECT * FROM orders WHERE appointment_id = ?', [appt.public_id]);
        if (existingOrders.length === 0) {
          const public_id = `ORD-${Date.now()}`;
          await pool.query(
            'INSERT INTO orders (public_id, client, product, qty, status, appointment_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [public_id, appt.customer_name, appt.service, 1, 'In Progress', appt.public_id, appt.user_id]
          );
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/appointments/:id/hide', async (req, res) => {
  try {
    await pool.query('UPDATE appointments SET is_hidden_by_user = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, delivery_method AS deliveryMethod, appointment_id AS appointmentId, user_id AS userId FROM orders ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { public_id, client_name, product, qty, address, status, notes } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO orders (public_id, client, product, qty, address, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [public_id, client_name, product, qty || 1, address || null, status || 'In Progress', notes || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { status, deliveryMethod, contact, address, notes } = req.body;
  const updates = [];
  const values = [];
  if (status) { updates.push('status = ?'); values.push(status); }
  if (deliveryMethod) { updates.push('delivery_method = ?'); values.push(deliveryMethod); }
  if (contact) { updates.push('contact = ?'); values.push(contact); }
  if (address !== undefined) { updates.push('address = ?'); values.push(address); }
  if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
  
  if (updates.length === 0) return res.json({ success: true });
  
  values.push(req.params.id);
  try {
    await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/orders/:id/hide', async (req, res) => {
  try {
    await pool.query('UPDATE orders SET is_hidden_by_user = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- USERS API ---
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, username, name FROM users WHERE role = 'user'");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- MESSAGES API ---
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, from_name AS `from`, created_at AS date FROM messages ORDER BY id DESC');
    // Attach replies to each message
    for (const msg of rows) {
      const [replies] = await pool.query(
        'SELECT *, from_name AS `from`, created_at AS date FROM message_replies WHERE message_id = ? ORDER BY id ASC',
        [msg.id]
      );
      msg.replies = replies;
    }
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { public_id, from_name, subject, body, user_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (public_id, from_name, subject, body, user_id) VALUES (?, ?, ?, ?, ?)',
      [public_id, from_name, subject || 'General Inquiry', body, user_id || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reply to a message
app.post('/api/messages/:id/replies', async (req, res) => {
  const { from_name, body } = req.body;
  const messageId = req.params.id;
  try {
    // Check message exists
    const [msgs] = await pool.query('SELECT id FROM messages WHERE id = ?', [messageId]);
    if (msgs.length === 0) return res.status(404).json({ error: 'Message not found' });

    const [result] = await pool.query(
      'INSERT INTO message_replies (message_id, from_name, body) VALUES (?, ?, ?)',
      [messageId, from_name, body]
    );
    // Mark message as unread so the other side sees notification
    await pool.query('UPDATE messages SET is_read = 0 WHERE id = ?', [messageId]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/messages/:id', async (req, res) => {
  const { is_read } = req.body; 
  try {
    if (is_read !== undefined) {
      await pool.query('UPDATE messages SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, req.params.id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/messages/:id/hide', async (req, res) => {
  try {
    await pool.query('UPDATE messages SET is_hidden_by_user = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
