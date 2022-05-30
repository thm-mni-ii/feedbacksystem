export interface CheckerConfig {
  id?: number;
  checkerType: string;
  mainFileUploaded?: boolean;
  secondaryFileUploaded?: boolean;
  ord: number;
  checkerTypeInformation: {
    solution: string;
    showHints: boolean;
    showHintsAt: number;
    showExtendedHints: boolean;
    showExtendedHintsAt: number;
  };
}
