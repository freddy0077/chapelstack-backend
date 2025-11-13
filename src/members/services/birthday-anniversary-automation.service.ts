import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsFacade } from '../../engagement/notifications/notifications.facade';

@Injectable()
export class BirthdayAnniversaryAutomationService {
  private readonly logger = new Logger(
    BirthdayAnniversaryAutomationService.name,
  );

  constructor(
    private prisma: PrismaService,
    private notificationsFacade: NotificationsFacade,
  ) {}

  /**
   * Send birthday messages every day at 8:00 AM
   */
  @Cron('0 8 * * *', {
    name: 'send-birthday-messages',
    timeZone: 'Africa/Accra', // Adjust to your timezone
  })
  async sendDailyBirthdayMessages(): Promise<void> {
    this.logger.log('Starting daily birthday message automation...');

    try {
      const todayMembers = await this.getTodayBirthdayMembers();

      if (todayMembers.length === 0) {
        this.logger.log('No birthdays today');
        return;
      }

      this.logger.log(`Found ${todayMembers.length} birthdays today`);

      // Send birthday messages
      await this.sendBirthdayMessages(todayMembers);

      this.logger.log('Birthday messages sent successfully');
    } catch (error) {
      this.logger.error(
        `Failed to send birthday messages: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send wedding anniversary messages every day at 8:00 AM
   */
  @Cron('0 8 * * *', {
    name: 'send-anniversary-messages',
    timeZone: 'Africa/Accra',
  })
  async sendDailyAnniversaryMessages(): Promise<void> {
    this.logger.log('Starting daily anniversary message automation...');

    try {
      const todayAnniversaries = await this.getTodayAnniversaries();

      if (todayAnniversaries.length === 0) {
        this.logger.log('No anniversaries today');
        return;
      }

      this.logger.log(`Found ${todayAnniversaries.length} anniversaries today`);

      // Send anniversary messages
      await this.sendAnniversaryMessages(todayAnniversaries);

      this.logger.log('Anniversary messages sent successfully');
    } catch (error) {
      this.logger.error(
        `Failed to send anniversary messages: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send sacramental anniversary messages (Baptism, First Communion, etc.)
   * Runs every day at 8:00 AM
   */
  @Cron('0 8 * * *', {
    name: 'send-sacramental-anniversary-messages',
    timeZone: 'Africa/Accra',
  })
  async sendDailySacramentalAnniversaryMessages(): Promise<void> {
    this.logger.log(
      'Starting daily sacramental anniversary message automation...',
    );

    try {
      const todaySacramentalAnniversaries =
        await this.getTodaySacramentalAnniversaries();

      if (todaySacramentalAnniversaries.length === 0) {
        this.logger.log('No sacramental anniversaries today');
        return;
      }

      this.logger.log(
        `Found ${todaySacramentalAnniversaries.length} sacramental anniversaries today`,
      );

      // Send sacramental anniversary messages
      await this.sendSacramentalAnniversaryMessages(
        todaySacramentalAnniversaries,
      );

      this.logger.log('Sacramental anniversary messages sent successfully');
    } catch (error) {
      this.logger.error(
        `Failed to send sacramental anniversary messages: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send weekly birthday reminder to admins (every Monday at 9:00 AM)
   */
  @Cron('0 9 * * 1', {
    name: 'send-weekly-birthday-reminder',
    timeZone: 'Africa/Accra',
  })
  async sendWeeklyBirthdayReminder(): Promise<void> {
    this.logger.log('Starting weekly birthday reminder...');

    try {
      const thisWeekMembers = await this.getThisWeekBirthdayMembers();

      if (thisWeekMembers.length === 0) {
        this.logger.log('No birthdays this week');
        return;
      }

      this.logger.log(`Found ${thisWeekMembers.length} birthdays this week`);

      // Send reminder to admins
      // Extract branchId and organisationId from first member if available
      const branchId = thisWeekMembers[0]?.branch?.id;
      const organisationId = undefined; // Not available in the query result
      await this.sendBirthdayReminderToAdmins(thisWeekMembers, branchId, organisationId);

      this.logger.log('Weekly birthday reminder sent successfully');
    } catch (error) {
      this.logger.error(
        `Failed to send weekly birthday reminder: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Get members with birthdays today
   */
  private async getTodayBirthdayMembers() {
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const day = today.getDate();

    return this.prisma.member
      .findMany({
        where: {
          isDeactivated: false,
          dateOfBirth: {
            not: null,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          dateOfBirth: true,
          branch: {
            select: {
              id: true,
              name: true,
              organisationId: true,
              emailDisplayName: true,
              emailSignature: true,
              smsDisplayName: true,
            },
          },
        },
      })
      .then((members) =>
        members.filter((member) => {
          if (!member.dateOfBirth) return false;
          const birthDate = new Date(member.dateOfBirth);
          return (
            birthDate.getMonth() + 1 === month && birthDate.getDate() === day
          );
        }),
      );
  }

  /**
   * Get members with birthdays this week
   */
  private async getThisWeekBirthdayMembers() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const members = await this.prisma.member.findMany({
      where: {
        isDeactivated: false,
        dateOfBirth: {
          not: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        dateOfBirth: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return members.filter((member) => {
      if (!member.dateOfBirth) return false;
      const birthDate = new Date(member.dateOfBirth);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate(),
      );
      return thisYearBirthday >= startOfWeek && thisYearBirthday <= endOfWeek;
    });
  }

  /**
   * Get members with wedding anniversaries today
   */
  private async getTodayAnniversaries() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Get marriage sacramental records for today's anniversary
    const marriages = await this.prisma.sacramentalRecord.findMany({
      where: {
        sacramentType: 'MATRIMONY',
        member: {
          isDeactivated: false,
        },
      },
      select: {
        id: true,
        dateOfSacrament: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            spouse: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                organisationId: true,
                emailDisplayName: true,
                emailSignature: true,
                smsDisplayName: true,
              },
            },
          },
        },
      },
    });

    return marriages
      .filter((record) => {
        const marriageDate = new Date(record.dateOfSacrament);
        return (
          marriageDate.getMonth() + 1 === month &&
          marriageDate.getDate() === day
        );
      })
      .map((record: any) => ({
        ...record.member,
        marriageDate: record.dateOfSacrament,
        spouseName: record.member.spouse
          ? `${record.member.spouse.firstName} ${record.member.spouse.lastName}`
          : 'your spouse',
      }));
  }

  /**
   * Get members with sacramental anniversaries today
   */
  private async getTodaySacramentalAnniversaries() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const records = await this.prisma.sacramentalRecord.findMany({
      where: {
        sacramentType: {
          not: 'MATRIMONY', // Exclude marriage as it's handled separately
        },
        member: {
          isDeactivated: false,
        },
      },
      select: {
        id: true,
        sacramentType: true,
        dateOfSacrament: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            branch: {
              select: {
                id: true,
                name: true,
                organisationId: true,
                emailDisplayName: true,
                emailSignature: true,
                smsDisplayName: true,
              },
            },
          },
        },
      },
    });

    return records.filter((record) => {
      const sacramentDate = new Date(record.dateOfSacrament);
      const yearsSince = today.getFullYear() - sacramentDate.getFullYear();

      // Only celebrate milestone anniversaries (5, 10, 15, 20, 25, etc.)
      const isMilestone = yearsSince > 0 && yearsSince % 5 === 0;

      return (
        isMilestone &&
        sacramentDate.getMonth() + 1 === month &&
        sacramentDate.getDate() === day
      );
    });
  }

  /**
   * Send birthday messages via email and SMS
   */
  private async sendBirthdayMessages(members: any[]) {
    for (const member of members) {
      try {
        const age = this.calculateAge(member.dateOfBirth);
        const branchName =
          member.branch?.emailDisplayName ||
          member.branch?.name ||
          'Your Church Family';
        const emailSignature =
          member.branch?.emailSignature ||
          `With love and prayers,\n${branchName}`;
        const smsSignature =
          member.branch?.smsDisplayName || member.branch?.name || 'Your Church';
        const message = this.getBirthdayMessage(
          member.firstName,
          age,
          smsSignature,
        );

        // Send email if available
        if (member.email) {
          await this.notificationsFacade.send({
            channel: 'EMAIL',
            recipients: [{ email: member.email }],
            variables: {
              subject: `Happy Birthday ${member.firstName}! 🎉`,
              html: this.getBirthdayEmailTemplate(
                member.firstName,
                member.lastName,
                age,
                branchName,
                emailSignature,
              ),
              text: message,
            },
            branchId: member.branch?.id,
            organisationId: member.branch?.organisationId,
          });
        }

        // Send SMS if available
        if (member.phoneNumber) {
          await this.notificationsFacade.send({
            channel: 'SMS',
            recipients: [{ phone: member.phoneNumber }],
            variables: {
              message: message,
            },
            branchId: member.branch?.id,
            organisationId: member.branch?.organisationId,
          });
        }

        this.logger.log(
          `Birthday message sent to ${member.firstName} ${member.lastName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send birthday message to ${member.firstName} ${member.lastName}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Send anniversary messages via email and SMS
   */
  private async sendAnniversaryMessages(members: any[]) {
    for (const member of members) {
      try {
        const years = this.calculateYearsSince(member.marriageDate);
        const message = this.getAnniversaryMessage(
          member.firstName,
          member.spouseName,
          years,
        );

        // Send email if available
        if (member.email) {
          await this.notificationsFacade.send({
            channel: 'EMAIL',
            recipients: [{ email: member.email }],
            variables: {
              subject: `Happy ${years}${this.getOrdinalSuffix(years)} Anniversary! 💍`,
              html: this.getAnniversaryEmailTemplate(
                member.firstName,
                member.lastName,
                member.spouseName,
                years,
              ),
              text: message,
            },
            branchId: member.branch?.id,
            organisationId: member.branch?.organisationId,
          });
        }

        // Send SMS if available
        if (member.phoneNumber) {
          await this.notificationsFacade.send({
            channel: 'SMS',
            recipients: [{ phone: member.phoneNumber }],
            variables: {
              message: message,
            },
            branchId: member.branch?.id,
            organisationId: member.branch?.organisationId,
          });
        }

        this.logger.log(
          `Anniversary message sent to ${member.firstName} ${member.lastName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send anniversary message to ${member.firstName} ${member.lastName}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Send sacramental anniversary messages
   */
  private async sendSacramentalAnniversaryMessages(records: any[]) {
    for (const record of records) {
      try {
        const member = record.member;
        const years = this.calculateYearsSince(record.dateReceived);
        const sacramentName = this.getSacramentName(record.sacramentType);
        const message = this.getSacramentalAnniversaryMessage(
          member.firstName,
          sacramentName,
          years,
        );

        // Send email if available
        if (member.email) {
          await this.notificationsFacade.send({
            channel: 'EMAIL',
            recipients: [{ email: member.email }],
            variables: {
              subject: `${years}${this.getOrdinalSuffix(years)} ${sacramentName} Anniversary! ✝️`,
              html: this.getSacramentalAnniversaryEmailTemplate(
                member.firstName,
                member.lastName,
                sacramentName,
                years,
              ),
              text: message,
            },
            branchId: member.branch?.id,
            organisationId: member.branch?.organisationId,
          });
        }

        // Send SMS if available
        if (member.phoneNumber) {
          await this.notificationsFacade.send({
            channel: 'SMS',
            recipients: [{ phone: member.phoneNumber }],
            variables: {
              message: message,
            },
            branchId: member.branch?.id,
            organisationId: member.branch?.organisationId,
          });
        }

        this.logger.log(
          `Sacramental anniversary message sent to ${member.firstName} ${member.lastName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send sacramental anniversary message: ${error.message}`,
        );
      }
    }
  }

  /**
   * Send weekly birthday reminder to admins
   */
  private async sendBirthdayReminderToAdmins(members: any[], branchId?: string, organisationId?: string) {
    // Get all admin users
    const admins = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            name: {
              in: ['ADMIN', 'ADMIN'],
            },
          },
        },
      },
      select: {
        email: true,
        firstName: true,
      },
    });

    if (admins.length === 0) {
      this.logger.log('No admins found to send reminder');
      return;
    }

    const birthdayList = members
      .map(
        (m) =>
          `${m.firstName} ${m.lastName} - ${new Date(m.dateOfBirth).toLocaleDateString()} (${m.branch?.name || 'N/A'})`,
      )
      .join('\n');

    const subject = `Upcoming Birthdays This Week (${members.length})`;
    const message = `Hello,\n\nHere are the upcoming birthdays this week:\n\n${birthdayList}\n\nBest regards,\nChurch Management System`;

    for (const admin of admins) {
      try {
        await this.notificationsFacade.send({
          channel: 'EMAIL',
          recipients: [{ email: admin.email }],
          variables: {
            subject: subject,
            text: message,
            html: this.getBirthdayReminderEmailTemplate(
              admin.firstName || 'Admin',
              members,
            ),
          },
          branchId: branchId,
          organisationId: organisationId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send reminder to admin ${admin.email}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Helper: Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  /**
   * Helper: Calculate years since a date
   */
  private calculateYearsSince(date: Date): number {
    const today = new Date();
    const pastDate = new Date(date);
    return today.getFullYear() - pastDate.getFullYear();
  }

  /**
   * Helper: Get ordinal suffix (1st, 2nd, 3rd, etc.)
   */
  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  /**
   * Helper: Get sacrament name
   */
  private getSacramentName(type: string): string {
    const names = {
      BAPTISM: 'Baptism',
      CONFIRMATION: 'Confirmation',
      FIRST_COMMUNION: 'First Communion',
      MARRIAGE: 'Marriage',
      HOLY_ORDERS: 'Holy Orders',
    };
    return names[type] || type;
  }

  /**
   * Get birthday message
   */
  private getBirthdayMessage(
    firstName: string,
    age: number,
    churchName: string = 'Your Church Family',
  ): string {
    return `Happy Birthday ${firstName}! 🎉\n\nWishing you a blessed ${age}${this.getOrdinalSuffix(age)} birthday filled with joy, love, and God's abundant blessings.\n\nMay this new year of your life bring you closer to your dreams and to God.\n\nGod bless you!\n\n- ${churchName}`;
  }

  /**
   * Get anniversary message
   */
  private getAnniversaryMessage(
    firstName: string,
    spouseName: string,
    years: number,
  ): string {
    return `Happy ${years}${this.getOrdinalSuffix(years)} Anniversary ${firstName}! 💍\n\nCongratulations on ${years} beautiful years of marriage with ${spouseName}!\n\nMay God continue to bless your union with love, joy, and many more years together.\n\nGod bless you both!\n\n- Your Church Family`;
  }

  /**
   * Get sacramental anniversary message
   */
  private getSacramentalAnniversaryMessage(
    firstName: string,
    sacramentName: string,
    years: number,
  ): string {
    return `Happy ${years}${this.getOrdinalSuffix(years)} ${sacramentName} Anniversary ${firstName}! ✝️\n\nCongratulations on ${years} years since your ${sacramentName}!\n\nMay God continue to strengthen your faith and guide you on your spiritual journey.\n\nGod bless you!\n\n- Your Church Family`;
  }

  /**
   * Get birthday email HTML template
   */
  private getBirthdayEmailTemplate(
    firstName: string,
    lastName: string,
    age: number,
    churchName: string = 'Your Church Family',
    emailSignature: string = 'With love and prayers,\nYour Church Family',
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .emoji { font-size: 48px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .signature { white-space: pre-line; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎉🎂🎈</div>
            <h1>Happy Birthday ${firstName}!</h1>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>On this special day, we celebrate you and the wonderful person you are!</p>
            <p>Wishing you a blessed <strong>${age}${this.getOrdinalSuffix(age)} birthday</strong> filled with:</p>
            <ul>
              <li>🙏 God's abundant blessings</li>
              <li>❤️ Love from family and friends</li>
              <li>😊 Joy and happiness</li>
              <li>✨ Dreams coming true</li>
            </ul>
            <p>May this new year of your life bring you closer to your dreams and to God.</p>
            <p><strong>God bless you abundantly!</strong></p>
            <div class="signature">${emailSignature}</div>
          </div>
          <div class="footer">
            <p>This is an automated message from ${churchName}.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get anniversary email HTML template
   */
  private getAnniversaryEmailTemplate(
    firstName: string,
    lastName: string,
    spouseName: string,
    years: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .emoji { font-size: 48px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">💍💕🎊</div>
            <h1>Happy ${years}${this.getOrdinalSuffix(years)} Anniversary!</h1>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>Congratulations on <strong>${years} beautiful years</strong> of marriage with ${spouseName}!</p>
            <p>Your love story is an inspiration to us all. May God continue to bless your union with:</p>
            <ul>
              <li>💑 Enduring love and companionship</li>
              <li>🙏 God's grace and guidance</li>
              <li>😊 Joy and laughter</li>
              <li>💪 Strength through challenges</li>
              <li>✨ Many more blessed years together</li>
            </ul>
            <p><strong>May your love continue to grow stronger with each passing year!</strong></p>
            <p>With love and prayers,<br>Your Church Family</p>
          </div>
          <div class="footer">
            <p>This is an automated message from your church management system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get sacramental anniversary email HTML template
   */
  private getSacramentalAnniversaryEmailTemplate(
    firstName: string,
    lastName: string,
    sacramentName: string,
    years: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .emoji { font-size: 48px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">✝️🕊️🙏</div>
            <h1>${years}${this.getOrdinalSuffix(years)} ${sacramentName} Anniversary</h1>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>Congratulations on <strong>${years} blessed years</strong> since your ${sacramentName}!</p>
            <p>This milestone is a beautiful reminder of your faith journey and God's grace in your life.</p>
            <p>May God continue to:</p>
            <ul>
              <li>🙏 Strengthen your faith</li>
              <li>✨ Guide your spiritual journey</li>
              <li>💪 Give you courage and wisdom</li>
              <li>❤️ Fill your heart with His love</li>
              <li>🕊️ Grant you peace and joy</li>
            </ul>
            <p><strong>May you continue to grow in faith and grace!</strong></p>
            <p>With prayers and blessings,<br>Your Church Family</p>
          </div>
          <div class="footer">
            <p>This is an automated message from your church management system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get birthday reminder email template for admins
   */
  private getBirthdayReminderEmailTemplate(
    adminName: string,
    members: any[],
  ): string {
    const memberRows = members
      .map(
        (m) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${m.firstName} ${m.lastName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(m.dateOfBirth).toLocaleDateString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${m.branch?.name || 'N/A'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${m.email || 'N/A'}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: #4a5568; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
          th { background: #4a5568; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📅 Upcoming Birthdays This Week</h2>
          </div>
          <div class="content">
            <p>Hello ${adminName},</p>
            <p>Here are the <strong>${members.length} upcoming birthdays</strong> this week:</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Birthday</th>
                  <th>Branch</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                ${memberRows}
              </tbody>
            </table>
            <p>Consider reaching out to these members to make their day special!</p>
            <p>Best regards,<br>Church Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
