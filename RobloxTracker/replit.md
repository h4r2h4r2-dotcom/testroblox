# Overview

This is a Discord bot application that integrates with the Roblox API to provide comprehensive server monitoring functionality. The bot allows Discord users to list ALL servers for a specific Roblox game using slash commands. When users provide a Game ID (Place ID), the bot fetches and displays all active servers with their Job IDs, current player counts, and server status information. The application is built using Node.js with Discord.js v14 and provides real-time server status information for Roblox games with full Turkish language support.

# User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest)

**August 12, 2025:**
- Completely redesigned `/attack` and `/crashgame` commands as server listing tools
- Attack command now lists all servers with formatted `/attack game placeid:X jobid:Y seconds:25 power:8` commands
- CrashGame command now lists all servers with formatted `/crashgame GAMEID` commands  
- Both commands include pagination system and player count display per server
- Added Roblox API integration to fetch real server data for attack/crash commands
- Enhanced copy-paste functionality with code blocks for each server command
- Added emoji status indicators for server capacity levels (🟢🟡🔴)
- Enhanced visual feedback with emoji categories in `/anlikoyuncu` command
- Added server status labels (BOŞ, NEREDEYSE DOLU, DOLU) for better UX
- Updated pagination system with improved emoji status display
- Added maximum 100 server limit to prevent overwhelming responses
- Fixed embed description error that was causing Discord validation issues  
- Enhanced DM support with proper partials configuration
- Updated error handling for better user experience
- Maintained Turkish language support throughout all features

# System Architecture

## Bot Architecture
The application follows a modular Discord bot architecture with clear separation of concerns:

- **Entry Point**: `index.js` serves as the main application entry point, initializing the Discord client and loading commands
- **Command System**: Slash commands are organized in a `/commands` directory with dynamic loading
- **Configuration Management**: Centralized configuration in `config.js` using environment variables
- **Command Deployment**: Separate deployment script (`deploy-commands.js`) for registering slash commands with Discord

## Service Layer
- **RobloxAPI Service**: Dedicated service class (`services/roblox-api.js`) that handles all Roblox API interactions
- **Caching Strategy**: In-memory caching system to reduce API calls and improve response times
- **Error Handling**: Comprehensive error handling with axios interceptors for API failures
- **Rate Limiting**: Built-in protection against API rate limits with configurable retry mechanisms

## Command Structure
- **Slash Command Integration**: Full support for Discord's slash command system
- **Input Validation**: Robust validation for Job IDs (UUID format) and Place IDs (numeric format)
- **Rich Responses**: Embedded messages with proper formatting and error states
- **Ephemeral Responses**: Error messages are sent as ephemeral (private) responses to avoid channel spam

## Configuration Strategy
- **Environment-based Config**: All sensitive data and configuration managed through environment variables
- **Fallback Defaults**: Sensible defaults provided for optional configuration values
- **Development Support**: Optional guild-specific command deployment for faster development iteration

# External Dependencies

## Core Dependencies
- **discord.js v14**: Primary Discord API wrapper for bot functionality
- **axios**: HTTP client for making requests to the Roblox API
- **dotenv**: Environment variable management for configuration

## External APIs
- **Discord API**: Bot authentication, slash command registration, and message handling
- **Roblox Games API**: Server data retrieval using the `https://games.roblox.com` endpoint
- **Roblox Place System**: Integration with Roblox's place/universe system for server monitoring

## Infrastructure Requirements
- **Node.js Runtime**: Requires Node.js 16.11.0 or higher (Discord.js requirement)
- **Environment Variables**: Requires Discord bot token, client ID, and optional guild ID for development
- **Network Access**: Outbound HTTPS access to Discord and Roblox APIs

## Rate Limiting & Performance
- **Request Timeout**: 10-second timeout for API requests
- **Retry Logic**: Up to 3 retries for failed requests
- **Caching**: 30-second cache duration for API responses
- **Batch Limits**: Maximum 100 servers fetched per request to respect rate limits