import dayjs, { Dayjs } from "dayjs";

export const getEnabledDays = (
    start: Dayjs | string | number | null, 
    end: Dayjs | string | number | null, 
    isOneDay: boolean = false
): number[] => {
    if (!start) return [0, 1, 2, 3, 4, 5, 6];

    const s = dayjs(start);
    const e = isOneDay ? s : dayjs(end);

    // Se a data final for inválida ou antes da inicial (e não for dia único)
    if (!isOneDay && (!end || e.isBefore(s))) {
        return [s.day()]; 
    }

    const diff = e.diff(s, 'day');

    // Se o período cobrir uma semana inteira ou mais
    if (diff >= 6) {
        return [0, 1, 2, 3, 4, 5, 6];
    }

    const enabledDays = new Set<number>();
    let current = s;

    // Usamos um Set para evitar duplicatas e o loop para pegar cada dia único
    while (current.isBefore(e) || current.isSame(e, 'day')) {
        enabledDays.add(current.day());
        current = current.add(1, 'day');
    }

    return Array.from(enabledDays);
};