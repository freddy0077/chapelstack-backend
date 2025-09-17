import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import {
  AttendanceReportType,
  AttendanceReportFormat,
  AttendanceReportGroupBy,
} from '../dto/attendance-report.input';

@ObjectType()
export class AttendanceReportData {
  @Field(() => String)
  period: string;

  @Field(() => Int)
  totalAttendance: number;

  @Field(() => Int)
  uniqueMembers: number;

  @Field(() => Int)
  visitors: number;

  @Field(() => Int)
  firstTimeVisitors: number;

  @Field(() => Float)
  averageAttendance: number;

  @Field(() => Float, { nullable: true })
  growthRate?: number;

  @Field(() => Float, { nullable: true })
  retentionRate?: number;
}

// Supporting types for enhanced member data in attendance reports
@ObjectType()
export class AttendanceReportMemberBasicInfo {
  @Field(() => String)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;
}

@ObjectType()
export class AttendanceReportBranchInfo {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class AttendanceReportMember {
  // Basic Information (existing)
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  memberId?: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  email?: string;

  // Enhanced Personal Information
  @Field(() => String, { nullable: true })
  middleName?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true })
  maritalStatus?: string;

  @Field(() => String, { nullable: true })
  occupation?: string;

  @Field(() => String, { nullable: true })
  employerName?: string;

  // Address Information
  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  postalCode?: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  nationality?: string;

  @Field(() => String, { nullable: true })
  placeOfBirth?: string;

  @Field(() => String, { nullable: true })
  nlbNumber?: string;

  // Family Information
  @Field(() => String, { nullable: true })
  fatherName?: string;

  @Field(() => String, { nullable: true })
  motherName?: string;

  @Field(() => String, { nullable: true })
  fatherOccupation?: string;

  @Field(() => String, { nullable: true })
  motherOccupation?: string;

  // Emergency Contact
  @Field(() => String, { nullable: true })
  emergencyContactName?: string;

  @Field(() => String, { nullable: true })
  emergencyContactPhone?: string;

  // Church Information
  @Field(() => String, { nullable: true })
  membershipDate?: string;

  @Field(() => String, { nullable: true })
  baptismDate?: string;

  @Field(() => String, { nullable: true })
  confirmationDate?: string;

  @Field(() => String)
  status: string;

  // Branch Information
  @Field(() => AttendanceReportBranchInfo, { nullable: true })
  branch?: AttendanceReportBranchInfo;

  @Field(() => String, { nullable: true })
  branchId?: string;

  // Family Relations
  @Field(() => AttendanceReportMemberBasicInfo, { nullable: true })
  spouse?: AttendanceReportMemberBasicInfo;

  @Field(() => AttendanceReportMemberBasicInfo, { nullable: true })
  parent?: AttendanceReportMemberBasicInfo;

  @Field(() => [AttendanceReportMemberBasicInfo], { nullable: true })
  children?: AttendanceReportMemberBasicInfo[];

  // Attendance Data (existing)
  @Field(() => Int)
  attendanceCount: number;

  @Field(() => Float)
  attendanceRate: number;

  @Field(() => String, { nullable: true })
  lastAttendance?: string;

  @Field(() => [String])
  attendanceDates: string[];

  // Additional Information
  @Field(() => String, { nullable: true })
  profileImageUrl?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  rfidCardId?: string;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}

@ObjectType()
export class AttendanceReportSession {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  date: string;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => Int)
  totalAttendance: number;

  @Field(() => Int)
  memberAttendance: number;

  @Field(() => Int)
  visitorAttendance: number;

  @Field(() => Float)
  attendanceRate: number;
}

@ObjectType()
export class AttendanceReportEvent {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  startDate: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => Int)
  totalAttendance: number;

  @Field(() => Int)
  memberAttendance: number;

  @Field(() => Int)
  visitorAttendance: number;

  @Field(() => Float)
  attendanceRate: number;
}

@ObjectType()
export class AttendanceReportSummary {
  @Field(() => String)
  startDate: string;

  @Field(() => String)
  endDate: string;

  @Field(() => Int)
  totalSessions: number;

  @Field(() => Int)
  totalEvents: number;

  @Field(() => Int)
  totalAttendance: number;

  @Field(() => Int)
  uniqueMembers: number;

  @Field(() => Int)
  totalVisitors: number;

  @Field(() => Int)
  firstTimeVisitors: number;

  @Field(() => Float)
  averageSessionAttendance: number;

  @Field(() => Float)
  averageEventAttendance: number;

  @Field(() => Float)
  memberRetentionRate: number;

  @Field(() => Float)
  visitorConversionRate: number;

  @Field(() => Float)
  overallGrowthRate: number;
}

@ObjectType()
export class AttendanceReportChart {
  @Field(() => String)
  type: string;

  @Field(() => String)
  title: string;

  @Field(() => [String])
  labels: string[];

  @Field(() => [Float])
  data: number[];

  @Field(() => [String], { nullable: true })
  colors?: string[];
}

@ObjectType()
export class AttendanceReport {
  @Field(() => String)
  id: string;

  @Field(() => AttendanceReportType)
  reportType: AttendanceReportType;

  @Field(() => String)
  title: string;

  @Field(() => String)
  generatedAt: string;

  @Field(() => String)
  generatedBy: string;

  @Field(() => AttendanceReportFormat)
  format: AttendanceReportFormat;

  @Field(() => AttendanceReportSummary)
  summary: AttendanceReportSummary;

  @Field(() => [AttendanceReportData])
  data: AttendanceReportData[];

  @Field(() => [AttendanceReportMember], { nullable: true })
  members?: AttendanceReportMember[];

  @Field(() => [AttendanceReportSession], { nullable: true })
  sessions?: AttendanceReportSession[];

  @Field(() => [AttendanceReportEvent], { nullable: true })
  events?: AttendanceReportEvent[];

  @Field(() => [AttendanceReportChart], { nullable: true })
  charts?: AttendanceReportChart[];

  @Field(() => String, { nullable: true })
  downloadUrl?: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;
}
