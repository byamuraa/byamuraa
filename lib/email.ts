import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || '2525');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'byamuraa@gmail.com';

function createTransporter() {
  if (SMTP_USER && SMTP_USER !== 'mock_user') {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return null;
}

export async function sendOrderConfirmation(toEmail: string, order: any) {
  const transporter = createTransporter();
  const subject = `Order Confirmed - Amuraa Drop [#${order._id.toString().slice(-6).toUpperCase()}]`;

  const itemSummary = order.items
    .map((item: any) => `- ${item.name} (${item.fabric}) x${item.quantity} - $${item.price}`)
    .join('\n');

  const textContent = `
Thank you for your prepaid drop order with Amuraa! 

We've received your payment of $${order.totalAmount}.
Your order is currently: ${order.orderStatus}

Order Details:
Order ID: ${order._id}
Items:
${itemSummary}

Shipping Address:
${order.shippingAddress.name}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}

We will notify you via email with tracking details as soon as your items are handmade and shipped!

Crafted with Soul, Worn with Pride.
Amuraa Team
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"Amuraa Drops" <drops@amuraa.com>',
        to: toEmail,
        subject,
        text: textContent,
      });
      console.log(`Order confirmation email sent to ${toEmail}`);
    } catch (error) {
      console.error('Nodemailer failed, order logs created in server console:', error);
    }
  } else {
    console.log('\n--- MOCK EMAIL OUTBOX (ORDER CONFIRMATION) ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(textContent);
    console.log('----------------------------------------------\n');
  }
}

export async function sendContactNotification(name: string, fromEmail: string, message: string) {
  const transporter = createTransporter();
  const subject = `New Contact Form Inquiry from ${name}`;
  const textContent = `
New inquiry received from Amuraa Contact Form:

Name: ${name}
Email: ${fromEmail}
Message:
${message}
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"Amuraa Form" <contact@amuraa.com>',
        to: ADMIN_EMAIL,
        subject,
        text: textContent,
      });
      console.log(`Contact inquiry email sent to admin`);
    } catch (error) {
      console.error('Nodemailer contact failed, logged to console:', error);
    }
  } else {
    console.log('\n--- MOCK EMAIL OUTBOX (CONTACT INQUIRY) ---');
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(textContent);
    console.log('-------------------------------------------\n');
  }
}

export async function sendAdminOrderNotification(order: any) {
  const transporter = createTransporter();
  const subject = `[Admin Alert] New Order Received - Amuraa Drop [#${order._id.toString().slice(-6).toUpperCase()}]`;

  const itemSummary = order.items
    .map((item: any) => `- ${item.name} (${item.fabric}) x${item.quantity} - $${item.price}`)
    .join('\n');

  const textContent = `
A new order has been placed on Amuraa Drops!

Order Details:
Order ID: ${order._id}
Customer Email: ${order.email}
Total Amount: $${order.totalAmount}
Payment Status: ${order.paymentStatus}

Items:
${itemSummary}

Shipping Address:
${order.shippingAddress.name}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"Amuraa Orders" <orders@amuraa.com>',
        to: ADMIN_EMAIL,
        subject,
        text: textContent,
      });
      console.log(`Admin order notification email sent to ${ADMIN_EMAIL}`);
    } catch (error) {
      console.error('Nodemailer failed to send admin notification:', error);
    }
  } else {
    console.log('\n--- MOCK EMAIL OUTBOX (ADMIN ORDER NOTIFICATION) ---');
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(textContent);
    console.log('----------------------------------------------------\n');
  }
}
