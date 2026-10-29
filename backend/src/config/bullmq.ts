/**
 * BullMQ connection configuration.
 *
 * BullMQ internally uses ioredis and requires a plain
 * connection-options object (host/port/password), NOT the
 * `redis` npm client instance used elsewhere in the app.
 */

function parseBullmqConnection() {
    const url = process.env.REDIS_URL;
    if (!url) {
        throw new Error("REDIS_URL is not defined");
    }

    // Parse redis://[:password@]host[:port][/db]
    const parsed = new URL(url);

    return {
        host: parsed.hostname || "127.0.0.1",
        port: parsed.port ? parseInt(parsed.port, 10) : 6379,
        password: parsed.password || undefined,
        db: parsed.pathname && parsed.pathname.length > 1
            ? parseInt(parsed.pathname.slice(1), 10)
            : 0,
        // Keep connections alive across idle periods
        maxRetriesPerRequest: null,
    };
}

export const bullmqConnection = parseBullmqConnection();
