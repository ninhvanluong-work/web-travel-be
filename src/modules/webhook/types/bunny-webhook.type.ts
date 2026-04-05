export enum BunnyVideoStatus {
  Queued = 0,
  Processing = 1,
  Encoding = 2,
  Finished = 3,
  ResolutionFinished = 4,
  Failed = 5,
  PresignedUploadStarted = 6,
  PresignedUploadFinished = 7,
  PresignedUploadFailed = 8,
  CaptionsGenerated = 9,
  TitleOrDescriptionGenerated = 10,
}

export interface BunnyWebhookPayload {
  IsLiveStreamWebhook: boolean;
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
}
