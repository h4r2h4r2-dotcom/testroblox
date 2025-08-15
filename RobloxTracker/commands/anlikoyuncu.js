const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const RobloxAPI = require('../services/roblox-api.js');

// Store active intervals
const activeIntervals = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anlikoyuncu')
        .setDescription('Roblox oyunundaki toplam oyuncu sayısını gösterir')
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
                .setTitle('Hatalı Game ID')
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

            // Calculate totals
            const totalServers = serversData.length;
            const totalPlayers = serversData.reduce((total, server) => total + server.playing, 0);
            const totalMaxPlayers = serversData.reduce((total, server) => total + server.maxPlayers, 0);
            const averageCapacity = Math.round((totalPlayers / totalMaxPlayers) * 100);

            // Status emoji based on average capacity
            let statusEmoji = '🟢'; 
            let statusText = 'İYİ';
            let statusColor = '#00FF00';
            
            if (averageCapacity >= 80) {
                statusEmoji = '🔴'; 
                statusText = 'YOĞUN';
                statusColor = '#FF0000';
            } else if (averageCapacity >= 60) {
                statusEmoji = '🟡'; 
                statusText = 'ORTA';
                statusColor = '#FFA500';
            }

            // Create info embed
            const infoEmbed = new EmbedBuilder()
                .setColor(statusColor)
                .setTitle(`${statusEmoji} Roblox Oyun İstatistikleri`)
                .setDescription(`**Game ID:** ${placeId}\n**Durum:** ${statusText}`)
                .addFields(
                    { name: '👥 Toplam Oyuncu', value: `**${totalPlayers.toLocaleString('tr-TR')}**`, inline: true },
                    { name: '🖥️ Aktif Sunucu', value: `**${totalServers}**`, inline: true },
                    { name: '📊 Ortalama Doluluk', value: `**%${averageCapacity}**`, inline: true },
                    { name: '🎯 Toplam Kapasite', value: `**${totalMaxPlayers.toLocaleString('tr-TR')}**`, inline: true },
                    { name: '📈 Ortalama Sunucu Boyutu', value: `**${Math.round(totalPlayers / totalServers)}** oyuncu`, inline: true },
                    { name: '🏆 En Dolu Sunucu', value: `**${Math.max(...serversData.map(s => s.playing))}** oyuncu`, inline: true }
                )
                .setFooter({ text: 'Roblox API • Anlık veriler' })
                .setTimestamp();

            // Color is already set above with more variety

            // Create stop button
            const stopButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('stop_updates')
                        .setLabel('🛑 Güncellemeyi Durdur')
                        .setStyle(ButtonStyle.Danger)
                );

            const message = await interaction.editReply({ embeds: [infoEmbed], components: [stopButton] });

            // Set up auto-update interval (5 seconds)
            const intervalId = setInterval(async () => {
                try {
                    const updatedServersData = await RobloxAPI.getAllServers(placeId);
                    
                    if (!updatedServersData || updatedServersData.length === 0) {
                        return;
                    }

                    // Calculate updated totals
                    const totalServers = updatedServersData.length;
                    const totalPlayers = updatedServersData.reduce((total, server) => total + server.playing, 0);
                    const totalMaxPlayers = updatedServersData.reduce((total, server) => total + server.maxPlayers, 0);
                    const averageCapacity = Math.round((totalPlayers / totalMaxPlayers) * 100);

                    // Status emoji based on average capacity
                    let statusEmoji = '🟢';
                    let statusText = 'İYİ';
                    if (averageCapacity >= 80) {
                        statusEmoji = '🔴';
                        statusText = 'YOĞUN';
                    } else if (averageCapacity >= 60) {
                        statusEmoji = '🟡';
                        statusText = 'ORTA';
                    }

                    // Create updated embed with time animation
                    const timeEmoji = ['🔄', '⏱️', '⏰', '⏲️'][Math.floor(Date.now() / 1000) % 4];
                    
                    const updatedEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`${statusEmoji} Roblox Oyun İstatistikleri (Otomatik Güncelleme)`)
                        .setDescription(`**Game ID:** ${placeId}\n**Durum:** ${statusText}\n${timeEmoji} **5 saniyede bir güncelleniyor**`)
                        .addFields(
                            { name: '👥 Toplam Oyuncu', value: `**${totalPlayers.toLocaleString('tr-TR')}**`, inline: true },
                            { name: '🖥️ Aktif Sunucu', value: `**${totalServers}**`, inline: true },
                            { name: '📊 Ortalama Doluluk', value: `**%${averageCapacity}**`, inline: true },
                            { name: '🎯 Toplam Kapasite', value: `**${totalMaxPlayers.toLocaleString('tr-TR')}**`, inline: true },
                            { name: '📈 Ortalama Sunucu Boyutu', value: `**${Math.round(totalPlayers / totalServers)}** oyuncu`, inline: true },
                            { name: '🏆 En Dolu Sunucu', value: `**${Math.max(...updatedServersData.map(s => s.playing))}** oyuncu`, inline: true }
                        )
                        .setFooter({ text: 'Roblox API • Otomatik güncelleme aktif' })
                        .setTimestamp();

                    // Add color based on total capacity
                    if (averageCapacity >= 80) {
                        updatedEmbed.setColor('#FF0000');
                    } else if (averageCapacity >= 50) {
                        updatedEmbed.setColor('#FFA500');
                    } else {
                        updatedEmbed.setColor('#00FF00');
                    }

                    await message.edit({ embeds: [updatedEmbed], components: [stopButton] });
                } catch (error) {
                    console.error('Auto-update error:', error);
                }
            }, 5000);

            // Store interval for this interaction
            activeIntervals.set(message.id, intervalId);

            // Auto-stop after 30 minutes (1800 seconds)
            setTimeout(() => {
                if (activeIntervals.has(message.id)) {
                    clearInterval(activeIntervals.get(message.id));
                    activeIntervals.delete(message.id);
                    
                    // Disable button and show stopped message
                    const stoppedButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('updates_stopped')
                                .setLabel('✅ Güncelleme Tamamlandı (30 dakika)')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );
                    
                    message.edit({ components: [stoppedButton] }).catch(() => {});
                }
            }, 1800000); // 30 minutes

            // Handle stop button clicks
            const collector = message.createMessageComponentCollector({ time: 1800000 }); // 30 minutes

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return await buttonInteraction.reply({ 
                        content: 'Bu butonu sadece komutu kullanan kişi kullanabilir.', 
                        ephemeral: true 
                    });
                }

                if (buttonInteraction.customId === 'stop_updates') {
                    // Clear interval
                    if (activeIntervals.has(message.id)) {
                        clearInterval(activeIntervals.get(message.id));
                        activeIntervals.delete(message.id);
                    }

                    // Update button to show stopped state
                    const stoppedButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('updates_stopped')
                                .setLabel('✅ Güncelleme Durduruldu')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );

                    await buttonInteraction.update({ components: [stoppedButton] });
                }
            });

            collector.on('end', () => {
                // Clean up when collector expires
                if (activeIntervals.has(message.id)) {
                    clearInterval(activeIntervals.get(message.id));
                    activeIntervals.delete(message.id);
                }
            });

        } catch (error) {
            console.error('Error fetching game stats:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('API Hatası')
                .setDescription('Roblox API\'den oyun bilgileri alınırken bir hata oluştu.')
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