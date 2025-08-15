const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Store active games
const activeGames = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oyun')
        .setDescription('🎮 İnteraktif animasyonlu oyunlar oyna!')
        .addStringOption(option =>
            option.setName('tip')
                .setDescription('Hangi oyunu oynamak istiyorsun?')
                .setRequired(true)
                .addChoices(
                    { name: '🎯 Hedef Vurma', value: 'target' },
                    { name: '🍀 Şanslı Sayı', value: 'lucky' },
                    { name: '🌟 Yıldız Toplama', value: 'stars' },
                    { name: '⚡ Hız Testi', value: 'speed' },
                    { name: '🧠 Hafıza Oyunu', value: 'memory' }
                )),

    async execute(interaction) {
        const tip = interaction.options.getString('tip');
        await interaction.deferReply();

        if (tip === 'target') {
            // Target shooting game
            const targets = ['🎯', '🎪', '🎨', '🎭', '🎰'];
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            
            const targetEmbed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('🎯 HEDEF VURMA OYUNU 🎯')
                .setDescription(`**GÖREV:** ${randomTarget} hedefini bul ve vur!\n\n⚡ **10 saniyende karar ver!** ⚡`)
                .setTimestamp();

            const buttons = new ActionRowBuilder();
            const shuffledTargets = [...targets].sort(() => Math.random() - 0.5);
            
            shuffledTargets.forEach((target, index) => {
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`target_${target}`)
                        .setLabel(target)
                        .setStyle(ButtonStyle.Primary)
                );
            });

            const message = await interaction.editReply({ 
                embeds: [targetEmbed], 
                components: [buttons] 
            });

            const collector = message.createMessageComponentCollector({ time: 10000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return await buttonInteraction.reply({ 
                        content: 'Bu oyunu sadece başlatan kişi oynayabilir!', 
                        ephemeral: true 
                    });
                }

                const selected = buttonInteraction.customId.split('_')[1];
                const isCorrect = selected === randomTarget;

                const resultEmbed = new EmbedBuilder()
                    .setColor(isCorrect ? '#00FF00' : '#FF0000')
                    .setTitle(isCorrect ? '🎉 HEDEF VURULDU! 🎉' : '💥 ISKA! 💥')
                    .setDescription(isCorrect ? 
                        `🎯 **MÜKEMMEL ATIŞ!** ${randomTarget} hedefini vurdun!\n\n🏆 **+100 PUAN!** 🏆` :
                        `😅 **ISKA!** Hedef ${randomTarget} idi, sen ${selected} seçtin!\n\n🎯 **Tekrar dene!** 🎯`)
                    .setTimestamp();

                await buttonInteraction.update({ embeds: [resultEmbed], components: [] });
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('⏰ SÜRE DOLDU! ⏰')
                        .setDescription(`💤 **ZAMAN AŞIMI!** Hedef ${randomTarget} idi!\n\n🎯 **Tekrar dene!** 🎯`)
                        .setTimestamp();
                    
                    await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                }
            });

        } else if (tip === 'lucky') {
            // Lucky number game
            const luckyNumber = Math.floor(Math.random() * 10) + 1;
            
            const luckyEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🍀 ŞANSLI SAYI OYUNU 🍀')
                .setDescription('**1-10 arası bir sayı tuttum!**\n\n🎲 **Hangi sayıyı seçiyorsun?** 🎲')
                .setTimestamp();

            const numberButtons = new ActionRowBuilder();
            for (let i = 1; i <= 5; i++) {
                numberButtons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`lucky_${i}`)
                        .setLabel(i.toString())
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            
            const numberButtons2 = new ActionRowBuilder();
            for (let i = 6; i <= 10; i++) {
                numberButtons2.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`lucky_${i}`)
                        .setLabel(i.toString())
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            const message = await interaction.editReply({ 
                embeds: [luckyEmbed], 
                components: [numberButtons, numberButtons2] 
            });

            const collector = message.createMessageComponentCollector({ time: 15000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return await buttonInteraction.reply({ 
                        content: 'Bu oyunu sadece başlatan kişi oynayabilir!', 
                        ephemeral: true 
                    });
                }

                const selected = parseInt(buttonInteraction.customId.split('_')[1]);
                const difference = Math.abs(selected - luckyNumber);
                
                let result = '';
                let color = '';
                
                if (selected === luckyNumber) {
                    result = `🎉 **TAM İSABET!** 🎉\n\n🍀 Sayı ${luckyNumber} idi! Muhteşem şans! 🍀\n\n🏆 **+500 PUAN!** 🏆`;
                    color = '#FFD700';
                } else if (difference === 1) {
                    result = `🔥 **ÇOK YAKIN!** 🔥\n\n😮 Sayı ${luckyNumber} idi, sen ${selected} dedin!\n\n⭐ **+200 PUAN!** ⭐`;
                    color = '#FF6347';
                } else if (difference <= 3) {
                    result = `👍 **İYİ TAHMİN!** 👍\n\n😊 Sayı ${luckyNumber} idi, sen ${selected} dedin!\n\n🎯 **+100 PUAN!** 🎯`;
                    color = '#FFA500';
                } else {
                    result = `😅 **UZAK!** 😅\n\n🤔 Sayı ${luckyNumber} idi, sen ${selected} dedin!\n\n🎲 **Tekrar dene!** 🎲`;
                    color = '#FF0000';
                }

                const resultEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle('🍀 ŞANSLI SAYI SONUCU 🍀')
                    .setDescription(result)
                    .setTimestamp();

                await buttonInteraction.update({ embeds: [resultEmbed], components: [] });
            });

        } else if (tip === 'stars') {
            // Star collection game
            let stars = 0;
            let gameActive = true;
            
            const starEmbed = new EmbedBuilder()
                .setColor('#9370DB')
                .setTitle('🌟 YILDIZ TOPLAMA OYUNU 🌟')
                .setDescription(`⭐ **Toplanan Yıldızlar:** ${stars}\n\n🎯 **20 saniyede mümkün olduğunca çok yıldız topla!**`)
                .setTimestamp();

            const starButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('collect_star')
                        .setLabel('⭐ YILDIZ TOPLA!')
                        .setStyle(ButtonStyle.Success)
                );

            const message = await interaction.editReply({ 
                embeds: [starEmbed], 
                components: [starButton] 
            });

            // Game timer
            setTimeout(() => {
                gameActive = false;
                const finalEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('⏰ OYUN BİTTİ! ⏰')
                    .setDescription(`🌟 **TOPLAM YILDIZ:** ${stars}\n\n${stars >= 20 ? '🏆 **EFSANE!** 🏆' : stars >= 15 ? '🥇 **MÜKEMMEr!** 🥇' : stars >= 10 ? '🥈 **HARIKA!** 🥈' : '🥉 **İYİ!** 🥉'}\n\n⭐ **Tekrar oyna!** ⭐`)
                    .setTimestamp();
                
                interaction.editReply({ embeds: [finalEmbed], components: [] });
            }, 20000);

            const collector = message.createMessageComponentCollector({ time: 20000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return await buttonInteraction.reply({ 
                        content: 'Bu oyunu sadece başlatan kişi oynayabilir!', 
                        ephemeral: true 
                    });
                }

                if (!gameActive) return;

                stars++;
                const starBar = '⭐'.repeat(Math.min(stars, 20));
                const timeLeft = Math.max(0, 20 - Math.floor((Date.now() - interaction.createdTimestamp) / 1000));
                
                const updateEmbed = new EmbedBuilder()
                    .setColor('#9370DB')
                    .setTitle('🌟 YILDIZ TOPLAMA OYUNU 🌟')
                    .setDescription(`⭐ **Toplanan Yıldızlar:** ${stars}\n${starBar}\n\n⏰ **Kalan Süre:** ${timeLeft} saniye\n\n🚀 **DEVAM ET!** 🚀`)
                    .setTimestamp();

                await buttonInteraction.update({ embeds: [updateEmbed] });
            });

        } else if (tip === 'speed') {
            // Speed test game
            const speedEmojis = ['⚡', '🔥', '💨', '🚀', '💫'];
            let currentEmoji = speedEmojis[Math.floor(Math.random() * speedEmojis.length)];
            let reactionTime = Date.now();
            
            const speedEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('⚡ HIZ TESTİ ⚡')
                .setDescription('🎯 **Aşağıdaki emoji göründüğünde hızla tıkla!**\n\n⏰ **Hazır mısın?**')
                .setTimestamp();

            const speedButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('speed_test')
                        .setLabel('🎯 HAZIR!')
                        .setStyle(ButtonStyle.Primary)
                );

            const message = await interaction.editReply({ 
                embeds: [speedEmbed], 
                components: [speedButton] 
            });

            const collector = message.createMessageComponentCollector({ time: 30000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return await buttonInteraction.reply({ 
                        content: 'Bu oyunu sadece başlatan kişi oynayabilir!', 
                        ephemeral: true 
                    });
                }

                // Start speed test
                const waitTime = Math.random() * 3000 + 1000; // 1-4 seconds
                
                const waitEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⏳ BEKLEYİN... ⏳')
                    .setDescription('⚡ **Emoji göründüğünde hızla tıklayın!** ⚡\n\n🎯 **Konsantre olun...**')
                    .setTimestamp();

                await buttonInteraction.update({ embeds: [waitEmbed], components: [] });

                setTimeout(async () => {
                    reactionTime = Date.now();
                    
                    const testEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(`${currentEmoji} ŞİMDİ! ${currentEmoji}`)
                        .setDescription(`⚡ **HIZLA TIKLA!** ⚡\n\n${currentEmoji.repeat(10)}`)
                        .setTimestamp();

                    const reactionButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('reaction_click')
                                .setLabel(`${currentEmoji} TIKLA!`)
                                .setStyle(ButtonStyle.Danger)
                        );

                    await interaction.editReply({ embeds: [testEmbed], components: [reactionButton] });
                }, waitTime);
            });

            const reactionCollector = message.createMessageComponentCollector({ time: 30000 });
            reactionCollector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'reaction_click') {
                    const reactionTimeMs = Date.now() - reactionTime;
                    let grade = '';
                    let color = '';
                    
                    if (reactionTimeMs < 200) {
                        grade = '🏆 **EFSANE!**';
                        color = '#FFD700';
                    } else if (reactionTimeMs < 300) {
                        grade = '🥇 **MÜKEMMEr!**';
                        color = '#C0C0C0';
                    } else if (reactionTimeMs < 500) {
                        grade = '🥈 **ÇOK İYİ!**';
                        color = '#CD7F32';
                    } else if (reactionTimeMs < 800) {
                        grade = '🥉 **İYİ!**';
                        color = '#FFA500';
                    } else {
                        grade = '😅 **YAVAŞ!**';
                        color = '#FF0000';
                    }

                    const resultEmbed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle('⚡ HIZ TESTİ SONUCU ⚡')
                        .setDescription(`⏱️ **Reaksiyon Süreniz:** ${reactionTimeMs}ms\n\n${grade}\n\n🚀 **Tekrar dene!** 🚀`)
                        .setTimestamp();

                    await buttonInteraction.update({ embeds: [resultEmbed], components: [] });
                }
            });

        } else if (tip === 'memory') {
            // Memory game
            const memoryEmojis = ['🎯', '🎪', '🎨', '🎭', '🎰', '🎲', '🎸', '🎹'];
            const sequence = [];
            let currentStep = 0;
            let showingSequence = true;
            
            // Generate sequence
            for (let i = 0; i < 5; i++) {
                sequence.push(memoryEmojis[Math.floor(Math.random() * memoryEmojis.length)]);
            }
            
            const memoryEmbed = new EmbedBuilder()
                .setColor('#9370DB')
                .setTitle('🧠 HAFIZA OYUNU 🧠')
                .setDescription('🎯 **Sırayı ezberle ve tekrarla!**\n\n⏰ **Sıra gösteriliyor...**')
                .setTimestamp();

            await interaction.editReply({ embeds: [memoryEmbed] });

            // Show sequence
            for (let i = 0; i < sequence.length; i++) {
                setTimeout(async () => {
                    const showEmbed = new EmbedBuilder()
                        .setColor('#FF69B4')
                        .setTitle('🧠 HAFIZA OYUNU 🧠')
                        .setDescription(`🎯 **Sıra:** ${sequence.slice(0, i + 1).join(' ')}\n\n📝 **Ezberliyorsun... ${i + 1}/${sequence.length}**`)
                        .setTimestamp();
                    
                    await interaction.editReply({ embeds: [showEmbed] });
                }, i * 1500);
            }

            // Start input phase
            setTimeout(async () => {
                showingSequence = false;
                
                const inputEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🧠 HAFIZA OYUNU 🧠')
                    .setDescription(`🎯 **Sırayı tekrarla!**\n\n📝 **Hedef:** ${sequence.join(' ')}\n\n⚡ **Seçim yap!**`)
                    .setTimestamp();

                const memoryButtons = new ActionRowBuilder();
                memoryEmojis.slice(0, 4).forEach(emoji => {
                    memoryButtons.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`memory_${emoji}`)
                            .setLabel(emoji)
                            .setStyle(ButtonStyle.Secondary)
                    );
                });

                const memoryButtons2 = new ActionRowBuilder();
                memoryEmojis.slice(4, 8).forEach(emoji => {
                    memoryButtons2.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`memory_${emoji}`)
                            .setLabel(emoji)
                            .setStyle(ButtonStyle.Secondary)
                    );
                });

                const message = await interaction.editReply({ 
                    embeds: [inputEmbed], 
                    components: [memoryButtons, memoryButtons2] 
                });

                activeGames.set(interaction.user.id, { sequence, currentStep: 0 });

                const collector = message.createMessageComponentCollector({ time: 30000 });

                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.user.id !== interaction.user.id) {
                        return await buttonInteraction.reply({ 
                            content: 'Bu oyunu sadece başlatan kişi oynayabilir!', 
                            ephemeral: true 
                        });
                    }

                    const game = activeGames.get(interaction.user.id);
                    if (!game) return;

                    const selected = buttonInteraction.customId.split('_')[1];
                    const correct = selected === game.sequence[game.currentStep];

                    if (correct) {
                        game.currentStep++;
                        
                        if (game.currentStep >= game.sequence.length) {
                            // Game won!
                            const winEmbed = new EmbedBuilder()
                                .setColor('#FFD700')
                                .setTitle('🎉 HAFIZA ŞAMPIYONU! 🎉')
                                .setDescription(`🧠 **MÜKEMMEL HAFIZA!** Tüm sırayı doğru tekrarladın!\n\n🏆 **Sıra:** ${game.sequence.join(' ')}\n\n🌟 **+1000 PUAN!** 🌟`)
                                .setTimestamp();
                            
                            await buttonInteraction.update({ embeds: [winEmbed], components: [] });
                            activeGames.delete(interaction.user.id);
                        } else {
                            // Continue
                            const continueEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('✅ DOĞRU! ✅')
                                .setDescription(`🎯 **İlerleme:** ${game.currentStep}/${game.sequence.length}\n\n📝 **Devam et!** Sıradaki emoji: ${game.currentStep + 1}. sıra`)
                                .setTimestamp();
                            
                            await buttonInteraction.update({ embeds: [continueEmbed] });
                        }
                    } else {
                        // Game over
                        const loseEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('❌ YANLIŞ! ❌')
                            .setDescription(`😅 **Yanlış emoji!** \n\n🎯 **Doğru sıra:** ${game.sequence.join(' ')}\n\n🧠 **Tekrar dene!** 🧠`)
                            .setTimestamp();
                        
                        await buttonInteraction.update({ embeds: [loseEmbed], components: [] });
                        activeGames.delete(interaction.user.id);
                    }
                });

                collector.on('end', () => {
                    activeGames.delete(interaction.user.id);
                });
                
            }, sequence.length * 1500 + 1000);
        }
    },
};