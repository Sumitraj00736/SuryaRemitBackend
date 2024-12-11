const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5002;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sumitraj00736@gmail.com',
    pass: 'njjxlkkfikunyvwq', 
  },
});

// app.post('/send-email', (req, res) => {

//   const { name, email, message } = req.body;

//   const mailOptions = {
//     from: email,
//     to: 'gamersnepal00736@gmail.com', 
//     subject: `Message from ${name}`,
//     text: `You received a message from ${name} (${email}):\n\n${message}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//       res.status(500).json({ error: 'Failed to send email' });
//     } else {
//       console.log('Email sent:', info.response);
//       res.status(200).json({ message: 'Email sent successfully!' });
//     }
//   });
// });



app.post('/send-email', (req, res) => {
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
  
    // Compose email body
    const emailBody = `
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
  
    // Mail options
    const mailOptions = {
      from: 'no-reply@yourdomain.com', // Replace with your preferred "from" email
      to: 'gamersnepal00736@gmail.com', // Recipient email
      subject: `New Partner Form Submission from ${companyName}`,
      text: emailBody,

    };
  
    // Send email
    transporter.sendMail(mailOptions , (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully!' });
      }
    });
  });
  
// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
