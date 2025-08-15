const axios = require("axios");
const config = require("../config.js");

class RobloxAPI {
    constructor() {
        this.cache = new Map();
        this.axiosInstance = axios.create({
            baseURL: config.ROBLOX_API_BASE,
            timeout: config.REQUEST_TIMEOUT,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Accept: "application/json",
            },
        });

        // Add response interceptor for better error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    // Server responded with error status
                    throw new Error(
                        `Roblox API Error: ${error.response.status} - ${error.response.statusText}`,
                    );
                } else if (error.request) {
                    // Request was made but no response received
                    throw new Error(
                        "Roblox API'ye ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.",
                    );
                } else {
                    // Something else happened
                    throw new Error(`İstek hatası: ${error.message}`);
                }
            },
        );
    }

    /**
     * Get all servers for a specific place ID
     * @param {string} placeId - The Roblox place ID
     * @param {string} cursor - Pagination cursor (optional)
     * @returns {Promise<Object>} Server data with pagination info
     */
    async getServers(placeId, cursor = null) {
        const cacheKey = `servers_${placeId}_${cursor || "first"}`;

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < config.CACHE_DURATION) {
                return cached.data;
            }
        }

        try {
            const url = `/v1/games/${placeId}/servers/Public`;
            const params = {
                sortOrder: "Desc",
                limit: config.MAX_SERVERS_TO_FETCH,
            };

            if (cursor) {
                params.cursor = cursor;
            }

            console.log(
                `Fetching servers for Place ID: ${placeId}${cursor ? ` (cursor: ${cursor})` : ""}`,
            );

            const response = await this.axiosInstance.get(url, { params });

            if (!response.data || !response.data.data) {
                throw new Error("Geçersiz API yanıtı alındı");
            }

            // Cache the result
            this.cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now(),
            });

            return response.data;
        } catch (error) {
            // Handle specific Roblox API errors
            if (error.message.includes("400")) {
                throw new Error(`Geçersiz Place ID: ${placeId}`);
            } else if (error.message.includes("404")) {
                throw new Error(`Place ID bulunamadı: ${placeId}`);
            } else if (error.message.includes("429")) {
                throw new Error(
                    "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
                );
            } else if (error.message.includes("503")) {
                throw new Error(
                    "Roblox API şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
                );
            }

            throw error;
        }
    }

    /**
     * Get all servers for a specific place ID (limited to prevent excessive API calls)
     * @param {string} placeId - The Roblox place ID
     * @returns {Promise<Array>} Array of all servers
     */
    async getAllServers(placeId) {
        let cursor = null;
        let attempts = 0;
        const maxAttempts = 5; // Limit to prevent too many API calls
        const maxServers = 100; // Maximum 100 servers to return
        const allServers = [];

        console.log(
            `Fetching all servers for Place ID: ${placeId} (max ${maxServers})`,
        );

        while (attempts < maxAttempts && allServers.length < maxServers) {
            try {
                const serversData = await this.getServers(placeId, cursor);

                if (!serversData.data || serversData.data.length === 0) {
                    console.log("No more servers to fetch");
                    break;
                }

                console.log(
                    `Fetched ${serversData.data.length} servers (page ${attempts + 1})`,
                );

                // Add servers to our collection (up to maxServers limit)
                serversData.data.forEach((server) => {
                    if (allServers.length < maxServers) {
                        allServers.push({
                            id: server.id,
                            playing: server.playing || 0,
                            maxPlayers: server.maxPlayers || 0,
                            fps: server.fps || null,
                            ping: server.ping || null,
                            playerTokens: server.playerTokens || [],
                        });
                    }
                });

                // Check if there are more pages
                cursor = serversData.nextPageCursor;
                if (!cursor) {
                    console.log("No more pages available");
                    break;
                }

                attempts++;

                // Small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 150));
            } catch (error) {
                console.error(
                    `Error on attempt ${attempts + 1}:`,
                    error.message,
                );

                // If it's a rate limit error, wait longer and retry
                if (error.message.includes("429")) {
                    if (attempts < config.MAX_RETRIES) {
                        console.log("Rate limited, waiting before retry...");
                        await new Promise((resolve) =>
                            setTimeout(resolve, 3000),
                        );
                        continue;
                    }
                }

                throw error;
            }
        }

        console.log(
            `Fetched total of ${allServers.length} servers for Place ID: ${placeId}`,
        );
        return allServers;
    }

    /**
     * Find a specific server by Job ID
     * @param {string} placeId - The Roblox place ID
     * @param {string} targetJobId - The Job ID to find
     * @returns {Promise<Object|null>} Server info or null if not found
     */
    async getServerByJobId(placeId, targetJobId) {
        let cursor = null;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops

        console.log(
            `Searching for Job ID: ${targetJobId} in Place ID: ${placeId}`,
        );

        while (attempts < maxAttempts) {
            try {
                const serversData = await this.getServers(placeId, cursor);

                if (!serversData.data || serversData.data.length === 0) {
                    console.log("No more servers to check");
                    break;
                }

                console.log(
                    `Checking ${serversData.data.length} servers (attempt ${attempts + 1})`,
                );

                // Search through current page of servers
                for (const server of serversData.data) {
                    if (server.id === targetJobId) {
                        console.log(`Found server with Job ID: ${targetJobId}`);
                        return {
                            id: server.id,
                            playing: server.playing || 0,
                            maxPlayers: server.maxPlayers || 0,
                            fps: server.fps || null,
                            ping: server.ping || null,
                            playerTokens: server.playerTokens || [],
                        };
                    }
                }

                // Check if there are more pages
                cursor = serversData.nextPageCursor;
                if (!cursor) {
                    console.log("No more pages to check");
                    break;
                }

                attempts++;

                // Small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
                console.error(
                    `Error on attempt ${attempts + 1}:`,
                    error.message,
                );

                // If it's a rate limit error, wait longer and retry
                if (error.message.includes("429")) {
                    if (attempts < config.MAX_RETRIES) {
                        console.log("Rate limited, waiting before retry...");
                        await new Promise((resolve) =>
                            setTimeout(resolve, 2000),
                        );
                        continue;
                    }
                }

                throw error;
            }
        }

        console.log(
            `Job ID ${targetJobId} not found after checking ${attempts} pages`,
        );
        return null;
    }

    /**
     * Get basic game information
     * @param {string} placeId - The Roblox place ID
     * @returns {Promise<Object>} Game information
     */
    async getGameInfo(placeId) {
        const cacheKey = `gameinfo_${placeId}`;

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < config.CACHE_DURATION * 10) {
                // Cache game info longer
                return cached.data;
            }
        }

        try {
            // This endpoint might require universe ID, but we'll try with place ID first
            const response = await this.axiosInstance.get(
                `/v1/games/${placeId}`,
            );

            if (response.data && response.data.data) {
                const gameData = response.data.data[0];

                // Cache the result
                this.cache.set(cacheKey, {
                    data: gameData,
                    timestamp: Date.now(),
                });

                return gameData;
            }

            return null;
        } catch (error) {
            console.warn(
                `Could not fetch game info for place ${placeId}:`,
                error.message,
            );
            return null;
        }
    }

    /**
     * Clear cache (useful for testing or memory management)
     */
    clearCache() {
        this.cache.clear();
        console.log("API cache cleared");
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

module.exports = new RobloxAPI();
