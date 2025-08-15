const { Client, Events, GatewayIntentBits, Collection, Partials } = require('discord.js');
const config = require('./config.js');
const fs = require('node:fs');
const path = require('node:path');

// Create Discord client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel] // Required for DM support
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        
        const errorMessage = 'Bu komutu çalıştırırken bir hata oluştu!';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ 
                content: errorMessage
            });
        } else {
            await interaction.reply({ 
                content: errorMessage
            });
        }
    }
});

// Bot ready event
client.once(Events.ClientReady, readyClient => {
    console.log(`Bot hazır! ${readyClient.user.tag} olarak giriş yapıldı`);
    console.log(`Bot ${client.guilds.cache.size} sunucuda aktif`);
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(config.DISCORD_TOKEN);
