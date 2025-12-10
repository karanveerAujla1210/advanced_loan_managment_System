const cron = require("node-cron");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendReportEmail({ to, subject, text, attachment }) {
  if (!Array.isArray(to)) to = [to];
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: to.join(","),
    subject,
    text,
    attachments: attachment ? [attachment] : []
  });
  
  return info;
}

function scheduleDailyPortfolio(exportFn) {
  cron.schedule("0 2 * * *", async () => {
    try {
      const buffer = await exportFn();
      const emails = (process.env.REPORT_EMAILS || "").split(",").filter(Boolean);
      
      if (emails.length > 0) {
        await sendReportEmail({
          to: emails,
          subject: "Daily Portfolio Report",
          text: "Daily portfolio report attached",
          attachment: { 
            filename: `portfolio_${new Date().toISOString().slice(0,10)}.xlsx`, 
            content: buffer 
          }
        });
        console.log("Daily portfolio report sent");
      }
    } catch (error) {
      console.error("Daily portfolio job error:", error);
    }
  });
}

function scheduleWeeklyCollections(exportFn) {
  cron.schedule("0 8 * * 1", async () => {
    try {
      const buffer = await exportFn();
      const emails = (process.env.REPORT_EMAILS || "").split(",").filter(Boolean);
      
      if (emails.length > 0) {
        await sendReportEmail({
          to: emails,
          subject: "Weekly Collections Report",
          text: "Weekly collections report attached",
          attachment: { 
            filename: `collections_${new Date().toISOString().slice(0,10)}.xlsx`, 
            content: buffer 
          }
        });
        console.log("Weekly collections report sent");
      }
    } catch (error) {
      console.error("Weekly collections job error:", error);
    }
  });
}

function scheduleMonthlyAging(exportFn) {
  cron.schedule("0 9 1 * *", async () => {
    try {
      const buffer = await exportFn();
      const emails = (process.env.REPORT_EMAILS || "").split(",").filter(Boolean);
      
      if (emails.length > 0) {
        await sendReportEmail({
          to: emails,
          subject: "Monthly Aging Report",
          text: "Monthly aging report attached",
          attachment: { 
            filename: `aging_${new Date().toISOString().slice(0,10)}.xlsx`, 
            content: buffer 
          }
        });
        console.log("Monthly aging report sent");
      }
    } catch (error) {
      console.error("Monthly aging job error:", error);
    }
  });
}

module.exports = { 
  sendReportEmail, 
  scheduleDailyPortfolio, 
  scheduleWeeklyCollections, 
  scheduleMonthlyAging 
};