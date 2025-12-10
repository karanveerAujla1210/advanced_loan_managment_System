// MongoDB Migration System
const mongoose = require('mongoose');

class Migration {
  constructor(name, up, down) {
    this.name = name;
    this.up = up;
    this.down = down;
    this.timestamp = new Date();
  }
}

// Migration Schema
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  executedAt: { type: Date, default: Date.now }
});

const MigrationModel = mongoose.model('Migration', migrationSchema);

class MigrationRunner {
  constructor() {
    this.migrations = [];
  }

  addMigration(name, up, down) {
    this.migrations.push(new Migration(name, up, down));
    return this;
  }

  async runMigrations() {
    try {
      // Get executed migrations
      const executedMigrations = await MigrationModel.find({}).sort({ executedAt: 1 });
      const executedNames = executedMigrations.map(m => m.name);

      // Find pending migrations
      const pendingMigrations = this.migrations.filter(m => !executedNames.includes(m.name));

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }

      console.log(`🔄 Running ${pendingMigrations.length} migrations...`);

      for (const migration of pendingMigrations) {
        console.log(`⏳ Running migration: ${migration.name}`);
        
        try {
          await migration.up();
          
          // Record migration as executed
          await MigrationModel.create({ name: migration.name });
          
          console.log(`✅ Completed migration: ${migration.name}`);
        } catch (error) {
          console.error(`❌ Failed migration: ${migration.name}`, error);
          throw error;
        }
      }

      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async rollbackMigration(migrationName) {
    try {
      const migration = this.migrations.find(m => m.name === migrationName);
      if (!migration) {
        throw new Error(`Migration ${migrationName} not found`);
      }

      const executedMigration = await MigrationModel.findOne({ name: migrationName });
      if (!executedMigration) {
        throw new Error(`Migration ${migrationName} has not been executed`);
      }

      console.log(`⏳ Rolling back migration: ${migrationName}`);
      
      await migration.down();
      await MigrationModel.deleteOne({ name: migrationName });
      
      console.log(`✅ Rolled back migration: ${migrationName}`);
    } catch (error) {
      console.error(`❌ Rollback failed for ${migrationName}:`, error);
      throw error;
    }
  }

  async getStatus() {
    const executedMigrations = await MigrationModel.find({}).sort({ executedAt: 1 });
    const executedNames = executedMigrations.map(m => m.name);
    
    console.log('\n📊 Migration Status:');
    console.log('==================');
    
    this.migrations.forEach(migration => {
      const status = executedNames.includes(migration.name) ? '✅ Executed' : '⏳ Pending';
      console.log(`${status} - ${migration.name}`);
    });
    
    return {
      total: this.migrations.length,
      executed: executedNames.length,
      pending: this.migrations.length - executedNames.length
    };
  }
}

// Define migrations
const migrationRunner = new MigrationRunner();

// Migration 1: Add indexes
migrationRunner.addMigration(
  '001_add_indexes',
  async () => {
    const createIndexes = require('./indexes');
    await createIndexes();
  },
  async () => {
    // Drop all custom indexes (keep _id)
    const db = mongoose.connection.db;
    const collections = ['users', 'branches', 'borrowers', 'loanproducts', 'loans', 'payments', 'instalments'];
    
    for (const collection of collections) {
      const indexes = await db.collection(collection).indexes();
      for (const index of indexes) {
        if (index.name !== '_id_') {
          await db.collection(collection).dropIndex(index.name);
        }
      }
    }
  }
);

// Migration 2: Add default loan statuses
migrationRunner.addMigration(
  '002_update_loan_statuses',
  async () => {
    const Loan = require('../server/src/models/Loan');
    
    // Update any loans without status
    await Loan.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'PENDING' } }
    );
    
    // Update any loans with old status values
    await Loan.updateMany(
      { status: 'APPROVED_PENDING_DISBURSEMENT' },
      { $set: { status: 'APPROVED' } }
    );
  },
  async () => {
    // Rollback - revert status changes if needed
    console.log('Rollback: No action needed for loan status migration');
  }
);

// Migration 3: Add DPD calculation fields
migrationRunner.addMigration(
  '003_add_dpd_fields',
  async () => {
    const Loan = require('../server/src/models/Loan');
    
    // Add DPD and overdue amount fields to existing loans
    await Loan.updateMany(
      { dpd: { $exists: false } },
      { 
        $set: { 
          dpd: 0,
          overdueAmount: 0,
          lastPaymentDate: null
        } 
      }
    );
  },
  async () => {
    const Loan = require('../server/src/models/Loan');
    
    // Remove DPD fields
    await Loan.updateMany(
      {},
      { 
        $unset: { 
          dpd: "",
          overdueAmount: "",
          lastPaymentDate: ""
        } 
      }
    );
  }
);

// Migration 4: Add borrower KYC status
migrationRunner.addMigration(
  '004_add_kyc_status',
  async () => {
    const Borrower = require('../server/src/models/Borrower');
    
    // Add KYC status to existing borrowers
    await Borrower.updateMany(
      { kycStatus: { $exists: false } },
      { $set: { kycStatus: 'PENDING' } }
    );
  },
  async () => {
    const Borrower = require('../server/src/models/Borrower');
    
    // Remove KYC status field
    await Borrower.updateMany(
      {},
      { $unset: { kycStatus: "" } }
    );
  }
);

module.exports = migrationRunner;