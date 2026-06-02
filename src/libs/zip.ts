import { AsyncZipDeflate, strToU8, Zip, type Zippable, zipSync } from 'fflate';

export function createZip(files: { path: string; content: string }[]) {
  return new ReadableStream({
    start(controller) {
      const zip = new Zip();

      zip.ondata = (err, chunk, final) => {
        if (err) {
          controller.error(err);
          return;
        }

        controller.enqueue(chunk);

        if (final) {
          controller.close();
        }
      };

      for (const file of files) {
        const fileStream = new AsyncZipDeflate(file.path);

        zip.add(fileStream);
        fileStream.push(strToU8(file.content), true);
      }

      zip.end();
    },
  });
}

export function createZipBuffer(files: { path: string; content: string }[]) {
  const input: Zippable = {};

  for (const file of files) {
    input[file.path] = strToU8(file.content);
  }

  return zipSync(input);
}
