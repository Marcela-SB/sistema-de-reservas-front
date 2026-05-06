export const tableSchedule = [
    { startTime: '07:00', endTime: '07:50', shift: 'M', hourly: 1 },
    { startTime: '07:50', endTime: '08:40', shift: 'M', hourly: 2 },
    { startTime: '08:50', endTime: '09:40', shift: 'M', hourly: 3 },
    { startTime: '09:40', endTime: '10:30', shift: 'M', hourly: 4 },
    { startTime: '10:40', endTime: '11:30', shift: 'M', hourly: 5 },
    { startTime: '11:30', endTime: '12:20', shift: 'M', hourly: 6 },
    { startTime: '13:00', endTime: '13:50', shift: 'T', hourly: 1 },
    { startTime: '13:50', endTime: '14:40', shift: 'T', hourly: 2 },
    { startTime: '14:50', endTime: '15:40', shift: 'T', hourly: 3 },
    { startTime: '15:40', endTime: '16:30', shift: 'T', hourly: 4 },
    { startTime: '16:40', endTime: '17:30', shift: 'T', hourly: 5 },
    { startTime: '17:30', endTime: '18:20', shift: 'T', hourly: 6 },
    { startTime: '18:40', endTime: '19:30', shift: 'N', hourly: 1 },
    { startTime: '19:30', endTime: '20:20', shift: 'N', hourly: 2 },
    { startTime: '20:30', endTime: '21:20', shift: 'N', hourly: 3 },
    { startTime: '21:20', endTime: '22:10', shift: 'N', hourly: 4 },
  ];

export const baseInternalSchedule = (): boolean[][] => 
    Array(7).fill(null).map(() => Array(16).fill(false));
  
  