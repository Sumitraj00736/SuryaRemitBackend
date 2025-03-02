const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5002;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ 1. Configure Cloudinary
cloudinary.config({
  cloud_name: "dhah3xwej",
  api_key: "881198129764915",
  api_secret: "XiXKdhaKY3KFE96j0JZiTv7NjvE",
});

// ✅ 2. Configure Multer (File Upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USERID,
    pass: process.env.PASSKEY,
  },
});

// ✅ 3. Job Application Route with CV Upload
app.post("/send-email", upload.single("cv"), async (req, res) => {
  console.log("Received Request:", req.body);
  console.log("Received File:", req.file);
  try {

    const formType = req.body.formType; 
      if (!req.body.formType) {
        console.error("🚨 Missing formType");
        return res.status(400).json({ error: "Missing formType" });
      }
  
      if (req.body.formType === "job") {
        if (!req.file) {
          console.error("🚨 Missing CV file");
          return res.status(400).json({ error: "CV file is required" });
        }
        if (req.file.mimetype !== "application/pdf") {
          console.error("🚨 Invalid file type:", req.file.mimetype);
          return res.status(400).json({ error: "Only PDF files are allowed" });
        }
      }
    
    let emailBody = "";
    let subject = "";

    switch (formType) {
      case "job": {
        const { fullName, email, skills, country } = req.body;
      
        if (!req.file || req.file.mimetype !== "application/pdf") {
          return res.status(400).json({ error: "Invalid file type. Only PDFs are allowed." });
        }
      
        try {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "cv_uploads",
              format: "pdf",
              access_mode: "public", 
            },
            async (error, uploadResult) => {
              if (error) {
                console.error("Cloudinary Upload Error:", error);
                return res.status(500).json({ error: "CV upload failed", details: error.message });
              }
      
              console.log("Upload successful:", uploadResult);
              const cvLink = uploadResult.secure_url;
              console.log("CV Link:", cvLink); // Verify this link in the browser
      
              const emailBody = `
                <p>A new job application has been submitted:</p>
                <p>Full Name: ${fullName}</p>
                <p>Email: ${email}</p>
                <p>Skills: ${skills}</p>
                <p>Country: ${country}</p>
                <p>CV: <a href="${cvLink}">Download CV</a></p>
              `;
      
              const subject = `Job Application from ${fullName}`;
      
              const mailOptions = {
                to: process.env.RECIEVED_EMAIL,
                subject,
                html: emailBody,
              };
      
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Error sending email:", error);
                  return res.status(500).json({ error: "Failed to send email" });
                }
                console.log("Email sent:", info.response);
              });
      
              res.status(200).json({ message: "Application submitted successfully!", cvLink });
            }
          ).end(req.file.buffer);
        } catch (error) {
          console.error("Error:", error);
          res.status(500).json({ error: "Internal server error" });
        }
        break;
      }
      
      

      // ✅ Other Forms (Partner, Grievance, Agent)
      case "partner": {
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
          ${countryName === "Nepal" ? `District: ${district}` : ""}
          Street Address: ${streetAddress}
          City: ${city}
          State/Province: ${stateProvince}
          Postal/Zip Code: ${postalZipCode}

          Message:
          ${message}
        `;
        subject = `New Partner Form Submission from ${companyName}`;
        break;
      }

      case "grievance": {
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
      }

      case "agent": {
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
      }

      default:
        return res.status(400).json({ error: "Invalid form type" });
    }

    // ✅ Send Email (For Forms Without CV)
    if (formType !== "job") {
      const mailOptions = {
        to: process.env.RECIEVED_EMAIL,
        subject,
        text: emailBody,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          res.status(500).json({ error: "Failed to send email" });
        } else {
          console.log("Email sent:", info.response);
          res.status(200).json({ message: "Email sent successfully!" });
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
