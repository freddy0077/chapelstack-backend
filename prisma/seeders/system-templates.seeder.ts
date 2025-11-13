import { PrismaClient, TemplateCategory, MessageChannelType } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_TEMPLATES = [
  {
    name: 'Birthday Wishes',
    description: 'Send birthday greetings to members',
    category: TemplateCategory.CELEBRATIONS,
    type: MessageChannelType.EMAIL,
    subject: 'Happy Birthday {firstName}! 🎂',
    bodyText: `Dear {firstName},

Happy Birthday! 🎂🎉

On this special day, we want you to know how blessed we are to have you as part of our {churchName} family. May this year bring you abundant joy, peace, and countless blessings.

We pray that God's grace and favor will follow you all the days of your life.

With love and prayers,
{churchName} Family`,
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #ec4899;">Happy Birthday {firstName}! 🎂</h2>
  <p>Dear {firstName},</p>
  <p>On this special day, we want you to know how blessed we are to have you as part of our <strong>{churchName}</strong> family.</p>
  <p>May this year bring you abundant joy, peace, and countless blessings.</p>
  <p>We pray that God's grace and favor will follow you all the days of your life.</p>
  <p style="margin-top: 30px;">With love and prayers,<br/><strong>{churchName} Family</strong></p>
</div>`,
    variables: [
      { key: '{firstName}', label: 'First Name', description: 'Member\'s first name', example: 'John' },
      { key: '{churchName}', label: 'Church Name', description: 'Name of the church', example: 'Grace Chapel' },
    ],
  },
  {
    name: 'Anniversary Wishes',
    description: 'Send wedding anniversary greetings',
    category: TemplateCategory.CELEBRATIONS,
    type: MessageChannelType.EMAIL,
    subject: 'Happy Anniversary {firstName}! 💍',
    bodyText: `Dear {fullName},

Happy Anniversary! 💍❤️

Congratulations on another year of love, commitment, and partnership. Your marriage is a beautiful testimony of God's faithfulness.

May your love continue to grow stronger with each passing year, and may God's blessings overflow in your home.

Celebrating with you,
{churchName} Family`,
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #f43f5e;">Happy Anniversary {firstName}! 💍</h2>
  <p>Dear {fullName},</p>
  <p>Congratulations on another year of love, commitment, and partnership. Your marriage is a beautiful testimony of God's faithfulness.</p>
  <p>May your love continue to grow stronger with each passing year, and may God's blessings overflow in your home.</p>
  <p style="margin-top: 30px;">Celebrating with you,<br/><strong>{churchName} Family</strong></p>
</div>`,
    variables: [
      { key: '{firstName}', label: 'First Name', description: 'Member\'s first name', example: 'John' },
      { key: '{fullName}', label: 'Full Name', description: 'Member\'s full name', example: 'John Doe' },
      { key: '{churchName}', label: 'Church Name', description: 'Name of the church', example: 'Grace Chapel' },
    ],
  },
  {
    name: 'Absence Follow-up',
    description: 'Follow up with members who have been absent',
    category: TemplateCategory.ATTENDANCE,
    type: MessageChannelType.SMS,
    bodyText: `Hi {firstName}, we missed you at {churchName}! We hope all is well. Looking forward to seeing you soon. God bless! 🙏`,
    variables: [
      { key: '{firstName}', label: 'First Name', description: 'Member\'s first name', example: 'John' },
      { key: '{churchName}', label: 'Church Name', description: 'Name of the church', example: 'Grace Chapel' },
    ],
  },
  {
    name: 'First-Timer Welcome',
    description: 'Welcome first-time visitors',
    category: TemplateCategory.MEMBERSHIP,
    type: MessageChannelType.EMAIL,
    subject: 'Welcome to {churchName}! 👋',
    bodyText: `Dear {firstName},

Thank you for visiting {churchName}! We are thrilled to have you worship with us.

We hope you felt welcomed and experienced God's presence during the service. We would love to get to know you better and help you feel at home in our church family.

If you have any questions or would like to learn more about our church, please don't hesitate to reach out.

Blessings,
{churchName} Team`,
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #3b82f6;">Welcome to {churchName}! 👋</h2>
  <p>Dear {firstName},</p>
  <p>Thank you for visiting <strong>{churchName}</strong>! We are thrilled to have you worship with us.</p>
  <p>We hope you felt welcomed and experienced God's presence during the service. We would love to get to know you better and help you feel at home in our church family.</p>
  <p>If you have any questions or would like to learn more about our church, please don't hesitate to reach out.</p>
  <p style="margin-top: 30px;">Blessings,<br/><strong>{churchName} Team</strong></p>
</div>`,
    variables: [
      { key: '{firstName}', label: 'First Name', description: 'Member\'s first name', example: 'John' },
      { key: '{churchName}', label: 'Church Name', description: 'Name of the church', example: 'Grace Chapel' },
    ],
  },
  {
    name: 'Payment Thank You',
    description: 'Thank members for their donations',
    category: TemplateCategory.GIVING,
    type: MessageChannelType.EMAIL,
    subject: 'Thank You for Your Generous Gift',
    bodyText: `Dear {firstName},

Thank you for your generous gift of {amount} on {paymentDate}.

Your faithful giving enables us to continue our ministry and reach more people with the Gospel. We are deeply grateful for your partnership in advancing God's kingdom.

May God bless you abundantly for your generosity.

Receipt Number: {receiptNumber}

In gratitude,
{churchName}`,
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #10b981;">Thank You for Your Generous Gift</h2>
  <p>Dear {firstName},</p>
  <p>Thank you for your generous gift of <strong>{amount}</strong> on {paymentDate}.</p>
  <p>Your faithful giving enables us to continue our ministry and reach more people with the Gospel. We are deeply grateful for your partnership in advancing God's kingdom.</p>
  <p>May God bless you abundantly for your generosity.</p>
  <p style="margin-top: 20px; padding: 10px; background: #f3f4f6; border-radius: 5px;">
    <strong>Receipt Number:</strong> {receiptNumber}
  </p>
  <p style="margin-top: 30px;">In gratitude,<br/><strong>{churchName}</strong></p>
</div>`,
    variables: [
      { key: '{firstName}', label: 'First Name', description: 'Member\'s first name', example: 'John' },
      { key: '{amount}', label: 'Amount', description: 'Payment amount', example: 'GH₵ 100.00' },
      { key: '{paymentDate}', label: 'Payment Date', description: 'Date of payment', example: 'November 8, 2025' },
      { key: '{receiptNumber}', label: 'Receipt Number', description: 'Payment receipt number', example: 'RCP-2025-001' },
      { key: '{churchName}', label: 'Church Name', description: 'Name of the church', example: 'Grace Chapel' },
    ],
  },
  {
    name: 'Event Reminder',
    description: 'Remind members about upcoming events',
    category: TemplateCategory.EVENTS,
    type: MessageChannelType.SMS,
    bodyText: `Hi {firstName}! Reminder: {eventName} is coming up on {eventDate} at {eventTime}. Location: {eventLocation}. See you there! 📅`,
    variables: [
      { key: '{firstName}', label: 'First Name', description: 'Member\'s first name', example: 'John' },
      { key: '{eventName}', label: 'Event Name', description: 'Name of the event', example: 'Sunday Service' },
      { key: '{eventDate}', label: 'Event Date', description: 'Date of the event', example: 'November 10, 2025' },
      { key: '{eventTime}', label: 'Event Time', description: 'Time of the event', example: '9:00 AM' },
      { key: '{eventLocation}', label: 'Event Location', description: 'Location of the event', example: 'Main Sanctuary' },
    ],
  },
];

export async function seedSystemTemplates(organisationId: string, userId: string) {
  console.log('Seeding system templates...');

  for (const template of SYSTEM_TEMPLATES) {
    const existing = await prisma.messageTemplate.findFirst({
      where: {
        name: template.name,
        organisationId,
        isSystem: true,
      },
    });

    if (!existing) {
      await prisma.messageTemplate.create({
        data: {
          ...template,
          isSystem: true,
          isActive: true,
          organisationId,
          createdBy: userId,
        },
      });
      console.log(`✓ Created system template: ${template.name}`);
    } else {
      console.log(`- System template already exists: ${template.name}`);
    }
  }

  console.log('System templates seeding complete!');
}

// Run if called directly
if (require.main === module) {
  const organisationId = process.argv[2];
  const userId = process.argv[3];

  if (!organisationId || !userId) {
    console.error('Usage: ts-node system-templates.seeder.ts <organisationId> <userId>');
    process.exit(1);
  }

  seedSystemTemplates(organisationId, userId)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding templates:', error);
      process.exit(1);
    });
}
