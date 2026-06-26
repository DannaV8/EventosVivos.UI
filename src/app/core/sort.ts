export type SortDir = 'asc' | 'desc';

export function sortBy<T>(arr: T[], col: keyof T, dir: SortDir): T[] {
  return [...arr].sort((a, b) => {
    const va = a[col];
    const vb = b[col];
    let cmp: number;
    if (typeof va === 'string' && typeof vb === 'string') {
      cmp = va.localeCompare(vb);
    } else if (va instanceof Date && vb instanceof Date) {
      cmp = va.getTime() - vb.getTime();
    } else {
      cmp = (va as number) > (vb as number) ? 1 : (va as number) < (vb as number) ? -1 : 0;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}
