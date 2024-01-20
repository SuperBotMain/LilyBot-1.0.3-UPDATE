require("dotenv").config();
const fs = require("fs");
const {
  client,
  EmbedBuilder,
  ActivityType,
  StringSelectMenuBuilder,
} = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
  name: "ready",
  once: true,
  async execute(client, interaction) {
    await mongoose.connect(process.env.mongodb || "", {
      /*keepAlive: true,*/
    });

    /**Premium rendszer */
    const PremiumUser = require("../../Models/Premium"); // A PremiumUser modell helyének megfelelően módosítsd
    const PremiumGuild = require("../../Models/PremiumGuild"); // A PremiumGuild modell helyének megfelelően módosítsd

    // Időzítő beállítása: ellenőrzi a lejárt prémiumokat minden órában
    setInterval(async () => {
        await removeExpiredPremiumUsers();
        await removeExpiredPremiumGuilds();
      }, 1800000); // 30 perc
      

    // Függvény a lejárt felhasználók eltávolításához
    async function removeExpiredPremiumUsers() {
      const expiredUsers = await PremiumUser.find({
        "premium.isEnabled": true,
        "premium.expirationDate": { $lte: new Date() },
      });

      for (const user of expiredUsers) {
        user.premium.isEnabled = false;
        user.premium.expirationDate = null;
        await user.save();
        console.log("[-] (F) Lejárt Premium")
      }
    }

    // Függvény a lejárt szerverek eltávolításához
    async function removeExpiredPremiumGuilds() {
      const expiredGuilds = await PremiumGuild.find({
        "premium.isEnabled": true,
        "premium.expirationDate": { $lte: new Date() },
      });

      for (const guild of expiredGuilds) {
        guild.premium.isEnabled = false;
        guild.premium.expirationDate = null;
        await guild.save();
        console.log("[-] (SZ) Lejárt Premium")
      }
    }






    // Dátumformázás
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours() + 2).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

    // Fájl neve az aktuális dátum és idővel
    const logFilename = `log/${timestamp}-log.txt`;

    // Fájl hozzáfűzési mód
    const logStream = fs.createWriteStream(logFilename, { flags: "a" });

    const originalConsoleLog = console.log;
    console.log = function (message) {
      const logMessage = `[${new Date().toLocaleString()}] ${message}`;
      logStream.write(logMessage + "\n");
      originalConsoleLog.apply(console, arguments);
    };

    /*const activities = [
            `🤖 ${client.user.username} a nevem.`,
            `💻 Engem Deniel és Andris fejleszt.`,
            `🧸 Csatlakozz még ma közösségünkhöz.`
        ];*/

    /*setInterval(() => {
            const status = activities[Math.floor(Math.random() * activities.length)];
            client.user.setPresence({ activities: [{ name: `${status}` }]});
        }, 5000);*/

    /*client.user.setActivity({
            type: ActivityType.Custom,
            name: 'customstatus',
            state: '🧸 újra itt veletek.'
        });*/

    const status = await client.user.setPresence({
      status: "idle",
      activities: [
        {
          type: ActivityType.Custom,
          name: "customstatus",
          state: process.env.PRESENCE,
        },
      ],
    });

    if (mongoose.connect) {
      console.log("\nMongoDB sikeres csatlakozás. ✅");
    }
    console.log(`🟢︲${client.user.username} újra online.`);
    console.log(`🤖︲NAME: ${client.user.tag}`);
    console.log(`🆔︲ID: ${client.user.id}`);
    console.log(`💻︲DEV: ` + process.env.DEV);
    console.log(`💠︲STATUS: ${process.env.PRESENCE}`);

    const channelId = "1163909006646071386"; // Cseréld le a csatorna azonosítójára

    const channel = client.channels.cache.get(channelId);

    if (channel) {
      const readyEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Bot Started`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTitle(`**${client.user.username} elindult. \`ONLINE\`**`)
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0xffae00)
        .setTimestamp();
      await channel.send({ embeds: [readyEmbed] });

      client.on("messageCreate", (message) => {
        console.log(
          `-- ` +
            message.channel.id +
            " " +
            message.guild.name +
            ` - ` +
            message.author.tag +
            ` -> ` +
            message.content
        );
      });

      client.on("interactionCreate", async (commandInteraction) => {
        if (!commandInteraction.isCommand()) return; // Ellenőrizd, hogy valóban egy parancs-interakcióról van-e szó

        const { commandName, user } = commandInteraction;
        console.log(
          `-- ${commandInteraction.guild.name} - ${user.tag} -> ${commandName}`
        );
      });
    } else {
      console.error("❌︲A megadott csatorna nem található.");
    }

    client.on("messageCreate", async (message) => {
      // Ellenőrizzük, hogy az üzenet a megfelelő csatornából származik
      if (message.channel.name === "global-chat" && !message.author.bot) {
        // Először elküldjük az üzenetet az eredeti csatornába
        console.log(
          `-GChat- ${message.guild.name} - ${message.author.tag} -> ${message.content}`
        );

        // Majd továbbítjuk a "global-chat" csatornákra minden szerveren
        forwardMessageToGlobalChat(message);
      }
    });

    // Segédfüggvény az üzenet továbbításához minden "global-chat" csatornára
    async function forwardMessageToGlobalChat(message) {
      // Szerverek lekérése, ahol jelen van a bot
      const guilds = client.guilds.cache;

      guilds.forEach((guild) => {
        // Megkeressük a "global-chat" nevű csatornát a szerveren
        const channel = guild.channels.cache.find(
          (ch) => ch.name === "global-chat"
        );

        if (channel) {
          // Elküldjük az üzenetet a "global-chat" nevű csatornára
          // ...

          const embed = new EmbedBuilder()
            .setAuthor({
              name: `${message.author.tag}`,
              iconURL: message.author.displayAvatarURL(),
            })
            // Ellenőrizze, hogy van-e valós érték a message.content-ben
            .setDescription(message.content || "*Nincs üzenet.*")
            .setColor(0x82272a)
            .setTimestamp()
            .setFooter({
              text: `${message.guild.name}`,
              iconURL: client.user.displayAvatarURL(),
            });

          // Ha az üzenet tartalmaz egyetlen képet, adjuk hozzá az embedhez
          if (message.attachments.size === 1) {
            const attachment = message.attachments.first();
            embed.setImage(attachment.url);
          } else if (message.attachments.size > 1) {
            // Ha több kép van, akkor minden egyes kép linkje külön mezőként adjuk hozzá az embedhez
            const imageLinks = message.attachments.map(
              (attachment) => attachment.url
            );

            for (const [index, link] of imageLinks.entries()) {
              embed.addFields({
                name: `\`Kép ${index + 1}\``,
                value: `[Link](${link})`,
              });
            }
          }

          // ...

          channel.send({ embeds: [embed] }).catch(console.error);
        }
      });
    }
  },
};
