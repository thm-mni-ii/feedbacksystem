export interface CheckerConfig {
  id?: number;
  checkerType: string;
  mainFileUploaded?: boolean;
  secondaryFileUploaded?: boolean;
  ord: number;
  solution: string;
  showHints: boolean;
  showHintsAt: number;
  showExtendedHints: boolean;
  showExtendedHintsAt: number;
}
