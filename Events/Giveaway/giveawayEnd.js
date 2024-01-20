const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
} = require("discord.js");
const Giveaway = require("../../Models/Giveaway");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    setInterval(async () => {
      const giveaways = await Giveaway.find();

      for (const giveaway of giveaways) {
        if (!giveaway.ended) {
          const now = Date.now();
          if (now >= giveaway.endTime.getTime()) {
            try {
              const channel = await client.channels.fetch(giveaway.channelId);
              const message = await channel.messages.fetch(giveaway.messageId);

              const winners = selectWinners(
                giveaway.participants,
                giveaway.winnersCount
              );
              const winnersText = winners
                .map((winner) => `<@${winner}>`)
                .join(", ");
              const announcement = `🎉 Gratulálunk a nyertes(ek): ${winnersText}!`;

              const embed = new EmbedBuilder()
                .setDescription(`Nyertes(ek): ${winnersText}`)
                .setColor("Green")
                .setTitle("Végetért a nyereményjáték!")
                .setFooter({ text: `${giveaway.id}` });
              await message.edit({ embeds: [embed], components: [] });

              await channel.send(announcement);


              //const existingGiveaway = await Giveaway.findById(giveaway._id);
              //if (existingGiveaway) {
              //  await Giveaway.deleteOne({ _id: existingGiveaway._id });
              //}
              giveaway.ended = true;
              await giveaway.save();


            } catch (error) {
              console.error("Error in giveaway check:", error);
            }
          }
        }
      }
    }, 1000);
  },
};

function selectWinners(participants, count) {
  return participants.slice(0, count);
}
