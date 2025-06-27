// Mock the SacramentType enum since we can't import it directly in tests
export enum SacramentType {
  BAPTISM = 'BAPTISM',
  EUCHARIST_FIRST_COMMUNION = 'EUCHARIST_FIRST_COMMUNION',
  CONFIRMATION = 'CONFIRMATION',
  RECONCILIATION_FIRST = 'RECONCILIATION_FIRST',
  ANOINTING_OF_THE_SICK = 'ANOINTING_OF_THE_SICK',
  HOLY_ORDERS_DIACONATE = 'HOLY_ORDERS_DIACONATE',
  HOLY_ORDERS_PRIESTHOOD = 'HOLY_ORDERS_PRIESTHOOD',
  MATRIMONY = 'MATRIMONY',
  RCIA_INITIATION = 'RCIA_INITIATION',
  OTHER = 'OTHER',
}

// Mock SacramentalRecordFilterInput
export class SacramentalRecordFilterInput {
  sacramentType?: SacramentType;
  dateFrom?: Date;
  dateTo?: Date;
  branchId?: string;
  certificateNumber?: string;
  officiantName?: string;
  locationOfSacrament?: string;
}

// Mock SacramentalRecord entity
export class SacramentalRecord {
  id: string;
  memberId: string;
  sacramentType: SacramentType;
  dateOfSacrament: Date;
  locationOfSacrament: string;
  officiantName: string;
  officiantId?: string;
  godparent1Name?: string;
  godparent2Name?: string;
  sponsorName?: string;
  witness1Name?: string;
  witness2Name?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  notes?: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock CreateSacramentalRecordInput
export class CreateSacramentalRecordInput {
  memberId: string;
  sacramentType: SacramentType;
  dateOfSacrament: Date;
  locationOfSacrament: string;
  officiantName: string;
  officiantId?: string;
  godparent1Name?: string;
  godparent2Name?: string;
  sponsorName?: string;
  witness1Name?: string;
  witness2Name?: string;
  certificateNumber?: string;
  notes?: string;
  branchId: string;
}

// Mock UpdateSacramentalRecordInput
export class UpdateSacramentalRecordInput {
  id: string;
  sacramentType?: SacramentType;
  dateOfSacrament?: Date;
  locationOfSacrament?: string;
  officiantName?: string;
  officiantId?: string;
  godparent1Name?: string;
  godparent2Name?: string;
  sponsorName?: string;
  witness1Name?: string;
  witness2Name?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  notes?: string;
}
