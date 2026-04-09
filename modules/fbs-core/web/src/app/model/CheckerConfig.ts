export interface CheckerConfig {
  id?: number;
  checkerType: string;
  mainFileUploaded?: boolean;
  secondaryFileUploaded?: boolean;
  ord: number;
  stagedFeedbackEnabled?: boolean;
  initialOrdLimit?: number;
  checkerTypeInformation: {
    showHints: boolean;
    showHintsAt: number;
    showExtendedHints: boolean;
    showExtendedHintsAt: number;
    disableDistance: boolean;
  };
}
