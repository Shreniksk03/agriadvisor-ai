import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠ Supabase credentials not configured. Using in-memory fallback store.');
}

let supabase = null;
if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// ─── In-Memory Fallback Store ────────────────────────────────────────────────
// Provides a fully functional data layer when Supabase is not configured.
// This allows the application to run standalone for development and demos.
const memoryStore = {
  users: [],
  fields: [],
  advisories: [],
  agent_execution_logs: [],
  policy_configurations: [
    {
      id: 'default-policy-001',
      policy_name: 'Default Yield Protection',
      risk_threshold: 65,
      auto_intervention_limit: 500.00,
      escalation_threshold: 80,
    },
  ],
};

// Seed demo fields
const demoFields = [
  { id: 'FLD-2026-001', owner_name: 'Green Valley Farm', crop_type: 'Wheat', historical_yield_score: 88.50, coordinates_hash: 'a1b2c3' },
  { id: 'FLD-2026-002', owner_name: 'Sunrise Acres', crop_type: 'Corn', historical_yield_score: 76.20, coordinates_hash: 'd4e5f6' },
  { id: 'FLD-2026-003', owner_name: 'River Bend Ranch', crop_type: 'Soybean', historical_yield_score: 91.00, coordinates_hash: 'g7h8i9' },
  { id: 'FLD-2026-004', owner_name: 'Prairie Wind Farm', crop_type: 'Rice', historical_yield_score: 69.80, coordinates_hash: 'j0k1l2' },
  { id: 'FLD-2026-005', owner_name: 'Cotton Ridge Estate', crop_type: 'Cotton', historical_yield_score: 82.30, coordinates_hash: 'm3n4o5' },
];
memoryStore.fields = [...demoFields];

/**
 * Database adapter - wraps Supabase or in-memory store with a unified API
 */
export const db = {
  /**
   * Query records from a table
   */
  async from(table) {
    if (supabase) {
      try {
        return supabase.from(table);
      } catch (e) {
        console.warn(`Supabase query builder fallback for ${table}:`, e.message);
      }
    }
    return createMemoryQueryBuilder(table);
  },

  /**
   * Direct insert helper
   */
  async insert(table, data) {
    if (supabase) {
      try {
        const { data: result, error } = await supabase.from(table).insert(data).select();
        if (!error && result) return result;
        console.warn(`Supabase insert failed (${error?.message}), falling back to memory store`);
      } catch (e) {
        console.warn(`Supabase insert error (${e.message}), falling back to memory store`);
      }
    }
    const records = Array.isArray(data) ? data : [data];
    records.forEach((record) => {
      if (!record.id) {
        record.id = crypto.randomUUID();
      }
      if (!record.created_at) {
        record.created_at = new Date().toISOString();
      }
      if (!memoryStore[table]) memoryStore[table] = [];
      memoryStore[table].push({ ...record });
    });
    return records;
  },

  /**
   * Select records with optional filters
   */
  async select(table, filters = {}, options = {}) {
    if (supabase) {
      try {
        let query = supabase.from(table).select(options.columns || '*');
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        if (options.order) {
          query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }
        const { data, error } = await query;
        if (!error && data) return data;
        console.warn(`Supabase select failed (${error?.message}), falling back to memory store`);
      } catch (e) {
        console.warn(`Supabase select error (${e.message}), falling back to memory store`);
      }
    }
    // In-memory select
    let records = [...(memoryStore[table] || [])];
    Object.entries(filters).forEach(([key, value]) => {
      records = records.filter((r) => r[key] === value);
    });
    if (options.order) {
      const { column, ascending = false } = options.order;
      records.sort((a, b) => {
        if (ascending) return a[column] > b[column] ? 1 : -1;
        return a[column] < b[column] ? 1 : -1;
      });
    }
    if (options.limit) {
      records = records.slice(0, options.limit);
    }
    return records;
  },

  /**
   * Update records
   */
  async update(table, id, data) {
    if (supabase) {
      try {
        const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
        if (!error && result) return result;
        console.warn(`Supabase update failed (${error?.message}), falling back to memory store`);
      } catch (e) {
        console.warn(`Supabase update error (${e.message}), falling back to memory store`);
      }
    }
    const store = memoryStore[table] || [];
    const index = store.findIndex((r) => r.id === id);
    if (index === -1) {
      // If not found in memory store, create it
      const newRecord = { id, ...data, updated_at: new Date().toISOString() };
      if (!memoryStore[table]) memoryStore[table] = [];
      memoryStore[table].push(newRecord);
      return [newRecord];
    }
    store[index] = { ...store[index], ...data };
    return [store[index]];
  },

  /**
   * Get single record by ID
   */
  async getById(table, id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
        if (!error && data) return data;
        console.warn(`Supabase getById failed (${error?.message}), falling back to memory store`);
      } catch (e) {
        console.warn(`Supabase getById error (${e.message}), falling back to memory store`);
      }
    }
    const record = (memoryStore[table] || []).find((r) => r.id === id);
    return record || null;
  },

  /** Direct access to in-memory store for seeding */
  _store: memoryStore,
};

function createMemoryQueryBuilder(table) {
  let _filters = {};
  let _order = null;
  let _limit = null;

  const builder = {
    select(columns = '*') {
      return {
        eq(key, value) {
          _filters[key] = value;
          return this;
        },
        order(column, opts) {
          _order = { column, ...opts };
          return this;
        },
        limit(n) {
          _limit = n;
          return this;
        },
        single() {
          const records = applyFilters();
          return { data: records[0] || null, error: null };
        },
        then(resolve) {
          const records = applyFilters();
          resolve({ data: records, error: null });
        },
      };
    },
    insert(data) {
      return {
        select() {
          return {
            then(resolve) {
              const records = Array.isArray(data) ? data : [data];
              records.forEach((r) => {
                if (!r.id) r.id = crypto.randomUUID();
                if (!r.created_at) r.created_at = new Date().toISOString();
                memoryStore[table].push({ ...r });
              });
              resolve({ data: records, error: null });
            },
          };
        },
      };
    },
    update(data) {
      return {
        eq(key, value) {
          const store = memoryStore[table] || [];
          const idx = store.findIndex((r) => r[key] === value);
          if (idx !== -1) store[idx] = { ...store[idx], ...data };
          return {
            select() {
              return {
                then(resolve) {
                  resolve({ data: idx !== -1 ? [store[idx]] : [], error: null });
                },
              };
            },
          };
        },
      };
    },
  };

  function applyFilters() {
    let records = [...(memoryStore[table] || [])];
    Object.entries(_filters).forEach(([k, v]) => {
      records = records.filter((r) => r[k] === v);
    });
    if (_order) {
      records.sort((a, b) => {
        if (_order.ascending) return a[_order.column] > b[_order.column] ? 1 : -1;
        return a[_order.column] < b[_order.column] ? 1 : -1;
      });
    }
    if (_limit) records = records.slice(0, _limit);
    return records;
  }

  return builder;
}

export default db;
