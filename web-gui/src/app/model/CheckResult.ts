export interface CheckResult {
  exitCode: number; // Exit code of the check result 0 is okay
  resultText: string; // The output the check ???
  checkerType: string; // The type of the checker that checked the submission
  configurationId: number; // The configuration id of the checker configuration
}
