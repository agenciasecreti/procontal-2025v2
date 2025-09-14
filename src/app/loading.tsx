export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-4 border-b-4" />
        <span className="text-muted-foreground text-lg font-medium">Carregando...</span>
      </div>
    </div>
  );
}
