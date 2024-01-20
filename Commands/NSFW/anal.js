const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const NSFW = require("discord-nsfw");
const nsfw = new NSFW();
require('dotenv').config();
const premiumemoji = process.env.premium;
const serverpremiumemoji = process.env.server_premium;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anal') // Name Of Slash Command
        .setDescription('Egy adott felhasználó összes információja.')
        .setNSFW(),

    async execute(interaction, client) {
        const image = await nsfw.anal();
        const user = interaction.user;
    const guildId = interaction.guildId;





    try {
        // Ellenőrzi, hogy a szervernek van-e premium rendszer engedélye
        const dbGuild = await Guild.findOne({ guildId });
  
        if (dbGuild && dbGuild.premium.isEnabled) {
          // Szervernek van premium engedélye
        const kEmbed = new EmbedBuilder()
            .setColor(0xffae00)
            .setImage(image)



        await interaction.deferReply({ fetchReply: true })
        await interaction.editReply({ embeds: [kEmbed] })
    }else {
        // Szervernek nincs premium engedélye
        // Ellenőrzi, hogy a felhasználónak van-e premium rendszer engedélye
        const dbUser = await User.findOne({ discordId: user.id });

        if (dbUser && dbUser.premium.isEnabled) {
          // A felhasználónak van premium engedélye
          const kEmbed = new EmbedBuilder()
            .setColor(0xffae00)
            .setImage(image);

          await interaction.deferReply({ fetchReply: true });
          await interaction.editReply({ embeds: [kEmbed] });
        }else {
            // A felhasználónak nincs premium engedélye sem
            interaction.reply("Nincs premiumod sem a szerveren, sem a felhasználónak.");
          }
        }
      } catch (error) {
        console.error(error);
        interaction.reply("Hiba történt a parancs használata közben.");
      }
    },
    category: `${premiumemoji}${serverpremiumemoji}`,
  };