const { REST, Routes } = require('discord.js');
const config = require('./config.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

// Load all commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`Loaded command: ${command.data.name}`);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        let data;
        
        // Deploy globally to make commands available in DMs and all servers
        console.log('Deploying commands globally (including DMs)...');
        data = await rest.put(
            Routes.applicationCommands(config.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        
        // List deployed commands
        console.log('Deployed commands:');
        data.forEach(cmd => {
            console.log(`- /${cmd.name}: ${cmd.description}`);
        });
        
    } catch (error) {
        console.error('Error deploying commands:', error);
        
        if (error.code === 50001) {
            console.error('Missing Access: Bot doesn\'t have permission to create slash commands in this guild.');
        } else if (error.code === 10002) {
            console.error('Unknown Application: Invalid CLIENT_ID provided.');
        } else if (error.rawError?.message) {
            console.error('API Error:', error.rawError.message);
        }
    }
})();
