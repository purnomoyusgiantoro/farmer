import { supabase } from './supabaseClient';

// DB Access API Wrapper over Supabase
export const mockDb = {
  // Read All records from a table
  async getAll(table) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Get single record by ID
  async getById(table, id) {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Insert a new record
  async insert(table, record, userId = 'system') {
    try {
      const { data, error } = await supabase.from(table).insert([record]).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Update an existing record
  async update(table, id, updates, userId = 'system') {
    try {
      const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Delete a record
  async delete(table, id, userId = 'system') {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Export Backup
  async exportBackup() {
    return JSON.stringify({ message: 'Gunakan fitur backup di Dashboard Supabase' }, null, 2);
  },

  // Import Backup
  async restoreBackup(backupJsonString, userId = 'system') {
    return { success: false, message: 'Restore melalui aplikasi tidak didukung, gunakan Supabase SQL Editor' };
  }
};
