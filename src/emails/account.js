const sgMail = require("@sendgrid/mail"); //require sendgrid Node module
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // set sendgrid API key

// Send a welcome email
const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "antonio.k.scotland@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
  });
};

// send cancellation email
const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "antonio.k.scotland@gmail.com",
    subject: "Account cancelled",
    text: `Sorry to see you go ${name}. Please let us know what we could have done better to keep you. I hope to see you again!`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
