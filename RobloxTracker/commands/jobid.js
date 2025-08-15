const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const RobloxAPI = require('../services/roblox-api.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jobid')
        .setDescription('Roblox oyunundaki tüm sunucuları ve oyuncu sayılarını listele')
        .addStringOption(option =>
            option.setName('gameid')
                .setDescription('Roblox oyununun Place ID (Game ID)')
                .setRequired(true)),
    
    async execute(interaction) {
        const placeId = interaction.options.getString('gameid');
        
        // Validate Place ID (should be numeric)
        if (!/^\d+$/.test(placeId)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Hatalı Game ID')
                .setDescription('Game ID sadece sayılardan oluşmalıdır.')
                .setTimestamp();
            
            return await interaction.reply({ embeds: [errorEmbed] });
        }

        // Show loading message
        await interaction.deferReply();

        try {
            const serversData = await RobloxAPI.getAllServers(placeId);
            
            if (!serversData || serversData.length === 0) {
                const notFoundEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('Sunucu Bulunamadı')
                    .setDescription(`Game ID \`${placeId}\` için aktif sunucu bulunamadı.`)
                    .setFooter({ text: 'Oyun offline olabilir veya Game ID hatalı olabilir' })
                    .setTimestamp();
                
                return await interaction.editReply({ embeds: [notFoundEmbed] });
            }

            // Create pagination system
            const serversPerPage = 10;
            const totalPages = Math.ceil(serversData.length / serversPerPage);
            let currentPage = 0;

            const createEmbed = (page) => {
                const start = page * serversPerPage;
                const end = start + serversPerPage;
                const pageServers = serversData.slice(start, end);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Roblox Sunucu Listesi')
                    .setDescription(`**Game ID:** ${placeId}\n**Toplam Sunucu:** ${serversData.length}\n**Toplam Oyuncu:** ${serversData.reduce((total, server) => total + server.playing, 0)}`)
                    .setFooter({ text: `Sayfa ${page + 1}/${totalPages} • Roblox API` })
                    .setTimestamp();

                pageServers.forEach((server, index) => {
                    const serverNumber = start + index + 1;
                    const capacityPercentage = Math.round((server.playing / server.maxPlayers) * 100);
                    
                    // Determine status emoji based on capacity
                    let statusEmoji = '🟢'; // Green - Low capacity (0-69%)
                    if (capacityPercentage >= 90) {
                        statusEmoji = '🔴'; // Red - Very high capacity (90%+)
                    } else if (capacityPercentage >= 70) {
                        statusEmoji = '🟡'; // Yellow - High capacity (70-89%)
                    }
                    
                    // Additional status indicators
                    let statusText = '';
                    if (capacityPercentage === 100) {
                        statusText = ' (DOLU)';
                    } else if (capacityPercentage >= 95) {
                        statusText = ' (NEREDEYSE DOLU)';
                    } else if (capacityPercentage <= 10) {
                        statusText = ' (BOŞ)';
                    }
                    
                    embed.addFields({
                        name: `${statusEmoji} Sunucu #${serverNumber}${statusText}`,
                        value: `**Job ID:** \`${server.id}\`\n**Oyuncu:** ${server.playing}/${server.maxPlayers} (%${capacityPercentage})\n${server.fps ? `**FPS:** ${server.fps}` : ''}${server.ping ? ` | **Ping:** ${server.ping}ms` : ''}`,
                        inline: true
                    });
                });

                return embed;
            };

            const createButtons = (page) => {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev_page')
                            .setLabel('◀ Önceki')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next_page')
                            .setLabel('Sonraki ▶')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === totalPages - 1)
                    );
                return row;
            };

            const embed = createEmbed(currentPage);
            const components = totalPages > 1 ? [createButtons(currentPage)] : [];
            
            const response = await interaction.editReply({ 
                embeds: [embed], 
                components: components 
            });

            if (totalPages > 1) {
                const collector = response.createMessageComponentCollector({ time: 300000 }); // 5 minutes

                collector.on('collect', async i => {
                    if (i.user.id !== interaction.user.id) {
                        return i.reply({ content: 'Bu butonları sadece komutu kullanan kişi kullanabilir!', ephemeral: true });
                    }

                    if (i.customId === 'prev_page') {
                        currentPage--;
                    } else if (i.customId === 'next_page') {
                        currentPage++;
                    }

                    const newEmbed = createEmbed(currentPage);
                    const newComponents = [createButtons(currentPage)];

                    await i.update({ embeds: [newEmbed], components: newComponents });
                });

                collector.on('end', async () => {
                    const disabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev_page')
                                .setLabel('◀ Önceki')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next_page')
                                .setLabel('Sonraki ▶')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );
                    
                    try {
                        await response.edit({ components: [disabledRow] });
                    } catch (error) {
                        // Message might be deleted
                    }
                });
            }

        } catch (error) {
            console.error('Error fetching servers:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ API Hatası')
                .setDescription('Roblox API\'den sunucu bilgileri alınırken bir hata oluştu.')
                .addFields(
                    { name: 'Hata Detayı', value: error.message || 'Bilinmeyen hata', inline: false },
                    { name: 'Game ID', value: placeId, inline: true }
                )
                .setFooter({ text: 'Lütfen daha sonra tekrar deneyin veya farklı bir Game ID kullanın' })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
