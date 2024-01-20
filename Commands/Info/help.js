const {
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Kilistázza az összes parancsot."),
    async execute(interaction) {
        const emojis = {
            economy: `💸`,
            fun: `🤣`,
            info: '📄',
            moderation: '🚨',
            nsfw: `🔞`,
            general: '💚',
            tools: '🧱',
            partnerek: '✌',
            report: '🛑',
            services: `⭐`,
            owner: '👑',
            zene: `🎶`,
            premium: `✨`,
            ticket: `🎫`
        };

        const directories = [...new Set(interaction.client.commands.map((cmd) => cmd.folder)),];

        const formatString = (str) =>
            `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

        const categories = directories.map((dir) => {
            const getCommands = interaction.client.commands.filter((cmd) => cmd.folder === dir).map((cmd) => {
                return {
                    name: cmd.data.name,
                    description: `• ${cmd.data.description}` || `• Nincs leírás`,
                    category: cmd.category || null,
                };
            });

            return {
                directories: formatString(dir),
                commands: getCommands,
            };
        });
        const client = interaction.client;
        const guilds = client.guilds.cache;

        if (guilds.size === 0) {
            await interaction.reply('A bot nincs jelen semelyik szerveren.');
            return;
        }

        let totalMembers = 0;

        guilds.forEach((guild) => {
            totalMembers += guild.memberCount;
        });
        const totalCommands = interaction.client.commands.size; // Az összes parancs száma

        const serverCount = guilds.size;
        const botinv = process.env.botinvlink
        const Dennyel = process.env.devid
        const Andris = process.env.devid2
        const categoryNames = categories.map((cat) => {
            const emoji = emojis[cat.directories.toLowerCase()] || ' '; // Megkeresi az emojit vagy üres stringet
            return `\`${emoji}\` • ${cat.directories}`;
        });
        const categoriak = categoryNames.join(' \n');

        const totalServerText = `
        >>> \`🛸\` • Szerverek \`${serverCount}\` 
        \`😎\` • Emberek \`${totalMembers}\` 
        **\`/\`** • Parancsok \`${totalCommands}\` 
        \`💻\` • Fejlesztők <@${Dennyel}> <@${Andris}> 
        [[Bot meghívás]](${botinv})`;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Segítségkérő Panel`,
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(
                `👋 Üdvözöllek <@${interaction.user.id}>, a <@${client.user.id}> BOT, segítség kérő felületén.\n
            \`\`\`Itt tudunk neked abban segíteni, hogy milyen parancsok vannak, és mit csinálnak. Az új rendszernek hála. Le tudtuk a felhasználásokat egyszerűsíteni.\`\`\``)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '\`🤝\` Itt tudsz velünk kapcsolatba lépni.', value: '[[Support Szerver]](https://discord.gg/N5gPTK5x2e)', inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: '**\`/\`** Parancs Kategóriák', value: `>>> ${categoriak}`, inline: true },
                { name: '\`🤖\` Státusz', value: totalServerText, inline: true },
            )
            .setImage("https://cdn.discordapp.com/attachments/1076933550210813954/1180262745027903588/lily_banner.png?ex=657cc856&is=656a5356&hm=348743d0b1ef8c92ea4c9d6452786e3ee8151d9cd19ef3ce5cb88f749dfb3dee&")
            .setColor(0x82272a);

        const components = (state) => [
            new ActionRowBuilder().addComponents(
                new SelectMenuBuilder()
                    .setCustomId('help-menu')
                    .setPlaceholder(`👻 Válassz egy kategóriát`)
                    .setDisabled(state)
                    .addOptions(
                        categories.map((cmd) => {
                            return {
                                label: cmd.directories,
                                value: cmd.directories.toLowerCase(),
                                description: `◽ Parancsok listája a(z) ${cmd.directories} kategoriából.`,
                                emoji: emojis[cmd.directories.toLowerCase()] || null,
                            };
                        })
                    )
            ),
        ];

        const initialMessage = await interaction.reply({
            embeds: [embed],
            components: components(false),
        });

        const filter = (interaction) =>
            interaction.user.id === interaction.member.id;

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
        });

        collector.on('collect', (interaction) => {
            const [directory] = interaction.values;
            const category = categories.find(
                (x) => x.directories.toLowerCase() === directory
            );
        
            if (category) {
                const categoryEmbed = new EmbedBuilder()
                    .setTitle(`🔎 ${formatString(directory)} parancsok`)
                    .setDescription(`• Ezeket a parancsokat nézed • __${directory}__`)
                    .setThumbnail(client.user.displayAvatarURL())
                    .setImage("https://cdn.discordapp.com/attachments/1076933550210813954/1180262745027903588/lily_banner.png?ex=657cc856&is=656a5356&hm=348743d0b1ef8c92ea4c9d6452786e3ee8151d9cd19ef3ce5cb88f749dfb3dee&")
                    .setColor(0x82272a)
                    .addFields(
                        category.commands.map((cmd) => {
                            const premiumInfo = cmd.category ? `${cmd.category}` : ''; // Display category if available
                            return {
                                name: `${process.env.perjel}\`${cmd.name}\`\n${premiumInfo}`,
                                value: `${cmd.description}`,
                                inline: true,
                            };
                        })
                    );
        
                // Ellenőrzés, hogy az interaction objektum tartalmazza-e az update metódust
                if ('update' in interaction) {
                    interaction.update({ embeds: [categoryEmbed] });
                }
            } else {
                // Ha a kategória nem található, akkor kezeld le ezt a helyzetet
                console.error('Hibás kategória', directory);
                interaction.reply('Hibás kategória.');
            }
        });
        
        collector.on("end", () => {
            initialMessage.edit({ components: components(true) });
        });
    },
};
