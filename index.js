import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'
import { body, validationResult } from 'express-validator'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.PASS
  }
});


function trimReplace(value) {
  if (typeof value === 'string') {
    return value.trim().replace(/\s+/g, ' ');
  }
  return value;
}


const validateData = [
  body('name').customSanitizer(trimReplace).notEmpty().withMessage('Empty Name field.')
    .isLength({ min: 2, max: 30 }).withMessage('Name field must be 2 - 30 characters.'),
  body('email').customSanitizer(trimReplace).notEmpty().withMessage('Empty Email field.')
    .isEmail().isLength({ min: 3, max: 100 }).withMessage('Incorrect Email.'),
  body('message').customSanitizer(trimReplace).notEmpty().withMessage('Empty Message field.')
    .isLength({ min: 20, max: 400 }).withMessage('Message field must be 20 - 400 characters.'),
];


app.post('/send-email', validateData, async (req, res) => {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `Сайт-портфолио, заполнена форма от ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Сообщение:</strong> ${message}</p>`,
    });

    res.send('Message has been sent successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(PORT, (err) => {
  if (err) {
      return console.log(err);
  }
  console.log(`Server is running on port ${PORT}`);
})
