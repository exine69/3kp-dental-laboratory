import mysql from 'mysql2/promise';

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Feb2024100514',
      database: '3kp_dental_laboratory'
    });

    console.log("Adding is_hidden_by_user to orders...");
    try {
      await connection.query('ALTER TABLE orders ADD COLUMN is_hidden_by_user TINYINT(1) DEFAULT 0');
    } catch(e) { console.log("Column may already exist or error: " + e.message); }

    console.log("Adding is_hidden_by_user to appointments...");
    try {
      await connection.query('ALTER TABLE appointments ADD COLUMN is_hidden_by_user TINYINT(1) DEFAULT 0');
    } catch(e) { console.log("Column may already exist or error: " + e.message); }

    console.log("Adding is_hidden_by_user to messages...");
    try {
      await connection.query('ALTER TABLE messages ADD COLUMN is_hidden_by_user TINYINT(1) DEFAULT 0');
    } catch(e) { console.log("Column may already exist or error: " + e.message); }

    console.log("Removing email column from appointments...");
    try {
      await connection.query('ALTER TABLE appointments DROP COLUMN email');
    } catch(e) { console.log("Column may already be deleted or error: " + e.message); }

    console.log("Updating orders status ENUM...");
    try {
      // Step 1: Add all new statuses plus old ones to avoid truncation
      await connection.query("ALTER TABLE orders MODIFY COLUMN status ENUM('In Progress','Ready','In Transit','Completed','Delivered','Cancelled') DEFAULT 'In Progress'");
      // Step 2: Update old values
      await connection.query("UPDATE orders SET status = 'Completed' WHERE status = 'Delivered'");
      // Step 3: Remove old value from ENUM
      await connection.query("ALTER TABLE orders MODIFY COLUMN status ENUM('In Progress','Ready','In Transit','Completed','Cancelled') DEFAULT 'In Progress'");
    } catch(e) { console.log("Failed to update ENUM: " + e.message); }

    console.log("Success! You can now restart your server.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
run();
