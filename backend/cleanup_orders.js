const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');
const User = require('./models/User');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database.");

        const username = 'yass';
        const user = await User.findOne({ username });
        
        if (!user) {
            console.error(`User ${username} not found.`);
            return;
        }

        console.log(`User ${username} found with ID: ${user._id}`);

        const orders = await Order.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(2);

        if (orders.length === 0) {
            console.log("No orders found to delete.");
            return;
        }

        const idsToDelete = orders.map(o => o._id);
        console.log(`Found ${orders.length} orders to delete: ${idsToDelete.join(', ')}`);

        const result = await Order.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`Successfully deleted ${result.deletedCount} orders.`);

    } catch (err) {
        console.error("Error during cleanup:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Database disconnected.");
    }
}

cleanup();
