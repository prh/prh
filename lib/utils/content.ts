export function indexToLineColumn(index: number, content: string) {
    if (index < 0 || content[index] == null) {
        throw new Error(`unbound index value: ${index}`);
    }
    let line = 0;
    let prevLfIndex = 0;
    while (true) {
        const lfIndex = content.indexOf("\n", prevLfIndex + 1);
        if (lfIndex === -1 || index <= lfIndex) {
            return {
                line,
                column: index - (prevLfIndex === 0 ? 0 : prevLfIndex + 1),
            };
        }
        line++;
        prevLfIndex = lfIndex;
    }
}
