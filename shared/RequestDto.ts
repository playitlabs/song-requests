export interface RequestDto {
  id: string;
  trackGuid: string;
  requestedBy: string;
  message?: string;
  ipAddress?: string;
  requestedAt: Date;
  processedAt?: Date;
}
