// // import * as functions from 'firebase-functions';
// // import * as nodemailer from 'nodemailer';

// // // Set up the Gmail transporter using Nodemailer
// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: {
// //     user: functions.config().gmail.email, // Your Gmail email stored in Firebase config
// //     pass: functions.config().gmail.password, // App-specific password stored in Firebase config
// //   },
// // });

// // // Firestore Trigger: Send Acceptance Email when application status is 'accepted'
// // export const sendAcceptanceEmail = functions.firestore
// //   .document('applications/{applicationId}')
// //   .onUpdate(async (change: { after: { data: () => any; }; }) => {
// //     const afterData = change.after.data();
    
// //     // Check if the application status is 'accepted'
// //     if (afterData?.status === 'accepted') {
// //       const mailOptions = {
// //         from: 'Your Organization <noreply@yourdomain.com>',
// //         to: afterData.email,
// //         subject: 'Congratulations! Your Internship Application Has Been Accepted',
// //         html: `
// //           <h2>Dear ${afterData.fullName},</h2>
// //           <p>We are pleased to inform you that your application for the ${afterData.internshipTitle} internship has been accepted!</p>
// //           <p>Best regards,<br/>The Hiring Team</p>
// //         `,
// //       };

// //       try {
// //         // Send the email via Gmail SMTP
// //         await transporter.sendMail(mailOptions);
// //         console.log(`Acceptance email sent to ${afterData.email}`);
// //       } catch (error) {
// //         console.error('Error sending email:', error);
// //         throw new functions.https.HttpsError('internal', 'Email sending failed');
// //       }
// //     }

// //     return null;
// //   });



// import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
// import * as logger from 'firebase-functions/logger';
// import * as nodemailer from 'nodemailer';
// import { config } from 'firebase-functions';

// // ✅ Set up Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: config().gmail.email,     // Use firebase functions:config:set gmail.email="..."
//     pass: config().gmail.password, // Use firebase functions:config:set gmail.password="..."
//   },
// });

// // ✅ Firestore trigger for updated documents
// export const sendAcceptanceEmail = onDocumentUpdated(
//   'applications/{applicationId}',
//   async (event) => {
//     const beforeData = event.data?.before?.data();
//     const afterData = event.data?.after?.data();

//     // ✅ Only send if status changes to "accepted"
//     if (
//       beforeData?.status !== 'accepted' &&
//       afterData?.status === 'accepted'
//     ) {
//       const mailOptions = {
//         from: `Your Organization <${config().gmail.email}>`,
//         to: afterData.email,
//         subject: 'Congratulations! Your Internship Application Has Been Accepted',
//         html: `
//           <h2>Dear ${afterData.fullName},</h2>
//           <p>We are pleased to inform you that your application for the <strong>${afterData.internshipTitle}</strong> internship has been accepted!</p>
//           <p>Best regards,<br/>The Hiring Team</p>
//         `,
//       };

//       try {
//         await transporter.sendMail(mailOptions);
//         logger.log(`✅ Email sent to ${afterData.email}`);
//       } catch (error) {
//         logger.error('❌ Error sending email:', error);
//         throw new Error('Email sending failed');
//       }
//     }

//     return;
//   }
// );

