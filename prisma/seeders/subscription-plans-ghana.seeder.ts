import { PrismaClient, SubscriptionInterval } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedGhanaSubscriptionPlans() {
  console.log('🇬🇭 Seeding Ghana subscription plans...');

  // First, find an organization to associate the plans with
  // We'll use the first organization or create a default one
  let organization = await prisma.organisation.findFirst();

  if (!organization) {
    console.log('No organization found, creating default organization...');
    organization = await prisma.organisation.create({
      data: {
        name: 'Chapel Stack Ghana',
        email: 'admin@chapelstack.com.gh',
        address: 'Accra, Ghana',
        state: 'ACTIVE',
        primaryColor: '#1E40AF', // Blue
        secondaryColor: '#F59E0B', // Amber/Gold
        accentColor: '#10B981', // Green
        currency: 'GHS',
        timezone: 'Africa/Accra',
        country: 'Ghana',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Ghana Cedi subscription plans
  const ghanaPlans = [
    {
      name: 'Starter Plan',
      description:
        'Perfect for small churches and ministries getting started with digital management',
      amount: 5000, // GHS 50.00 (stored in pesewas - smallest unit)
      currency: 'GHS',
      interval: SubscriptionInterval.MONTHLY,
      trialPeriodDays: 14,
      isActive: true,
      paystackPlanCode: 'PLN_starter_gh',
      features: [
        'Up to 100 members',
        'Basic attendance tracking',
        'Event management',
        'Basic reporting',
        'Email support',
        'Mobile app access',
      ],
      metadata: {
        targetAudience: 'Small churches (50-100 members)',
        popularPlan: false,
        ghanaSpecific: true,
        supportLevel: 'Basic',
        maxMembers: 100,
        maxEvents: 10,
        storageLimit: '1GB',
      },
    },
    {
      name: 'Growth Plan',
      description:
        'Ideal for growing churches with expanding congregation and ministry activities',
      amount: 12000, // GHS 120.00
      currency: 'GHS',
      interval: SubscriptionInterval.MONTHLY,
      trialPeriodDays: 14,
      isActive: true,
      paystackPlanCode: 'PLN_growth_gh',
      features: [
        'Up to 500 members',
        'Advanced attendance tracking',
        'Event management with registration',
        'Financial management',
        'Advanced reporting & analytics',
        'SMS notifications',
        'Email support',
        'Mobile app access',
        'Custom forms',
        'Member directory',
      ],
      metadata: {
        targetAudience: 'Medium churches (100-500 members)',
        popularPlan: true,
        ghanaSpecific: true,
        supportLevel: 'Standard',
        maxMembers: 500,
        maxEvents: 50,
        storageLimit: '5GB',
        smsCredits: 1000,
      },
    },
    {
      name: 'Professional Plan',
      description:
        'Comprehensive solution for established churches with multiple ministries and branches',
      amount: 25000, // GHS 250.00
      currency: 'GHS',
      interval: SubscriptionInterval.MONTHLY,
      trialPeriodDays: 14,
      isActive: true,
      paystackPlanCode: 'PLN_professional_gh',
      features: [
        'Up to 2000 members',
        'Multi-branch management',
        'Advanced financial management',
        'Donation tracking & receipts',
        'Advanced event management',
        'Custom workflows',
        'Advanced reporting & analytics',
        'SMS & email notifications',
        'Priority support',
        'Mobile app access',
        'API access',
        'Custom integrations',
        'Member portal',
        'Online giving platform',
      ],
      metadata: {
        targetAudience: 'Large churches (500-2000 members)',
        popularPlan: false,
        ghanaSpecific: true,
        supportLevel: 'Priority',
        maxMembers: 2000,
        maxEvents: 200,
        storageLimit: '20GB',
        smsCredits: 5000,
        branches: 5,
      },
    },
    {
      name: 'Enterprise Plan',
      description:
        'Full-featured solution for mega churches, denominations, and church networks',
      amount: 50000, // GHS 500.00
      currency: 'GHS',
      interval: SubscriptionInterval.MONTHLY,
      trialPeriodDays: 30,
      isActive: true,
      paystackPlanCode: 'PLN_enterprise_gh',
      features: [
        'Unlimited members',
        'Unlimited branches',
        'Complete financial suite',
        'Advanced donation management',
        'Multi-currency support',
        'Advanced workflow automation',
        'Custom reporting & dashboards',
        'White-label mobile app',
        'Dedicated support manager',
        'API access & webhooks',
        'Custom integrations',
        'Advanced security features',
        'Data export & backup',
        'Training & onboarding',
        'Custom development',
      ],
      metadata: {
        targetAudience: 'Mega churches & denominations (2000+ members)',
        popularPlan: false,
        ghanaSpecific: true,
        supportLevel: 'Dedicated',
        maxMembers: -1, // Unlimited
        maxEvents: -1, // Unlimited
        storageLimit: '100GB',
        smsCredits: 20000,
        branches: -1, // Unlimited,
        dedicatedSupport: true,
      },
    },
    {
      name: 'Annual Growth Plan',
      description:
        'Growth Plan with annual billing - Save 20% compared to monthly billing',
      amount: 115200, // GHS 1,152.00 (12 months * 120 * 0.8 = 20% discount)
      currency: 'GHS',
      interval: SubscriptionInterval.YEARLY,
      trialPeriodDays: 14,
      isActive: true,
      paystackPlanCode: 'PLN_growth_annual_gh',
      features: [
        'All Growth Plan features',
        '20% savings vs monthly billing',
        'Priority onboarding',
        'Quarterly business reviews',
        'Extended trial period',
      ],
      metadata: {
        targetAudience: 'Medium churches (100-500 members)',
        popularPlan: true,
        ghanaSpecific: true,
        supportLevel: 'Standard+',
        maxMembers: 500,
        maxEvents: 50,
        storageLimit: '5GB',
        smsCredits: 1000,
        discount: 20,
        billingCycle: 'annual',
      },
    },
    {
      name: 'Annual Professional Plan',
      description:
        'Professional Plan with annual billing - Save 20% compared to monthly billing',
      amount: 240000, // GHS 2,400.00 (12 months * 250 * 0.8 = 20% discount)
      currency: 'GHS',
      interval: SubscriptionInterval.YEARLY,
      trialPeriodDays: 14,
      isActive: true,
      paystackPlanCode: 'PLN_professional_annual_gh',
      features: [
        'All Professional Plan features',
        '20% savings vs monthly billing',
        'Priority onboarding',
        'Quarterly business reviews',
        'Extended trial period',
        'Free migration assistance',
      ],
      metadata: {
        targetAudience: 'Large churches (500-2000 members)',
        popularPlan: false,
        ghanaSpecific: true,
        supportLevel: 'Priority+',
        maxMembers: 2000,
        maxEvents: 200,
        storageLimit: '20GB',
        smsCredits: 5000,
        branches: 5,
        discount: 20,
        billingCycle: 'annual',
      },
    },
  ];

  // Create subscription plans
  for (const planData of ghanaPlans) {
    try {
      const existingPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          name: planData.name,
        },
      });

      if (existingPlan) {
        console.log(`📋 Plan "${planData.name}" already exists, updating...`);
        await prisma.subscriptionPlan.update({
          where: { id: existingPlan.id },
          data: {
            description: planData.description,
            amount: planData.amount,
            currency: planData.currency,
            interval: planData.interval,
            trialPeriodDays: planData.trialPeriodDays,
            isActive: planData.isActive,
            paystackPlanCode: planData.paystackPlanCode,
            features: planData.features,
            metadata: planData.metadata,
            updatedAt: new Date(),
          },
        });
      } else {
        console.log(
          `📋 Creating plan: ${planData.name} - GHS ${(planData.amount / 100).toFixed(2)}`,
        );
        await prisma.subscriptionPlan.create({
          data: {
            name: planData.name,
            description: planData.description,
            amount: planData.amount,
            currency: planData.currency,
            interval: planData.interval,
            trialPeriodDays: planData.trialPeriodDays,
            isActive: planData.isActive,
            paystackPlanCode: planData.paystackPlanCode,
            features: planData.features,
            metadata: planData.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`❌ Error creating plan "${planData.name}":`, error);
    }
  }

  console.log('✅ Ghana subscription plans seeded successfully!');
  console.log(
    `📊 Created ${ghanaPlans.length} subscription plans in Ghana Cedis (GHS)`,
  );
  console.log('💰 Pricing summary:');
  console.log('   - Starter: GHS 50/month');
  console.log('   - Growth: GHS 120/month (Most Popular)');
  console.log('   - Professional: GHS 250/month');
  console.log('   - Enterprise: GHS 500/month');
  console.log('   - Annual plans include 20% discount');
}

export async function cleanupGhanaSubscriptionPlans() {
  console.log('🧹 Cleaning up Ghana subscription plans...');

  const deletedPlans = await prisma.subscriptionPlan.deleteMany({
    where: {
      currency: 'GHS',
    },
  });

  console.log(`✅ Deleted ${deletedPlans.count} Ghana subscription plans`);
}

// Run seeder if called directly
if (require.main === module) {
  seedGhanaSubscriptionPlans()
    .catch((e) => {
      console.error('❌ Error seeding Ghana subscription plans:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
