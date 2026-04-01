export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#eee] border-t-brand rounded-full animate-spin" />
    </div>
  );
}
