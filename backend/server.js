const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ROOT TEST ROUTE
app.get("/", (req, res) => {
  res.send("EMS Backend Running");
});

//login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    // simple password check (for assignment - OK)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

//Employe Route
// create employee
app.post("/employees", (req, res) => {
  const { name, email, password, role, department } = req.body;

  const sql =
    "INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, email, password, role, department], (err, result) => {
    if (err) return res.json(err);

    res.json({
      message: "Employee added successfully",
      id: result.insertId
    });
  });
});

// get all employees
app.get("/employees", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, result) => {
    if (err) return res.json(err);

    res.json(result);
  });
});


app.get("/employees/:id", (req, res) => {
  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(result[0]);
  });
});
// update employee
app.put("/employees/:id", (req, res) => {
  const { name, email, role, department } = req.body;

  const sql =
    "UPDATE users SET name=?, email=?, role=?, department=? WHERE id=?";

  db.query(
    sql,
    [name, email, role, department, req.params.id],
    (err, result) => {
      if (err) return res.json(err);

      res.json({ message: "Employee updated successfully" });
    }
  );
});

// delete emplyee
app.delete("/employees/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json(err);

    res.json({ message: "Employee deleted successfully" });
  });
});

// USERS ROUTE
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.log("DB Error:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

//leave request route
// create leave request(employee view)
app.post("/leave", (req, res) => {
  const { user_id, leave_type, start_date, end_date } = req.body;

  const sql =
    "INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, status) VALUES (?, ?, ?, ?, 'pending')";

  db.query(sql, [user_id, leave_type, start_date, end_date], (err, result) => {
    if (err) return res.json(err);

    res.json({
      message: "Leave request submitted",
      id: result.insertId
    });
  });
});

// get all leave requests(admin view)
app.get("/leave", (req, res) => {
  const sql = `
    SELECT lr.*, u.name 
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.json(err);

    res.json(result);
  });
});

// update leave request status (admin view)
app.put("/leave/:id", (req, res) => {
  const { status } = req.body; // approved or rejected

  const sql = "UPDATE leave_requests SET status = ? WHERE id = ?";

  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.json(err);

    res.json({
      message: `Leave ${status} successfully`
    });
  });
});

// get leave request for a specific user (employee view)
app.get("/leave/:user_id", (req, res) => {
  const sql = "SELECT * FROM leave_requests WHERE user_id = ?";

  db.query(sql, [req.params.user_id], (err, result) => {
    if (err) return res.json(err);

    res.json(result);
  });
});

// START SERVER (KEEP AT BOTTOM)
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

