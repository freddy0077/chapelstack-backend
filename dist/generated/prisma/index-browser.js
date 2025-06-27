"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Decimal, objectEnumValues, makeStrictEnum, Public, getRuntime, skip } = require('./runtime/index-browser.js');
const Prisma = {};
exports.Prisma = Prisma;
exports.$Enums = {};
Prisma.prismaVersion = {
    client: "6.8.2",
    engine: "2060c79ba17c6bb9f5823312b6f6b7f4a845738e"
};
Prisma.PrismaClientKnownRequestError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientUnknownRequestError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientRustPanicError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientInitializationError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientValidationError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.Decimal = Decimal;
Prisma.sql = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.empty = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.join = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.raw = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.validator = Public.validator;
Prisma.getExtensionContext = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.defineExtension = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;
Prisma.NullTypes = {
    DbNull: objectEnumValues.classes.DbNull,
    JsonNull: objectEnumValues.classes.JsonNull,
    AnyNull: objectEnumValues.classes.AnyNull
};
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.Prisma.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    firstName: 'firstName',
    lastName: 'lastName',
    phoneNumber: 'phoneNumber',
    isActive: 'isActive',
    isEmailVerified: 'isEmailVerified',
    lastLoginAt: 'lastLoginAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    organisationId: 'organisationId'
};
exports.Prisma.RoleScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.PermissionScalarFieldEnum = {
    id: 'id',
    action: 'action',
    subject: 'subject',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.BranchScalarFieldEnum = {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    address: 'address',
    city: 'city',
    country: 'country',
    email: 'email',
    establishedAt: 'establishedAt',
    isActive: 'isActive',
    phoneNumber: 'phoneNumber',
    postalCode: 'postalCode',
    state: 'state',
    website: 'website',
    organisationId: 'organisationId'
};
exports.Prisma.UserBranchScalarFieldEnum = {
    userId: 'userId',
    branchId: 'branchId',
    roleId: 'roleId',
    assignedAt: 'assignedAt',
    assignedBy: 'assignedBy'
};
exports.Prisma.RefreshTokenScalarFieldEnum = {
    id: 'id',
    hashedToken: 'hashedToken',
    userId: 'userId',
    expiresAt: 'expiresAt',
    isRevoked: 'isRevoked',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.EmailTemplateScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    subject: 'subject',
    bodyHtml: 'bodyHtml',
    bodyText: 'bodyText',
    isActive: 'isActive',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.EmailMessageScalarFieldEnum = {
    id: 'id',
    subject: 'subject',
    bodyHtml: 'bodyHtml',
    bodyText: 'bodyText',
    senderEmail: 'senderEmail',
    recipients: 'recipients',
    sentAt: 'sentAt',
    status: 'status',
    branchId: 'branchId',
    organisationId: 'organisationId',
    templateId: 'templateId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SmsMessageScalarFieldEnum = {
    id: 'id',
    body: 'body',
    senderNumber: 'senderNumber',
    recipients: 'recipients',
    sentAt: 'sentAt',
    status: 'status',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.NotificationScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    title: 'title',
    message: 'message',
    isRead: 'isRead',
    readAt: 'readAt',
    link: 'link',
    type: 'type',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    memberId: 'memberId'
};
exports.Prisma.BranchSettingScalarFieldEnum = {
    id: 'id',
    branchId: 'branchId',
    key: 'key',
    value: 'value',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SettingScalarFieldEnum = {
    id: 'id',
    key: 'key',
    value: 'value',
    branchId: 'branchId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.AuditLogScalarFieldEnum = {
    id: 'id',
    action: 'action',
    entityType: 'entityType',
    entityId: 'entityId',
    description: 'description',
    metadata: 'metadata',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    userId: 'userId',
    branchId: 'branchId',
    createdAt: 'createdAt'
};
exports.Prisma.DataOperationScalarFieldEnum = {
    id: 'id',
    type: 'type',
    status: 'status',
    entityType: 'entityType',
    description: 'description',
    metadata: 'metadata',
    filePath: 'filePath',
    fileSize: 'fileSize',
    recordCount: 'recordCount',
    errorCount: 'errorCount',
    errors: 'errors',
    userId: 'userId',
    createdAt: 'createdAt',
    completedAt: 'completedAt'
};
exports.Prisma.BackupScalarFieldEnum = {
    id: 'id',
    type: 'type',
    status: 'status',
    description: 'description',
    metadata: 'metadata',
    filePath: 'filePath',
    fileSize: 'fileSize',
    duration: 'duration',
    errorDetails: 'errorDetails',
    userId: 'userId',
    createdAt: 'createdAt',
    completedAt: 'completedAt'
};
exports.Prisma.MemberScalarFieldEnum = {
    id: 'id',
    firstName: 'firstName',
    middleName: 'middleName',
    lastName: 'lastName',
    gender: 'gender',
    dateOfBirth: 'dateOfBirth',
    email: 'email',
    phoneNumber: 'phoneNumber',
    address: 'address',
    city: 'city',
    state: 'state',
    postalCode: 'postalCode',
    country: 'country',
    maritalStatus: 'maritalStatus',
    occupation: 'occupation',
    employerName: 'employerName',
    membershipDate: 'membershipDate',
    membershipStatus: 'membershipStatus',
    status: 'status',
    statusChangeDate: 'statusChangeDate',
    statusChangeReason: 'statusChangeReason',
    baptismDate: 'baptismDate',
    baptismLocation: 'baptismLocation',
    confirmationDate: 'confirmationDate',
    profileImageUrl: 'profileImageUrl',
    notes: 'notes',
    customFields: 'customFields',
    privacySettings: 'privacySettings',
    rfidCardId: 'rfidCardId',
    isRegularAttendee: 'isRegularAttendee',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    branchId: 'branchId',
    parentId: 'parentId',
    spouseId: 'spouseId',
    userId: 'userId'
};
exports.Prisma.SpiritualMilestoneScalarFieldEnum = {
    id: 'id',
    type: 'type',
    date: 'date',
    location: 'location',
    performedBy: 'performedBy',
    description: 'description',
    additionalDetails: 'additionalDetails',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    memberId: 'memberId'
};
exports.Prisma.FamilyScalarFieldEnum = {
    id: 'id',
    name: 'name',
    address: 'address',
    city: 'city',
    state: 'state',
    postalCode: 'postalCode',
    country: 'country',
    phoneNumber: 'phoneNumber',
    customFields: 'customFields',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.FamilyRelationshipScalarFieldEnum = {
    id: 'id',
    relationshipType: 'relationshipType',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    memberId: 'memberId',
    relatedMemberId: 'relatedMemberId',
    familyId: 'familyId'
};
exports.Prisma.LicenseScalarFieldEnum = {
    id: 'id',
    key: 'key',
    type: 'type',
    status: 'status',
    startDate: 'startDate',
    expiryDate: 'expiryDate',
    organizationName: 'organizationName',
    contactEmail: 'contactEmail',
    contactPhone: 'contactPhone',
    features: 'features',
    maxUsers: 'maxUsers',
    maxBranches: 'maxBranches',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.MinistryScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    type: 'type',
    status: 'status',
    branchId: 'branchId',
    organisationId: 'organisationId',
    parentId: 'parentId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SmallGroupScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    type: 'type',
    meetingSchedule: 'meetingSchedule',
    location: 'location',
    maximumCapacity: 'maximumCapacity',
    status: 'status',
    branchId: 'branchId',
    ministryId: 'ministryId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.GroupMemberScalarFieldEnum = {
    id: 'id',
    role: 'role',
    joinDate: 'joinDate',
    status: 'status',
    memberId: 'memberId',
    ministryId: 'ministryId',
    smallGroupId: 'smallGroupId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.AttendanceSessionScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    date: 'date',
    startTime: 'startTime',
    endTime: 'endTime',
    type: 'type',
    status: 'status',
    location: 'location',
    latitude: 'latitude',
    longitude: 'longitude',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.AttendanceRecordScalarFieldEnum = {
    id: 'id',
    checkInTime: 'checkInTime',
    checkOutTime: 'checkOutTime',
    checkInMethod: 'checkInMethod',
    notes: 'notes',
    sessionId: 'sessionId',
    memberId: 'memberId',
    visitorName: 'visitorName',
    visitorEmail: 'visitorEmail',
    visitorPhone: 'visitorPhone',
    recordedById: 'recordedById',
    branchId: 'branchId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.QRCodeTokenScalarFieldEnum = {
    id: 'id',
    token: 'token',
    sessionId: 'sessionId',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.MemberNotificationScalarFieldEnum = {
    id: 'id',
    type: 'type',
    title: 'title',
    message: 'message',
    status: 'status',
    channel: 'channel',
    memberId: 'memberId',
    metadata: 'metadata',
    sentAt: 'sentAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SacramentalRecordScalarFieldEnum = {
    id: 'id',
    memberId: 'memberId',
    sacramentType: 'sacramentType',
    dateOfSacrament: 'dateOfSacrament',
    locationOfSacrament: 'locationOfSacrament',
    officiantName: 'officiantName',
    officiantId: 'officiantId',
    godparent1Name: 'godparent1Name',
    godparent2Name: 'godparent2Name',
    sponsorName: 'sponsorName',
    witness1Name: 'witness1Name',
    witness2Name: 'witness2Name',
    certificateNumber: 'certificateNumber',
    certificateUrl: 'certificateUrl',
    notes: 'notes',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.FundScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    isActive: 'isActive',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ContributionTypeScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    isActive: 'isActive',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.PaymentMethodScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    isActive: 'isActive',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ContributionScalarFieldEnum = {
    id: 'id',
    amount: 'amount',
    date: 'date',
    notes: 'notes',
    receiptNumber: 'receiptNumber',
    isAnonymous: 'isAnonymous',
    contributionTypeId: 'contributionTypeId',
    fundId: 'fundId',
    paymentMethodId: 'paymentMethodId',
    memberId: 'memberId',
    donorName: 'donorName',
    donorEmail: 'donorEmail',
    donorPhone: 'donorPhone',
    donorAddress: 'donorAddress',
    batchId: 'batchId',
    pledgeId: 'pledgeId',
    transactionId: 'transactionId',
    transactionStatus: 'transactionStatus',
    paymentGateway: 'paymentGateway',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdById: 'createdById',
    updatedById: 'updatedById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.BatchScalarFieldEnum = {
    id: 'id',
    name: 'name',
    date: 'date',
    notes: 'notes',
    status: 'status',
    totalAmount: 'totalAmount',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdById: 'createdById',
    updatedById: 'updatedById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.PledgeScalarFieldEnum = {
    id: 'id',
    amount: 'amount',
    startDate: 'startDate',
    endDate: 'endDate',
    frequency: 'frequency',
    status: 'status',
    notes: 'notes',
    memberId: 'memberId',
    fundId: 'fundId',
    organisationId: 'organisationId',
    branchId: 'branchId',
    amountFulfilled: 'amountFulfilled',
    createdById: 'createdById',
    updatedById: 'updatedById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ExpenseCategoryScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    isActive: 'isActive',
    branchId: 'branchId',
    organisationId: 'organisationId',
    parentId: 'parentId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ExpenseScalarFieldEnum = {
    id: 'id',
    amount: 'amount',
    date: 'date',
    description: 'description',
    receiptNumber: 'receiptNumber',
    invoiceNumber: 'invoiceNumber',
    expenseCategoryId: 'expenseCategoryId',
    fundId: 'fundId',
    paymentMethodId: 'paymentMethodId',
    vendorId: 'vendorId',
    vendorName: 'vendorName',
    vendorContact: 'vendorContact',
    branchId: 'branchId',
    organisationId: 'organisationId',
    budgetId: 'budgetId',
    createdById: 'createdById',
    updatedById: 'updatedById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.VendorScalarFieldEnum = {
    id: 'id',
    name: 'name',
    contactName: 'contactName',
    email: 'email',
    phone: 'phone',
    address: 'address',
    website: 'website',
    notes: 'notes',
    isActive: 'isActive',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.BudgetScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    fiscalYear: 'fiscalYear',
    startDate: 'startDate',
    endDate: 'endDate',
    totalAmount: 'totalAmount',
    totalSpent: 'totalSpent',
    status: 'status',
    notes: 'notes',
    fundId: 'fundId',
    ministryId: 'ministryId',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdById: 'createdById',
    updatedById: 'updatedById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.BudgetItemScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    amount: 'amount',
    budgetId: 'budgetId',
    expenseCategoryId: 'expenseCategoryId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SermonScalarFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    datePreached: 'datePreached',
    speakerId: 'speakerId',
    seriesId: 'seriesId',
    mainScripture: 'mainScripture',
    audioUrl: 'audioUrl',
    videoUrl: 'videoUrl',
    transcriptUrl: 'transcriptUrl',
    transcriptText: 'transcriptText',
    duration: 'duration',
    branchId: 'branchId',
    organisationId: 'organisationId',
    status: 'status',
    viewCount: 'viewCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SpeakerScalarFieldEnum = {
    id: 'id',
    name: 'name',
    bio: 'bio',
    memberId: 'memberId',
    branchId: 'branchId',
    organisationId: 'organisationId',
    imageUrl: 'imageUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SeriesScalarFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    startDate: 'startDate',
    endDate: 'endDate',
    artworkUrl: 'artworkUrl',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.MediaItemScalarFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    fileUrl: 'fileUrl',
    mimeType: 'mimeType',
    fileSize: 'fileSize',
    type: 'type',
    branchId: 'branchId',
    organisationId: 'organisationId',
    uploadedBy: 'uploadedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ChildScalarFieldEnum = {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    dateOfBirth: 'dateOfBirth',
    gender: 'gender',
    allergies: 'allergies',
    specialNeeds: 'specialNeeds',
    emergencyContactName: 'emergencyContactName',
    emergencyContactPhone: 'emergencyContactPhone',
    photoConsent: 'photoConsent',
    notes: 'notes',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.GuardianScalarFieldEnum = {
    id: 'id',
    memberId: 'memberId',
    firstName: 'firstName',
    lastName: 'lastName',
    relationship: 'relationship',
    isPrimaryGuardian: 'isPrimaryGuardian',
    canPickup: 'canPickup',
    phone: 'phone',
    email: 'email',
    address: 'address',
    notes: 'notes',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ChildGuardianRelationScalarFieldEnum = {
    id: 'id',
    childId: 'childId',
    guardianId: 'guardianId',
    relationship: 'relationship',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.CheckInRecordScalarFieldEnum = {
    id: 'id',
    childId: 'childId',
    eventId: 'eventId',
    checkedInById: 'checkedInById',
    checkedInAt: 'checkedInAt',
    checkedOutById: 'checkedOutById',
    checkedOutAt: 'checkedOutAt',
    guardianIdAtCheckIn: 'guardianIdAtCheckIn',
    guardianIdAtCheckOut: 'guardianIdAtCheckOut',
    notes: 'notes',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ChildrenMinistryVolunteerScalarFieldEnum = {
    id: 'id',
    memberId: 'memberId',
    role: 'role',
    backgroundCheckDate: 'backgroundCheckDate',
    backgroundCheckStatus: 'backgroundCheckStatus',
    trainingCompletionDate: 'trainingCompletionDate',
    isActive: 'isActive',
    notes: 'notes',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ChildrenEventScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    startDateTime: 'startDateTime',
    endDateTime: 'endDateTime',
    location: 'location',
    ageRange: 'ageRange',
    capacity: 'capacity',
    volunteersNeeded: 'volunteersNeeded',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.VolunteerEventAssignmentScalarFieldEnum = {
    id: 'id',
    volunteerId: 'volunteerId',
    eventId: 'eventId',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.FormScalarFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    status: 'status',
    isPublic: 'isPublic',
    slug: 'slug',
    successMessage: 'successMessage',
    redirectUrl: 'redirectUrl',
    enableCaptcha: 'enableCaptcha',
    notifyEmails: 'notifyEmails',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    expiresAt: 'expiresAt',
    submissionCount: 'submissionCount'
};
exports.Prisma.FormFieldScalarFieldEnum = {
    id: 'id',
    formId: 'formId',
    type: 'type',
    label: 'label',
    placeholder: 'placeholder',
    helpText: 'helpText',
    defaultValue: 'defaultValue',
    options: 'options',
    isRequired: 'isRequired',
    isUnique: 'isUnique',
    validations: 'validations',
    order: 'order',
    width: 'width',
    conditionalLogic: 'conditionalLogic',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.FormSubmissionScalarFieldEnum = {
    id: 'id',
    formId: 'formId',
    submittedAt: 'submittedAt',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    status: 'status',
    branchId: 'branchId',
    organisationId: 'organisationId',
    submittedById: 'submittedById'
};
exports.Prisma.FormFieldValueScalarFieldEnum = {
    id: 'id',
    submissionId: 'submissionId',
    fieldId: 'fieldId',
    value: 'value',
    fileUrl: 'fileUrl',
    createdAt: 'createdAt'
};
exports.Prisma.ScheduledReportScalarFieldEnum = {
    id: 'id',
    name: 'name',
    reportType: 'reportType',
    frequency: 'frequency',
    lastRunAt: 'lastRunAt',
    nextRunAt: 'nextRunAt',
    recipientEmails: 'recipientEmails',
    outputFormat: 'outputFormat',
    branchId: 'branchId',
    organisationId: 'organisationId',
    filterJson: 'filterJson',
    isActive: 'isActive',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.UserDashboardPreferenceScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    branchId: 'branchId',
    organisationId: 'organisationId',
    dashboardType: 'dashboardType',
    layoutConfig: 'layoutConfig',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.OnboardingProgressScalarFieldEnum = {
    id: 'id',
    branchId: 'branchId',
    organisationId: 'organisationId',
    completedSteps: 'completedSteps',
    currentStep: 'currentStep',
    isCompleted: 'isCompleted',
    importedMembers: 'importedMembers',
    importedFinances: 'importedFinances',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    lastUpdatedAt: 'lastUpdatedAt',
    selectedModules: 'selectedModules'
};
exports.Prisma.OrganisationScalarFieldEnum = {
    id: 'id',
    name: 'name',
    email: 'email',
    phoneNumber: 'phoneNumber',
    website: 'website',
    address: 'address',
    city: 'city',
    state: 'state',
    country: 'country',
    zipCode: 'zipCode',
    denomination: 'denomination',
    foundingYear: 'foundingYear',
    size: 'size',
    vision: 'vision',
    missionStatement: 'missionStatement',
    description: 'description',
    timezone: 'timezone',
    currency: 'currency',
    primaryColor: 'primaryColor',
    secondaryColor: 'secondaryColor',
    accentColor: 'accentColor',
    logoUrl: 'logoUrl',
    faviconUrl: 'faviconUrl',
    slogan: 'slogan',
    brandFont: 'brandFont',
    socialHandle: 'socialHandle',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.EventScalarFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    startDate: 'startDate',
    endDate: 'endDate',
    location: 'location',
    category: 'category',
    branchId: 'branchId',
    organisationId: 'organisationId',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.PrayerRequestScalarFieldEnum = {
    id: 'id',
    memberId: 'memberId',
    branchId: 'branchId',
    organisationId: 'organisationId',
    requestText: 'requestText',
    status: 'status',
    assignedPastorId: 'assignedPastorId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.VolunteerRoleScalarFieldEnum = {
    id: 'id'
};
exports.Prisma.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.Prisma.NullableJsonNullValueInput = {
    DbNull: Prisma.DbNull,
    JsonNull: Prisma.JsonNull
};
exports.Prisma.JsonNullValueInput = {
    JsonNull: Prisma.JsonNull
};
exports.Prisma.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.Prisma.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.Prisma.JsonNullValueFilter = {
    DbNull: Prisma.DbNull,
    JsonNull: Prisma.JsonNull,
    AnyNull: Prisma.AnyNull
};
exports.MessageStatus = exports.$Enums.MessageStatus = {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    SCHEDULED: 'SCHEDULED',
    SENDING: 'SENDING',
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
};
exports.NotificationType = exports.$Enums.NotificationType = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    EVENT_REMINDER: 'EVENT_REMINDER'
};
exports.SacramentType = exports.$Enums.SacramentType = {
    BAPTISM: 'BAPTISM',
    EUCHARIST_FIRST_COMMUNION: 'EUCHARIST_FIRST_COMMUNION',
    CONFIRMATION: 'CONFIRMATION',
    RECONCILIATION_FIRST: 'RECONCILIATION_FIRST',
    ANOINTING_OF_THE_SICK: 'ANOINTING_OF_THE_SICK',
    HOLY_ORDERS_DIACONATE: 'HOLY_ORDERS_DIACONATE',
    HOLY_ORDERS_PRIESTHOOD: 'HOLY_ORDERS_PRIESTHOOD',
    MATRIMONY: 'MATRIMONY',
    RCIA_INITIATION: 'RCIA_INITIATION',
    OTHER: 'OTHER'
};
exports.ContentStatus = exports.$Enums.ContentStatus = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
    PENDING_REVIEW: 'PENDING_REVIEW'
};
exports.MediaType = exports.$Enums.MediaType = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    AUDIO_FILE: 'AUDIO_FILE',
    DOCUMENT_PDF: 'DOCUMENT_PDF',
    DOCUMENT_WORD: 'DOCUMENT_WORD',
    SLIDESHOW: 'SLIDESHOW',
    OTHER: 'OTHER'
};
exports.FormStatus = exports.$Enums.FormStatus = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED'
};
exports.FormFieldType = exports.$Enums.FormFieldType = {
    TEXT: 'TEXT',
    TEXTAREA: 'TEXTAREA',
    EMAIL: 'EMAIL',
    NUMBER: 'NUMBER',
    PHONE: 'PHONE',
    DATE: 'DATE',
    TIME: 'TIME',
    DATETIME: 'DATETIME',
    SELECT: 'SELECT',
    MULTISELECT: 'MULTISELECT',
    CHECKBOX: 'CHECKBOX',
    RADIO: 'RADIO',
    FILE: 'FILE',
    HEADING: 'HEADING',
    PARAGRAPH: 'PARAGRAPH',
    DIVIDER: 'DIVIDER'
};
exports.ReportFrequencyEnum = exports.$Enums.ReportFrequencyEnum = {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY'
};
exports.OnboardingStep = exports.$Enums.OnboardingStep = {
    WELCOME: 'WELCOME',
    ADMIN_SETUP: 'ADMIN_SETUP',
    ORGANIZATION_DETAILS: 'ORGANIZATION_DETAILS',
    BRANCH_SETUP: 'BRANCH_SETUP',
    BRANDING: 'BRANDING',
    USER_INVITATIONS: 'USER_INVITATIONS',
    ROLE_CONFIGURATION: 'ROLE_CONFIGURATION',
    MEMBER_IMPORT: 'MEMBER_IMPORT',
    FINANCIAL_SETUP: 'FINANCIAL_SETUP',
    MODULE_QUICK_START: 'MODULE_QUICK_START',
    COMPLETION: 'COMPLETION'
};
exports.PrayerRequestStatus = exports.$Enums.PrayerRequestStatus = {
    NEW: 'NEW',
    IN_PROGRESS: 'IN_PROGRESS',
    ANSWERED: 'ANSWERED'
};
exports.Prisma.ModelName = {
    User: 'User',
    Role: 'Role',
    Permission: 'Permission',
    Branch: 'Branch',
    UserBranch: 'UserBranch',
    RefreshToken: 'RefreshToken',
    EmailTemplate: 'EmailTemplate',
    EmailMessage: 'EmailMessage',
    SmsMessage: 'SmsMessage',
    Notification: 'Notification',
    BranchSetting: 'BranchSetting',
    Setting: 'Setting',
    AuditLog: 'AuditLog',
    DataOperation: 'DataOperation',
    Backup: 'Backup',
    Member: 'Member',
    SpiritualMilestone: 'SpiritualMilestone',
    Family: 'Family',
    FamilyRelationship: 'FamilyRelationship',
    License: 'License',
    Ministry: 'Ministry',
    SmallGroup: 'SmallGroup',
    GroupMember: 'GroupMember',
    AttendanceSession: 'AttendanceSession',
    AttendanceRecord: 'AttendanceRecord',
    QRCodeToken: 'QRCodeToken',
    MemberNotification: 'MemberNotification',
    SacramentalRecord: 'SacramentalRecord',
    Fund: 'Fund',
    ContributionType: 'ContributionType',
    PaymentMethod: 'PaymentMethod',
    Contribution: 'Contribution',
    Batch: 'Batch',
    Pledge: 'Pledge',
    ExpenseCategory: 'ExpenseCategory',
    Expense: 'Expense',
    Vendor: 'Vendor',
    Budget: 'Budget',
    BudgetItem: 'BudgetItem',
    Sermon: 'Sermon',
    Speaker: 'Speaker',
    Series: 'Series',
    MediaItem: 'MediaItem',
    Child: 'Child',
    Guardian: 'Guardian',
    ChildGuardianRelation: 'ChildGuardianRelation',
    CheckInRecord: 'CheckInRecord',
    ChildrenMinistryVolunteer: 'ChildrenMinistryVolunteer',
    ChildrenEvent: 'ChildrenEvent',
    VolunteerEventAssignment: 'VolunteerEventAssignment',
    Form: 'Form',
    FormField: 'FormField',
    FormSubmission: 'FormSubmission',
    FormFieldValue: 'FormFieldValue',
    ScheduledReport: 'ScheduledReport',
    UserDashboardPreference: 'UserDashboardPreference',
    OnboardingProgress: 'OnboardingProgress',
    Organisation: 'Organisation',
    Event: 'Event',
    PrayerRequest: 'PrayerRequest',
    VolunteerRole: 'VolunteerRole'
};
class PrismaClient {
    constructor() {
        return new Proxy(this, {
            get(target, prop) {
                let message;
                const runtime = getRuntime();
                if (runtime.isEdge) {
                    message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
                }
                else {
                    message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).';
                }
                message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`;
                throw new Error(message);
            }
        });
    }
}
exports.PrismaClient = PrismaClient;
Object.assign(exports, Prisma);
//# sourceMappingURL=index-browser.js.map