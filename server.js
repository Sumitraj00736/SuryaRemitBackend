const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = 5002;

app.use(express.json());
app.use(cors({
    origin: 'https://www.suryaremit.com',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
}));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:process.env.USERID,
    pass:process.env.PASSKEY, 
  },
});


app.post('/send-email', (req, res) => {
  const formType = req.body.formType;
  let emailBody = '';
  let subject = '';

  switch (formType) {
    case 'partner':
      const {
        companyName,
        companyAddress,
        telephoneNo,
        countryName,
        district,
        streetAddress,
        city,
        stateProvince,
        postalZipCode,
        message,
      } = req.body;

      emailBody = `
        You received a new message from the "Be Our Partner" form:

        Company/Pvt. Firm Name: ${companyName}
        Company Address: ${companyAddress}
        Telephone No: ${telephoneNo}
        Country Name: ${countryName}
        ${countryName === 'Nepal' ? `District: ${district}` : ''}
        Street Address: ${streetAddress}
        City: ${city}
        State/Province: ${stateProvince}
        Postal/Zip Code: ${postalZipCode}

        Message:
        ${message}
      `;
      subject = `New Partner Form Submission from ${companyName}`;
      break;

    case 'job':
      const { fullName, email, skills, country, cvLink } = req.body;

      emailBody = `
        A new job application has been submitted:

        Full Name: ${fullName}
        Email: ${email}
        Skills: ${skills}
        Country: ${country}
        CV: ${cvLink}
      `;
      subject = `Job Application from ${fullName}`;
      break;

    case 'grievance':
      const {
        modeOfTransfer,
        Name,
        grievanceStreetAddress,
        emailAddress,
        phone,
        agentName,
        icn,
        grievanceMessage,
        date,
        amount,
      } = req.body;

      emailBody = `
        A grievance has been submitted:

        Mode of Transfer: ${modeOfTransfer}
        Name: ${Name}
        Address: ${grievanceStreetAddress}
        Email: ${emailAddress}
        Phone: ${phone}
        Agent Name: ${agentName}
        ICN: ${icn}
        Date:${date}
        Amount:${amount}

        Message:
        ${grievanceMessage}
      `;
      subject = `Grievance Submission from ${Name}`;
      break;

    case 'agent':
      const {
        AgentcompanyName,
        AgentcompanyAddress,
        authorizedPerson,
        contactPerson,
        contactNumber,
      } = req.body;

      emailBody = `
        An Agent has been submitted:

        Company Name: ${AgentcompanyName}
        Company Address: ${AgentcompanyAddress}
        Authorized Person: ${authorizedPerson}
        Contact Person: ${contactPerson}
        Contact Number: ${contactNumber}
      `;
      subject = `Agent Submission from ${AgentcompanyName}`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid form type' });
  }

  const mailOptions = {
    to: process.env.RECIEVED_EMAIL,
    subject,
    text: emailBody,
  };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);

      } else {
        console.log( info.response);
          res.status(200).json({ message: 'emails sent successfully!' });

      }
    });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
