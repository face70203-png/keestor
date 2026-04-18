const mongoose = require('mongoose');
require('dotenv').config();
const Setting = require('./models/Setting');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Setting.countDocuments();
    console.log(`Found ${count} settings documents.`);
    
    if (count > 1) {
        console.log('Cleaning up duplicate settings...');
        const latest = await Setting.findOne().sort({ updatedAt: -1 });
        await Setting.deleteMany({ _id: { $ne: latest._id } });
        console.log('Duplicates removed.');
    }
    
    const final = await Setting.findOne();
    console.log('Current Settings:', JSON.stringify(final, null, 2));
    process.exit();
}

fix();
