const API_URL = 'http://localhost:5000/api';

// DB Access API Wrapper over Express Backend
export const mockDb = {
  // Read All records from a table
  async getAll(table) {
    try {
      const res = await fetch(`${API_URL}/${table}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Get single record by ID
  async getById(table, id) {
    try {
      const res = await fetch(`${API_URL}/${table}/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Insert a new record
  async insert(table, record, userId = 'system') {
    try {
      const res = await fetch(`${API_URL}/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(record)
      });
      if (!res.ok) throw new Error('Failed to insert');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Update an existing record
  async update(table, id, updates, userId = 'system') {
    try {
      const res = await fetch(`${API_URL}/${table}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Delete a record
  async delete(table, id, userId = 'system') {
    try {
      const res = await fetch(`${API_URL}/${table}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Export Backup
  async exportBackup() {
    try {
      const res = await fetch(`${API_URL}/system/export`);
      const data = await res.json();
      return JSON.stringify(data, null, 2);
    } catch (e) {
      console.error(e);
      return '{}';
    }
  },

  // Import Backup
  async restoreBackup(backupJsonString, userId = 'system') {
    try {
      const data = JSON.parse(backupJsonString);
      const res = await fetch(`${API_URL}/system/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
