const mongoose = require('mongoose');
require('dotenv').config();

async function checkAllCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n=== ALL COLLECTIONS ===');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }

    // Check specifically for loan-related collections
    const loanCollections = collections.filter(c => 
      c.name.toLowerCase().includes('loan') || 
      c.name.toLowerCase().includes('disburs') ||
      c.name.toLowerCase().includes('case')
    );

    if (loanCollections.length > 0) {
      console.log('\n=== LOAN-RELATED COLLECTIONS ===');
      for (const collection of loanCollections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`${collection.name}: ${count} documents`);
        
        if (count > 0) {
          const sample = await db.collection(collection.name).findOne();
          console.log(`Sample document from ${collection.name}:`, Object.keys(sample));
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAllCollections();