const redis = require("redis");

const client = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            // Check status, only retry every 30 seconds after 3 failed attempts
            if (retries > 3) {
                return 30000; 
            }
            return 2000;
        }
    }
});

client.on("error", (err) => {
    console.log("Redis Connection Alert:", err.message || err);
});

const connectRedis = async () => {
    try {
        await client.connect();
        console.log("Redis Connected Successfully");
    } catch (error) {
        console.log("Redis client not running. Caching will be disabled.");
    }
};

// Resilient API Wrapper to prevent app crashes when Redis is offline
const redisClient = {
    get: async (key) => {
        if (!client.isOpen) return null;
        try {
            return await client.get(key);
        } catch (err) {
            console.error("Redis GET bypass:", err.message || err);
            return null;
        }
    },
    set: async (key, value, options) => {
        if (!client.isOpen) return;
        try {
            await client.set(key, value, options);
        } catch (err) {
            console.error("Redis SET bypass:", err.message || err);
        }
    },
    del: async (key) => {
        if (!client.isOpen) return;
        try {
            await client.del(key);
        } catch (err) {
            console.error("Redis DEL bypass:", err.message || err);
        }
    }
};

module.exports = {
    redisClient,
    connectRedis,
};