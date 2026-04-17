const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const defaultSteps = `1. Authenticate your account on the target platform.
2. Navigate to the 'Redemptions' or 'Licenses' tab.
3. Paste the cryptographic License Key exactly as shown above.
4. If this is a visual asset (QR/eSIM), scan it using your device camera.
5. Once applied, restart your application to finalize synchronization.`;

async function updateAllProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        // Match products where activationSteps is empty string or doesn't exist
        const result = await Product.updateMany(
            { $or: [ { activationSteps: "" }, { activationSteps: { $exists: false } } ] },
            { $set: { activationSteps: defaultSteps } }
        );
        
        console.log(`Updated ${result.modifiedCount} products with default activation steps.`);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

updateAllProducts();
