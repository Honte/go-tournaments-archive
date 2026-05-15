export type Logger = ReturnType<typeof createLogger>;

export function createLogger(title: string) {
  const messages: { message: string; important: boolean }[] = [];

  return {
    log(message: string, important = false) {
      messages.push({ message, important });
    },
    error(message: string) {
      messages.push({ message, important: true });
    },
    print(verbose: boolean) {
      const messagesToPrint = verbose ? messages : messages.filter((m) => m.important);

      if (messagesToPrint.length) {
        console.log(title);
        messagesToPrint.forEach((m) => console.log(m.message));
        console.log();
      }
    },
  };
}
