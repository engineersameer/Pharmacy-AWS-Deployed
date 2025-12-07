const pool = require('../config/database');

class Order {
  // Find order by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT o.*, c.name as customerName, c.phone as customerPhone, c.city as customerCity, c.IsAdmin as customerIsAdmin
         FROM orders o
         LEFT JOIN customers c ON o.userId = c.id
         WHERE o.id = ?`,
        [id]
      );
      if (rows[0]) {
        return this.formatOrder(rows[0]);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Find orders with conditions
  static async find(conditions = {}) {
    try {
      let query = `
        SELECT o.*, c.name as customerName, c.phone as customerPhone, c.city as customerCity, c.IsAdmin as customerIsAdmin
        FROM orders o
        LEFT JOIN customers c ON o.userId = c.id
      `;
      const params = [];
      const conditionsArray = [];

      if (conditions.userId) {
        conditionsArray.push('o.userId = ?');
        params.push(conditions.userId);
      }
      if (conditions.status) {
        conditionsArray.push('o.status = ?');
        params.push(conditions.status);
      }

      if (conditionsArray.length > 0) {
        query += ' WHERE ' + conditionsArray.join(' AND ');
      }

      // Handle sort
      if (conditions.sort) {
        if (conditions.sort === '-createdAt' || 
            (typeof conditions.sort === 'object' && conditions.sort.createdAt === -1)) {
          query += ' ORDER BY o.createdAt DESC';
        } else if (conditions.sort === 'createdAt' || 
                   (typeof conditions.sort === 'object' && conditions.sort.createdAt === 1)) {
          query += ' ORDER BY o.createdAt ASC';
        } else {
          query += ' ORDER BY o.createdAt DESC';
        }
      } else {
        query += ' ORDER BY o.createdAt DESC';
      }

      const [rows] = await pool.execute(query, params);
      return rows.map(row => this.formatOrder(row));
    } catch (error) {
      throw error;
    }
  }

  // Create new order
  static async create(data) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO orders (receiverName, phone, address, filePath, status, userId) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.receiverName,
          data.phone,
          data.address,
          data.filePath,
          data.status || 'pending',
          data.userId
        ]
      );

      // Return the created order with populated user data
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Update order
  static async findByIdAndUpdate(id, updateData, options = {}) {
    try {
      const updates = [];
      const params = [];

      if (updateData.receiverName !== undefined) {
        updates.push('receiverName = ?');
        params.push(updateData.receiverName);
      }
      if (updateData.phone !== undefined) {
        updates.push('phone = ?');
        params.push(updateData.phone);
      }
      if (updateData.address !== undefined) {
        updates.push('address = ?');
        params.push(updateData.address);
      }
      if (updateData.filePath !== undefined) {
        updates.push('filePath = ?');
        params.push(updateData.filePath);
      }
      if (updateData.status !== undefined) {
        updates.push('status = ?');
        params.push(updateData.status);
      }
      if (updateData.userId !== undefined) {
        updates.push('userId = ?');
        params.push(updateData.userId);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      params.push(id);
      await pool.execute(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
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

  // Delete order
  static async deleteOne(conditions) {
    try {
      const orderId = conditions._id || conditions.id;
      if (orderId) {
        const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [orderId]);
        return result.affectedRows > 0;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  // Format order to match Mongoose format with populated userId
  static formatOrder(row) {
    const order = {
      id: row.id,
      _id: row.id, // For compatibility
      receiverName: row.receiverName,
      phone: row.phone,
      address: row.address,
      filePath: row.filePath,
      status: row.status,
      userId: row.userId, // Keep raw userId
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    // If customer data is joined, add it as populated userId (Mongoose-style)
    if (row.customerName) {
      order.userId = {
        _id: row.userId,
        id: row.userId,
        name: row.customerName,
        phone: row.customerPhone,
        city: row.customerCity,
        IsAdmin: row.customerIsAdmin
      };
    }

    return order;
  }
}

module.exports = Order;
