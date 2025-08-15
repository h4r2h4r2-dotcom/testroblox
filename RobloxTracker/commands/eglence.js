const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eglence')
        .setDescription('🎉 Süper eğlenceli animasyonlu komutlar!')
        .addStringOption(option =>
            option.setName('tip')
                .setDescription('Hangi eğlence tipini istiyorsun?')
                .setRequired(true)
                .addChoices(
                    { name: '🌈 Emoji Yağmuru', value: 'emoji_rain' },
                    { name: '🎲 Şans Çarkı', value: 'wheel' },
                    { name: '🚀 Roket Fırlatma', value: 'rocket' },
                    { name: '🎪 Sihir Gösterisi', value: 'magic' },
                    { name: '⚡ Enerji Patlaması', value: 'energy' },
                    { name: '🏆 Zafer Kutlaması', value: 'victory' }
                )),

    async execute(interaction) {
        const tip = interaction.options.getString('tip');
        await interaction.deferReply();

        if (tip === 'emoji_rain') {
            const rainEmojis = ['🌈', '⭐', '✨', '💫', '🌟', '🎉', '🎊', '💖', '🦄', '🌸'];
            let rainText = '';
            
            const rainEmbed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🌈 EMOJİ YAĞMURU BAŞLIYOR! 🌈')
                .setDescription('Hazırlanın... 3... 2... 1...')
                .setTimestamp();
                
            await interaction.editReply({ embeds: [rainEmbed] });
            
            // Animate emoji rain
            for (let i = 0; i < 5; i++) {
                setTimeout(async () => {
                    for (let j = 0; j < 10; j++) {
                        rainText += rainEmojis[Math.floor(Math.random() * rainEmojis.length)] + ' ';
                    }
                    rainText += '\n';
                    
                    const animatedEmbed = new EmbedBuilder()
                        .setColor(['#FF69B4', '#FF1493', '#FF6347', '#FF8C00', '#FFD700'][i])
                        .setTitle('🌈 EMOJİ YAĞMURU! 🌈')
                        .setDescription(`\`\`\`${rainText}\`\`\`\n🎉 **YAĞMUR YAĞIYOR!** 🎉`)
                        .setTimestamp();
                        
                    await interaction.editReply({ embeds: [animatedEmbed] });
                }, i * 1000);
            }

        } else if (tip === 'wheel') {
            const prizes = ['🎊 SÜPER İYİ!', '🏆 MÜKEMMEL!', '⭐ HARIKA!', '🔥 İNANILMAZ!', '💎 EŞSİZ!', '🚀 FANTASTIK!'];
            const wheelEmojis = ['🎯', '🎪', '🎨', '🎭', '🎰', '🎲'];
            
            for (let i = 0; i < 8; i++) {
                setTimeout(async () => {
                    const currentEmoji = wheelEmojis[i % wheelEmojis.length];
                    const spinEmbed = new EmbedBuilder()
                        .setColor(['#FF0000', '#FF4500', '#FFD700', '#00FF00', '#0000FF', '#8A2BE2', '#FF1493', '#00FFFF'][i])
                        .setTitle(`${currentEmoji} ŞANS ÇARKI DÖNÜYOR! ${currentEmoji}`)
                        .setDescription(`${'🌀'.repeat(i + 1)} **DÖNDÜRÜLÜYOR...** ${'🌀'.repeat(i + 1)}\n\n${currentEmoji.repeat(10)}`)
                        .setTimestamp();
                        
                    await interaction.editReply({ embeds: [spinEmbed] });
                }, i * 600);
            }
            
            setTimeout(async () => {
                const winner = prizes[Math.floor(Math.random() * prizes.length)];
                const winEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎉 ÇARK DURDU! 🎉')
                    .setDescription(`**SONUÇ:** ${winner}\n\n🎊 **TEBRİKLER!** 🎊`)
                    .setTimestamp();
                    
                await interaction.editReply({ embeds: [winEmbed] });
            }, 5000);

        } else if (tip === 'rocket') {
            const stages = [
                '🚀 Roket hazırlanıyor...',
                '⚡ Yakıt dolduruluyor...',
                '🔥 Motor ısınıyor...',
                '💥 3... 2... 1...',
                '🚀 FIRLATMA!',
                '🌟 Uzayda!',
                '🌍 Dünya\'yı geride bıraktık!',
                '🌌 Galakside kayboldu!'
            ];
            
            for (let i = 0; i < stages.length; i++) {
                setTimeout(async () => {
                    const height = i * 2;
                    const trail = '✨'.repeat(i);
                    
                    const rocketEmbed = new EmbedBuilder()
                        .setColor(['#FF4500', '#FF6347', '#FF8C00', '#FFD700', '#ADFF2F', '#00FFFF', '#9370DB', '#FF1493'][i])
                        .setTitle('🚀 ROKET MİSYONU 🚀')
                        .setDescription(`${stages[i]}\n\n${'⬆️'.repeat(height)}\n🚀${trail}\n${'⬇️'.repeat(Math.max(0, 5 - height))}`)
                        .setTimestamp();
                        
                    await interaction.editReply({ embeds: [rocketEmbed] });
                }, i * 800);
            }

        } else if (tip === 'magic') {
            const magicWords = ['✨ Abra Kadabra!', '🎩 Hokus Pokus!', '⭐ Sim Sala Bim!', '🔮 Alakazam!'];
            const magicEmojis = ['🎩', '🔮', '✨', '⭐', '🌟', '💫'];
            
            for (let i = 0; i < 6; i++) {
                setTimeout(async () => {
                    const magic = magicEmojis[i % magicEmojis.length];
                    const sparkles = '✨'.repeat(i + 1);
                    
                    const magicEmbed = new EmbedBuilder()
                        .setColor(['#9370DB', '#8A2BE2', '#BA55D3', '#DA70D6', '#EE82EE', '#DDA0DD'][i])
                        .setTitle(`${magic} SİHİR GÖSTERİSİ ${magic}`)
                        .setDescription(`${sparkles}\n${magicWords[Math.floor(Math.random() * magicWords.length)]}\n${sparkles}\n\n🎭 **Sihir yapılıyor...** 🎭`)
                        .setTimestamp();
                        
                    await interaction.editReply({ embeds: [magicEmbed] });
                }, i * 700);
            }
            
            setTimeout(async () => {
                const finalEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎉 SİHİR TAMAMLANDI! 🎉')
                    .setDescription('🎊 **TADA!** Sihir başarılı! 🎊\n\n🔮 Senin için özel bir şey yaratıldı! 🔮')
                    .setTimestamp();
                    
                await interaction.editReply({ embeds: [finalEmbed] });
            }, 4500);

        } else if (tip === 'energy') {
            const energyLevels = [
                '⚡ Enerji toplanıyor... %10',
                '⚡⚡ Güç artıyor... %30', 
                '⚡⚡⚡ Enerji yükseliyor... %50',
                '⚡⚡⚡⚡ Maksimum güç... %80',
                '💥 PATLAMA HAZRİ! %100',
                '🌟 ENERJİ PATLAMASI! 🌟'
            ];
            
            for (let i = 0; i < energyLevels.length; i++) {
                setTimeout(async () => {
                    const energyBar = '🟩'.repeat(i + 1) + '⬜'.repeat(5 - i);
                    
                    const energyEmbed = new EmbedBuilder()
                        .setColor(['#FFFF00', '#FFFF33', '#FFFF66', '#FF6600', '#FF0000', '#FF00FF'][i])
                        .setTitle('⚡ ENERJİ YÜKLEYICI ⚡')
                        .setDescription(`${energyLevels[i]}\n\n${energyBar}\n\n${'⚡'.repeat(i + 1)}`)
                        .setTimestamp();
                        
                    await interaction.editReply({ embeds: [energyEmbed] });
                }, i * 600);
            }

        } else if (tip === 'victory') {
            const victoryStages = [
                '🏆 Zafer hazırlanıyor...',
                '🎉 Kutlama başlıyor...',
                '🎊 Konfeti atılıyor...',
                '🥇 Madalya takdim ediliyor...',
                '👑 Kral tacı giyiliyor...',
                '🌟 ZAFER KUTLAMASI TAMAMLANDI!'
            ];
            
            for (let i = 0; i < victoryStages.length; i++) {
                setTimeout(async () => {
                    const celebration = '🎉'.repeat(i + 1);
                    
                    const victoryEmbed = new EmbedBuilder()
                        .setColor(['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB', '#00FF00'][i])
                        .setTitle('🏆 ZAFER KUTLAMASI 🏆')
                        .setDescription(`${celebration}\n${victoryStages[i]}\n${celebration}\n\n👑 **SEN BİR ŞAMPİYONSUN!** 👑`)
                        .setTimestamp();
                        
                    await interaction.editReply({ embeds: [victoryEmbed] });
                }, i * 800);
            }
        }
    },
};