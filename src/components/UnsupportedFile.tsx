interface UnsupportedFileProps {
  path: string;
}

export function UnsupportedFile({ path }: UnsupportedFileProps) {
  const fileName = path.split('/').pop() || path;
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'unknown';

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-900 gap-3">
      <div className="text-4xl">📦</div>
      <p className="text-neutral-300">{fileName}</p>
      <p className="text-neutral-500 text-sm">
        .{extension} files cannot be previewed
      </p>
    </div>
  );
}
