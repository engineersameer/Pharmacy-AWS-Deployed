const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Customer {
  // Find customer by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, age, gender, phone, address, city, IsAdmin, createdAt, updatedAt FROM customers WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find customer by phone
  static async findOne(conditions, select = '-password') {
    try {
      let query = 'SELECT ';
      
      // Handle select parameter
      if (select === '-password' || (typeof select === 'string' && select.includes('-password'))) {
        query += 'id, name, age, gender, phone, address, city, IsAdmin, createdAt, updatedAt ';
      } else if (select === '+password' || (typeof select === 'string' && select.includes('+password'))) {
        query += '* ';
      } else {
        query += '* ';
      }
      
      query += 'FROM customers WHERE ';
      const params = [];
      const conditionsArray = [];

      if (conditions.phone) {
        conditionsArray.push('phone = ?');
        params.push(conditions.phone);
      }
      if (conditions._id) {
        conditionsArray.push('id = ?');
        params.push(conditions._id);
      }
      if (conditions.id) {
        conditionsArray.push('id = ?');
        params.push(conditions.id);
      }
      if (conditions.IsAdmin !== undefined) {
        conditionsArray.push('IsAdmin = ?');
        params.push(conditions.IsAdmin);
      }
      if (conditions._id && conditions.phone) {
        // Handle $ne (not equal) for phone check
        const phoneIndex = conditionsArray.findIndex(c => c.includes('phone'));
        if (phoneIndex !== -1 && conditions._id) {
          conditionsArray[phoneIndex] = 'phone = ? AND id != ?';
          params[0] = conditions.phone;
          params[1] = conditions._id;
        }
      }

      query += conditionsArray.join(' AND ');
      const [rows] = await pool.execute(query, params);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find all customers with optional conditions
  static async find(conditions = {}, select = '-password') {
    try {
      let query = 'SELECT ';
      
      if (select === '-password' || select.includes('-password')) {
        query += 'id, name, age, gender, phone, address, city, IsAdmin, createdAt, updatedAt ';
      } else if (select === '+password' || select.includes('+password')) {
        query += '* ';
      } else {
        query += select.replace(/[+-]/g, '').replace(/\s+/g, ', ') || '* ';
      }
      
      query += 'FROM customers';
      const params = [];

      if (Object.keys(conditions).length > 0) {
        const conditionsArray = [];
        if (conditions.phone) {
          conditionsArray.push('phone = ?');
          params.push(conditions.phone);
        }
        if (conditions.IsAdmin !== undefined) {
          conditionsArray.push('IsAdmin = ?');
          params.push(conditions.IsAdmin);
        }
        if (conditionsArray.length > 0) {
          query += ' WHERE ' + conditionsArray.join(' AND ');
        }
      }

      query += ' ORDER BY createdAt DESC';
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new customer
  static async create(data) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const [result] = await pool.execute(
        `INSERT INTO customers (name, age, gender, phone, address, city, password, IsAdmin) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.age,
          data.gender,
          data.phone,
          data.address,
          data.city,
          hashedPassword,
          data.IsAdmin || false
        ]
      );

      // Return the created customer
      const customer = await this.findById(result.insertId);
      return customer;
    } catch (error) {
      throw error;
    }
  }

  // Update customer
  static async findByIdAndUpdate(id, updateData, options = {}) {
    try {
      const updates = [];
      const params = [];

      if (updateData.name !== undefined) {
        updates.push('name = ?');
        params.push(updateData.name);
      }
      if (updateData.age !== undefined) {
        updates.push('age = ?');
        params.push(updateData.age);
      }
      if (updateData.gender !== undefined) {
        updates.push('gender = ?');
        params.push(updateData.gender);
      }
      if (updateData.phone !== undefined) {
        updates.push('phone = ?');
        params.push(updateData.phone);
      }
      if (updateData.address !== undefined) {
        updates.push('address = ?');
        params.push(updateData.address);
      }
      if (updateData.city !== undefined) {
        updates.push('city = ?');
        params.push(updateData.city);
      }
      if (updateData.password !== undefined) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateData.password, salt);
        updates.push('password = ?');
        params.push(hashedPassword);
      }
      if (updateData.IsAdmin !== undefined) {
        updates.push('IsAdmin = ?');
        params.push(updateData.IsAdmin);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      params.push(id);
      await pool.execute(
        `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      if (options.new !== false) {
        return await this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Delete customer
  static async findByIdAndDelete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
      return result.affectedRows > 0 ? { _id: id } : null;
    } catch (error) {
      throw error;
    }
  }

  // Compare password (static method)
  static async comparePassword(candidatePassword, hashedPassword) {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Customer;
