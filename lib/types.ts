export interface ExperimentMeta {
  title: string;
  description: string;
  tags?: string[];
  /** ISO-datum (YYYY-MM-DD), t.ex. "2026-07-31". Sätts alltid för hand. */
  date: string;
}
