import config from './src/config/config.js';
import app from './src/app.js';
import connectDB from './src/config/database.js';

const callback = () => {
    console.log(`Server is running on port ${config.PORT}`);
};

const startServer = async () => {
    try {
        await connectDB();
        app.listen(config.PORT, callback);
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

