import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate the input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Alle velden zijn verplicht' },
        { status: 400 }
      );
    }

    // Log environment variables (without sensitive data)
    console.log('Email configuration:', {
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
      pass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      to: process.env.EMAIL_TO ? 'Set' : 'Not set'
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO, // The email address where you want to receive feedback
      subject: `Feedback: ${subject}`,
      html: `
        <h2>Nieuwe Feedback</h2>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Onderwerp:</strong> ${subject}</p>
        <p><strong>Bericht:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info);
      return NextResponse.json(
        { message: 'Email succesvol verzonden' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Detailed email error:', {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command
      });
      throw emailError;
    }
  } catch (error) {
    console.error('Error sending email:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { message: 'Er is een fout opgetreden bij het verzenden van de email. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
} 