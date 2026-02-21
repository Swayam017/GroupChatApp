const cron = require("node-cron");
const { Op } = require("sequelize");
const Message = require("../models/Message");
const ArchivedMessage = require("../models/ArchivedMessage");

function startArchiveJob() {

  // Runs every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
//cron.schedule("*/1 * * * *", async () => {

    console.log("Running archive job...");

    const oneDayAgo = new Date();
   oneDayAgo.setDate(oneDayAgo.getDate() - 1);
   //oneDayAgo.setMinutes(oneDayAgo.getMinutes() - 1);


    try {

      //  Find old messages
      const oldMessages = await Message.findAll({
        where: {
          createdAt: {
            [Op.lt]: oneDayAgo
          }
        }
      });

      if (oldMessages.length === 0) {
        console.log("No old messages to archive");
        return;
      }

      // Insert into ArchivedMessage table
      await ArchivedMessage.bulkCreate(
        oldMessages.map(msg => msg.toJSON())
      );

      // Delete from main Message table
      await Message.destroy({
        where: {
          createdAt: {
            [Op.lt]: oneDayAgo
          }
        }
      });

      console.log(`Archived ${oldMessages.length} messages`);

    } catch (err) {
      console.error("Archive job error:", err);
    }

  });

}

module.exports = startArchiveJob;
