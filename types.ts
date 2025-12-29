
export interface ClassBatch {
  id: string;
  className: string;
  rollRange: string;
  absentees: string;
  isActive?: boolean;
}

export interface Student {
  roll: number;
  className: string;
  standard: string;
}

export interface BatchSummary {
  className: string;
  rollNumbers: number[];
  displayRanges: string[];
  count: number;
  absentees: string;
}

export interface RoomArrangement {
  roomNumber: number;
  leftSide: BatchSummary[];
  rightSide: BatchSummary[];
  leftTotal: number;
  rightTotal: number;
  total: number;
}

export interface RoomSummary {
  roomNumber: number;
  counts: Record<string, number>;
  total: number;
}

export interface GeneratedReport {
  arrangement: RoomArrangement[];
  summary: RoomSummary[];
  maxBenches: number;
  examName: string;
  academicYear: string;
}
