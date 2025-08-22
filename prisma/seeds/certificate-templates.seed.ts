import {
  PrismaClient,
  ChurchDenomination,
  CertificateSacramentType,
} from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCertificateTemplates() {
  console.log('🌱 Seeding certificate templates...');

  const templates = [
    // Catholic Templates
    {
      id: 'catholic-baptism-traditional',
      name: 'Traditional Catholic Baptism',
      denomination: ChurchDenomination.CATHOLIC,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Traditional Catholic baptism certificate with Latin prayers and papal blessing',
      previewUrl: '/templates/previews/catholic-baptism-traditional.png',
      templateUrl: '/templates/catholic-baptism-traditional.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'SCRIPTURE',
          content:
            'Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit. - Matthew 28:19',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'PRAYER',
          content:
            'Almighty and eternal God, who hast vouchsafed to regenerate this thy servant by Water and the Holy Ghost, and hast given unto him forgiveness of all his sins.',
          position: 'FOOTER',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'godparents',
          label: 'Godparents',
          type: 'TEXT',
          required: true,
          position: { x: 100, y: 250 },
          styling: {
            fontSize: 14,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#8B0000',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Times New Roman',
        headerFont: 'Trajan Pro',
        bodyFont: 'Times New Roman',
        borderStyle: 'CLASSIC',
        backgroundPattern: 'vatican-seal',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },
    {
      id: 'catholic-confirmation-traditional',
      name: 'Traditional Catholic Confirmation',
      denomination: ChurchDenomination.CATHOLIC,
      sacramentType: CertificateSacramentType.CONFIRMATION,
      description:
        'Traditional Catholic confirmation certificate with episcopal blessing',
      previewUrl: '/templates/previews/catholic-confirmation-traditional.png',
      templateUrl: '/templates/catholic-confirmation-traditional.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'SCRIPTURE',
          content:
            'But when the Helper comes, whom I will send to you from the Father, the Spirit of truth, who proceeds from the Father, he will bear witness about me. - John 15:26',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'BLESSING',
          content:
            'May the Holy Spirit strengthen you with His gifts and lead you in the way of salvation.',
          position: 'FOOTER',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'sponsor',
          label: 'Confirmation Sponsor',
          type: 'TEXT',
          required: true,
          position: { x: 100, y: 250 },
          styling: {
            fontSize: 14,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#8B0000',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Times New Roman',
        headerFont: 'Trajan Pro',
        bodyFont: 'Times New Roman',
        borderStyle: 'CLASSIC',
        backgroundPattern: 'holy-spirit-dove',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },
    {
      id: 'catholic-matrimony-traditional',
      name: 'Traditional Catholic Marriage',
      denomination: ChurchDenomination.CATHOLIC,
      sacramentType: CertificateSacramentType.MATRIMONY,
      description:
        'Traditional Catholic marriage certificate with nuptial blessing',
      previewUrl: '/templates/previews/catholic-matrimony-traditional.png',
      templateUrl: '/templates/catholic-matrimony-traditional.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'SCRIPTURE',
          content:
            'Therefore what God has joined together, let no one separate. - Mark 10:9',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'BLESSING',
          content:
            'May the Lord bless you and keep you. May the Lord make his face shine upon you and be gracious to you.',
          position: 'FOOTER',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'witnesses',
          label: 'Witnesses',
          type: 'TEXT',
          required: true,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 12,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#8B0000',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Times New Roman',
        headerFont: 'Trajan Pro',
        bodyFont: 'Times New Roman',
        borderStyle: 'ORNATE',
        backgroundPattern: 'wedding-rings',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },

    // Protestant Templates
    {
      id: 'baptist-baptism-immersion',
      name: 'Baptist Immersion Baptism',
      denomination: ChurchDenomination.BAPTIST,
      sacramentType: CertificateSacramentType.IMMERSION_BAPTISM,
      description:
        'Baptist baptism certificate emphasizing full immersion and personal faith',
      previewUrl: '/templates/previews/baptist-baptism-immersion.png',
      templateUrl: '/templates/baptist-baptism-immersion.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'SCRIPTURE',
          content:
            'And Jesus, when he was baptized, went up straightway out of the water: and, lo, the heavens were opened unto him. - Matthew 3:16',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'PRAYER',
          content:
            'We rejoice in your public declaration of faith and commitment to follow Christ.',
          position: 'FOOTER',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'testimony-date',
          label: 'Date of Testimony',
          type: 'DATE',
          required: false,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 12,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#4169E1',
        secondaryColor: '#FFFFFF',
        accentColor: '#87CEEB',
        fontFamily: 'Arial',
        headerFont: 'Georgia',
        bodyFont: 'Arial',
        borderStyle: 'MODERN',
        backgroundPattern: 'water-waves',
        logoPosition: 'TOP_LEFT',
      },
      language: 'en',
      region: 'US',
    },

    // Lutheran Templates
    {
      id: 'lutheran-baptism-reformation',
      name: 'Lutheran Reformation Baptism',
      denomination: ChurchDenomination.LUTHERAN,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Lutheran baptism certificate with Reformation heritage and Luther Rose',
      previewUrl: '/templates/previews/lutheran-baptism-reformation.png',
      templateUrl: '/templates/lutheran-baptism-reformation.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'SCRIPTURE',
          content:
            'For by grace you have been saved through faith, and this is not your own doing; it is the gift of God. - Ephesians 2:8',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'BLESSING',
          content: 'May the grace of our Lord Jesus Christ be with you always',
          position: 'FOOTER',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'sponsors',
          label: 'Sponsors',
          type: 'TEXT',
          required: false,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 14,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#8B4513',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Georgia',
        headerFont: 'Optima',
        bodyFont: 'Georgia',
        borderStyle: 'CLASSIC',
        backgroundPattern: 'luther-rose',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },

    // Methodist Templates
    {
      id: 'methodist-baptism-wesleyan',
      name: 'Methodist Wesleyan Baptism',
      denomination: ChurchDenomination.METHODIST,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Methodist baptism certificate with Wesleyan tradition and flame motif',
      previewUrl: '/templates/previews/methodist-baptism-wesleyan.png',
      templateUrl: '/templates/methodist-baptism-wesleyan.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'PRAYER',
          content:
            'The Holy Spirit work within you, that being born through water and the Spirit, you may be a faithful disciple of Jesus Christ.',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'SCRIPTURE',
          content:
            'Jesus answered, "Very truly, I tell you, no one can enter the kingdom of God without being born of water and Spirit." - John 3:5',
          position: 'BODY',
          optional: false,
        },
      ],
      customFields: [],
      styling: {
        primaryColor: '#DC143C',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Georgia',
        headerFont: 'Optima',
        bodyFont: 'Georgia',
        borderStyle: 'MODERN',
        backgroundPattern: 'flame-pattern',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },

    // Anglican/Episcopal Templates
    {
      id: 'anglican-baptism-traditional',
      name: 'Anglican Traditional Baptism',
      denomination: ChurchDenomination.ANGLICAN,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Anglican baptism certificate with Book of Common Prayer liturgy',
      previewUrl: '/templates/previews/anglican-baptism-traditional.png',
      templateUrl: '/templates/anglican-baptism-traditional.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'PRAYER',
          content:
            "We receive this child into the congregation of Christ's flock, and do sign him with the sign of the Cross.",
          position: 'BODY',
          optional: false,
        },
        {
          type: 'SCRIPTURE',
          content:
            'Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God. - Mark 10:14',
          position: 'BODY',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'godparents',
          label: 'Godparents',
          type: 'TEXT',
          required: true,
          position: { x: 100, y: 250 },
          styling: {
            fontSize: 14,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#800080',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Times New Roman',
        headerFont: 'Trajan Pro',
        bodyFont: 'Times New Roman',
        borderStyle: 'CLASSIC',
        backgroundPattern: 'anglican-cross',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },

    // Presbyterian Templates
    {
      id: 'presbyterian-baptism-reformed',
      name: 'Presbyterian Reformed Baptism',
      denomination: ChurchDenomination.PRESBYTERIAN,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Presbyterian baptism certificate with Reformed theology emphasis',
      previewUrl: '/templates/previews/presbyterian-baptism-reformed.png',
      templateUrl: '/templates/presbyterian-baptism-reformed.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'SCRIPTURE',
          content:
            'For you are all children of God through faith in Christ Jesus. For all of you who were baptized into Christ have clothed yourselves with Christ. - Galatians 3:26-27',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'PRAYER',
          content:
            'May the Lord bless you and keep you in His covenant of grace.',
          position: 'FOOTER',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'covenant-witnesses',
          label: 'Covenant Witnesses',
          type: 'TEXT',
          required: false,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 12,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#2F4F4F',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Georgia',
        headerFont: 'Optima',
        bodyFont: 'Georgia',
        borderStyle: 'SIMPLE',
        backgroundPattern: 'presbyterian-seal',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },

    // Pentecostal Templates
    {
      id: 'pentecostal-baptism-spirit',
      name: 'Pentecostal Spirit-Filled Baptism',
      denomination: ChurchDenomination.PENTECOSTAL,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Pentecostal baptism certificate emphasizing Holy Spirit baptism',
      previewUrl: '/templates/previews/pentecostal-baptism-spirit.png',
      templateUrl: '/templates/pentecostal-baptism-spirit.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'SCRIPTURE',
          content:
            'And when Jesus was baptized, immediately he went up from the water, and behold, the heavens were opened to him. - Matthew 3:16',
          position: 'BODY',
          optional: false,
        },
        {
          type: 'PRAYER',
          content:
            'May the Holy Spirit fill you with power from on high and lead you in all truth.',
          position: 'FOOTER',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'spirit-baptism-date',
          label: 'Spirit Baptism Date',
          type: 'DATE',
          required: false,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 12,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#FF4500',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Arial',
        headerFont: 'Impact',
        bodyFont: 'Arial',
        borderStyle: 'MODERN',
        backgroundPattern: 'flames-of-fire',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },

    // Orthodox Templates
    {
      id: 'orthodox-baptism-traditional',
      name: 'Orthodox Traditional Baptism',
      denomination: ChurchDenomination.ORTHODOX,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Eastern Orthodox baptism certificate with Byzantine tradition',
      previewUrl: '/templates/previews/orthodox-baptism-traditional.png',
      templateUrl: '/templates/orthodox-baptism-traditional.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: 'PRAYER',
          content:
            'Blessed is the Kingdom of the Father, and of the Son, and of the Holy Spirit, now and ever and unto ages of ages.',
          position: 'HEADER',
          optional: false,
        },
        {
          type: 'SCRIPTURE',
          content:
            'As many as have been baptized into Christ have put on Christ. Alleluia. - Galatians 3:27',
          position: 'BODY',
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'godparents',
          label: 'Godparents (Sponsors)',
          type: 'TEXT',
          required: true,
          position: { x: 100, y: 250 },
          styling: {
            fontSize: 14,
            fontWeight: 'NORMAL',
            color: '#000000',
            alignment: 'LEFT',
          },
        },
      ],
      styling: {
        primaryColor: '#8B0000',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Times New Roman',
        headerFont: 'Byzantine',
        bodyFont: 'Times New Roman',
        borderStyle: 'ORNATE',
        backgroundPattern: 'byzantine-cross',
        logoPosition: 'TOP_CENTER',
      },
      language: 'en',
      region: 'US',
    },
  ];

  for (const template of templates) {
    await prisma.certificateTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
  }

  console.log(`✅ Seeded ${templates.length} certificate templates`);
}

export async function main() {
  try {
    await seedCertificateTemplates();
  } catch (error) {
    console.error('❌ Error seeding certificate templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
