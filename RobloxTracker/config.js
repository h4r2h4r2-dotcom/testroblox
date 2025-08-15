require("dotenv").config();

module.exports = {
    // Discord Bot Configuration
    DISCORD_TOKEN:
        process.env.DISCORD_TOKEN ||
        "MTQwNDY5NjA4Mjk5MDIzNTc5MQ.GVnoOJ.IyJPB2TMI-Pa0M4Yxud5SME3cEWT9CijRj_wsA",
    CLIENT_ID: process.env.CLIENT_ID || "1404696082990235791",
    GUILD_ID: process.env.GUILD_ID || null, // Optional: for guild-specific commands during development

    // Roblox Configuration
    DEFAULT_PLACE_ID: process.env.DEFAULT_PLACE_ID || "606849621",

    // API Configuration
    ROBLOX_API_BASE: "https://games.roblox.com",
    REQUEST_TIMEOUT: 10000, // 10 seconds
    MAX_RETRIES: 3,

    // Bot Settings
    MAX_SERVERS_TO_FETCH: 100, // Limit servers fetched per request to avoid rate limits
    CACHE_DURATION: 30000, // 30 seconds cache for API responses
};
