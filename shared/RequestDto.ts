export interface RequestDto {
  id: string;
  trackGuid: string;
  requestedBy: string;
  ipAddress?: string;
  requestedAt: Date;
  processedAt?: Date;
}
