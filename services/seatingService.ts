
import type { ClassBatch, GeneratedReport, Student, RoomArrangement, RoomSummary, BatchSummary } from '../types';

const getStandardFromClassName = (className: string): string => {
  const match = className.match(/(\d+)/);
  return match ? `${parseInt(match[1], 10)}th` : 'Unknown';
};

const parseBatchesToStudents = (batches: ClassBatch[]): Map<string, Student[]> => {
  const studentsByStandard = new Map<string, Student[]>();
  const ALL_STANDARDS = ['10th', '9th', '8th', '7th', '6th', '5th'];
  ALL_STANDARDS.forEach(std => studentsByStandard.set(std, []));

  for (const batch of batches) {
    if (batch.isActive === false) continue;
    const [startStr, endStr] = batch.rollRange.split('-').map(s => s.trim());
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end)) continue;

    const absentees = new Set(batch.absentees.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)));
    const standard = getStandardFromClassName(batch.className);

    for (let roll = start; roll <= end; roll++) {
      if (!absentees.has(roll)) {
        studentsByStandard.get(standard)?.push({ roll, className: batch.className, standard });
      }
    }
  }
  return studentsByStandard;
};

const formatBatchSummaries = (students: Student[], batches: ClassBatch[], roomIndex: number, allRooms: Student[][]): BatchSummary[] => {
  const grouped = new Map<string, number[]>();
  students.forEach(s => {
    if (!grouped.has(s.className)) grouped.set(s.className, []);
    grouped.get(s.className)?.push(s.roll);
  });

  return Array.from(grouped.entries()).map(([className, rolls]) => {
    const originalBatch = batches.find(b => b.className === className);
    let relevantAbsentees = '';
    if (originalBatch) {
      const abs = originalBatch.absentees.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const min = Math.min(...rolls);
      const max = Math.max(...rolls);
      relevantAbsentees = abs.filter(a => a >= min && a <= max).sort((a, b) => a - b).join(', ');
    }
    const min = Math.min(...rolls);
    const max = Math.max(...rolls);
    return {
      className,
      rollNumbers: rolls,
      displayRanges: [min === max ? `${min}` : `${min}-${max}`],
      count: rolls.length,
      absentees: relevantAbsentees,
    };
  });
};

export const generateSeating = (batches: ClassBatch[], benchesPerRoom: number): GeneratedReport => {
  const studentsByStandard = parseBatchesToStudents(batches);
  const is10thActive = batches.some(b => b.isActive && getStandardFromClassName(b.className) === '10th');
  const finalRoomsLeft: Student[][] = [];
  const finalRoomsRight: Student[][] = [];
  
  const hasStudentsLeft = () => Array.from(studentsByStandard.values()).some(list => list.length > 0);

  while (hasStudentsLeft()) {
    const currentLeft: Student[] = [];
    const currentRight: Student[] = [];
    const usedInRoom = new Map<string, number>();

    for (let bench = 0; bench < benchesPerRoom; bench++) {
      // Logic for Seat 1 (Left)
      const s1Priority = ['10th', '9th', '8th', '7th', '6th', '5th'];
      const s1 = s1Priority.find(std => studentsByStandard.get(std)!.length > 0 && (usedInRoom.get(std) || 0) < benchesPerRoom);
      
      if (s1) {
        const student = studentsByStandard.get(s1)!.shift()!;
        currentLeft.push(student);
        usedInRoom.set(s1, (usedInRoom.get(s1) || 0) + 1);
        
        // Logic for Seat 2 (Right)
        const partnerMap: Record<string, string> = { '10th': '9th', '9th': '10th', '8th': '7th', '7th': '8th', '6th': '5th', '5th': '6th' };
        let s2: string | undefined;

        if (is10thActive) {
          const pref = partnerMap[s1];
          s2 = (pref && studentsByStandard.get(pref)!.length > 0 && (usedInRoom.get(pref) || 0) < benchesPerRoom) 
               ? pref 
               : s1Priority.find(std => std !== s1 && studentsByStandard.get(std)!.length > 0 && (usedInRoom.get(std) || 0) < benchesPerRoom);
        } else {
          // Without 10th: Chain logic to fill bulks
          s2 = s1Priority.find(std => std !== s1 && studentsByStandard.get(std)!.length > 0 && (usedInRoom.get(std) || 0) < benchesPerRoom);
        }

        if (s2) {
          const student2 = studentsByStandard.get(s2)!.shift()!;
          currentRight.push(student2);
          usedInRoom.set(s2, (usedInRoom.get(s2) || 0) + 1);
        }
      } else {
          // If no s1 but still students left for right side (unlikely but safe)
          const s2Only = s1Priority.find(std => studentsByStandard.get(std)!.length > 0 && (usedInRoom.get(std) || 0) < benchesPerRoom);
          if (s2Only) {
              currentRight.push(studentsByStandard.get(s2Only)!.shift()!);
              usedInRoom.set(s2Only, (usedInRoom.get(s2Only) || 0) + 1);
          }
      }
    }
    finalRoomsLeft.push(currentLeft);
    finalRoomsRight.push(currentRight);
  }

  const arrangement: RoomArrangement[] = finalRoomsLeft.map((leftStudents, idx) => {
    const rightStudents = finalRoomsRight[idx] || [];
    return {
      roomNumber: idx + 1,
      leftSide: formatBatchSummaries(leftStudents, batches, idx, finalRoomsLeft),
      rightSide: formatBatchSummaries(rightStudents, batches, idx, finalRoomsRight),
      leftTotal: leftStudents.length,
      rightTotal: rightStudents.length,
      total: leftStudents.length + rightStudents.length
    };
  });

  const summary: RoomSummary[] = arrangement.map(room => {
    const counts: Record<string, number> = {};
    [...room.leftSide, ...room.rightSide].forEach(b => {
      const std = getStandardFromClassName(b.className);
      counts[std] = (counts[std] || 0) + b.count;
    });
    return { roomNumber: room.roomNumber, total: room.total, counts };
  });

  return { arrangement, summary, maxBenches: benchesPerRoom };
};
