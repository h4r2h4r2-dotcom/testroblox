const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const RobloxAPI = require('../services/roblox-api.js');

// Store active intervals
const activeIntervals = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crashgame')
        .setDescription('Roblox oyunundaki sunucular için crashgame komutları listeler')
        .addStringOption(option =>
            option.setName('gameid')
                .setDescription('Roblox Game ID (Place ID)')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const gameId = interaction.options.getString('gameid');
            
            await interaction.deferReply();

            const serversData = await RobloxAPI.getAllServers(gameId, 100);

            if (!serversData || serversData.length === 0) {
                const noServersEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Sunucu Bulunamadı')
                    .setDescription(`Game ID **${gameId}** için aktif sunucu bulunamadı.`);
                
                return await interaction.editReply({ embeds: [noServersEmbed] });
            }

            const SERVERS_PER_PAGE = 10;
            const totalPages = Math.ceil(serversData.length / SERVERS_PER_PAGE);
            let currentPage = 0;

            const createEmbed = (page, isAutoUpdate = false) => {
                const start = page * SERVERS_PER_PAGE;
                const end = start + SERVERS_PER_PAGE;
                const pageServers = serversData.slice(start, end);

                const timeEmoji = isAutoUpdate ? ['🔄', '⏱️', '⏰', '⏲️'][Math.floor(Date.now() / 1000) % 4] : '';
                const updateText = isAutoUpdate ? `\n${timeEmoji} **5 saniyede bir güncelleniyor**` : '';
                
                const embed = new EmbedBuilder()
                    .setColor('#FF4500')
                    .setTitle(isAutoUpdate ? '💥 CrashGame Komutları (Otomatik Güncelleme)' : '💥 CrashGame Komutları')
                    .setDescription(`**Game ID:** ${gameId}\n**Toplam Sunucu:** ${serversData.length}${updateText}\n\nKopyalamak için kod bloğunu seç:`)
                    .setFooter({ text: `Sayfa ${page + 1}/${totalPages} • CrashGame Komutları` })
                    .setTimestamp();

                pageServers.forEach((server, index) => {
                    const serverNumber = start + index + 1;
                    const crashCommand = `/crashgame ${gameId}`;
                    
                    embed.addFields({
                        name: `💥 Sunucu #${serverNumber} (${server.playing} oyuncu)`,
                        value: `\`\`\`${crashCommand}\`\`\``,
                        inline: false
                    });
                });

                return embed;
            };

            const createButtons = (page, hasAutoUpdate = false) => {
                const rows = [];
                
                // Navigation buttons row (if multiple pages)
                if (totalPages > 1) {
                    const navRow = new ActionRowBuilder();
                    navRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId('crash_prev')
                            .setLabel('◀ Önceki')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('crash_next')
                            .setLabel('Sonraki ▶')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === totalPages - 1)
                    );
                    rows.push(navRow);
                }

                // Auto-update control row
                const controlRow = new ActionRowBuilder();
                if (hasAutoUpdate) {
                    controlRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId('stop_crash_updates')
                            .setLabel('🛑 Güncellemeyi Durdur')
                            .setStyle(ButtonStyle.Danger)
                    );
                } else {
                    controlRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId('start_crash_updates')
                            .setLabel('🔄 Otomatik Güncelleme Başlat')
                            .setStyle(ButtonStyle.Success)
                    );
                }
                rows.push(controlRow);

                return rows;
            };

            const embed = createEmbed(currentPage, true); // Start with auto-update enabled
            const components = createButtons(currentPage, true);

            const message = await interaction.editReply({ 
                embeds: [embed], 
                components: components 
            });
            
            // Start auto-update immediately
            const intervalId = setInterval(async () => {
                try {
                    const updatedServersData = await RobloxAPI.getAllServers(gameId, 100);
                    
                    if (!updatedServersData || updatedServersData.length === 0) {
                        return;
                    }

                    // Update serversData
                    serversData.length = 0;
                    serversData.push(...updatedServersData);
                    
                    // Recalculate pagination
                    const newTotalPages = Math.ceil(serversData.length / SERVERS_PER_PAGE);
                    if (currentPage >= newTotalPages) {
                        currentPage = Math.max(0, newTotalPages - 1);
                    }

                    const updatedEmbed = createEmbed(currentPage, true);
                    const updatedComponents = createButtons(currentPage, true);
                    await message.edit({ embeds: [updatedEmbed], components: updatedComponents });
                } catch (error) {
                    console.error('CrashGame auto-update error:', error);
                }
            }, 5000);

            activeIntervals.set(message.id, intervalId);

            // Auto-stop after 30 minutes
            setTimeout(() => {
                if (activeIntervals.has(message.id)) {
                    clearInterval(activeIntervals.get(message.id));
                    activeIntervals.delete(message.id);
                    
                    const stoppedComponents = createButtons(currentPage, false);
                    const controlRow = stoppedComponents[stoppedComponents.length - 1];
                    controlRow.components[0] = new ButtonBuilder()
                        .setCustomId('updates_completed')
                        .setLabel('✅ Güncelleme Tamamlandı (30 dakika)')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);
                    
                    message.edit({ components: stoppedComponents }).catch(() => {});
                }
            }, 1800000); // 30 minutes

            // Always create collector for buttons
            const collector = message.createMessageComponentCollector({ 
                time: 300000 // 5 dakika
            });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return await buttonInteraction.reply({ 
                        content: 'Bu butonları sadece komutu kullanan kişi kullanabilir.', 
                        ephemeral: true 
                    });
                }

                if (buttonInteraction.customId === 'crash_prev' && currentPage > 0) {
                    currentPage--;
                    const newEmbed = createEmbed(currentPage, activeIntervals.has(message.id));
                    const newComponents = createButtons(currentPage, activeIntervals.has(message.id));
                    await buttonInteraction.update({ 
                        embeds: [newEmbed], 
                        components: newComponents 
                    });
                } else if (buttonInteraction.customId === 'crash_next' && currentPage < totalPages - 1) {
                    currentPage++;
                    const newEmbed = createEmbed(currentPage, activeIntervals.has(message.id));
                    const newComponents = createButtons(currentPage, activeIntervals.has(message.id));
                    await buttonInteraction.update({ 
                        embeds: [newEmbed], 
                        components: newComponents 
                    });
                } else if (buttonInteraction.customId === 'start_crash_updates') {
                    // This should not happen since auto-update starts by default
                    await buttonInteraction.update({ components: createButtons(currentPage, true) });
                } else if (buttonInteraction.customId === 'stop_crash_updates') {
                    // Stop auto-update
                    if (activeIntervals.has(message.id)) {
                        clearInterval(activeIntervals.get(message.id));
                        activeIntervals.delete(message.id);
                    }

                    const stoppedComponents = createButtons(currentPage, false);
                    const controlRow = stoppedComponents[stoppedComponents.length - 1];
                    controlRow.components[0] = new ButtonBuilder()
                        .setCustomId('updates_stopped')
                        .setLabel('✅ Güncelleme Durduruldu')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    const stoppedEmbed = createEmbed(currentPage, false);
                    await buttonInteraction.update({ embeds: [stoppedEmbed], components: stoppedComponents });
                }
            });

            collector.on('end', () => {
                // Clean up interval if exists
                if (activeIntervals.has(message.id)) {
                    clearInterval(activeIntervals.get(message.id));
                    activeIntervals.delete(message.id);
                }

                const disabledComponents = components.map(row => {
                    const newRow = new ActionRowBuilder();
                    row.components.forEach(component => {
                        newRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
                    });
                    return newRow;
                });

                interaction.editReply({ components: disabledComponents }).catch(() => {});
            });

        } catch (error) {
            console.error('CrashGame komutu hatası:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Hata')
                .setDescription('CrashGame komutları alınırken bir hata oluştu.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};