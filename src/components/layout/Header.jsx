function Header({ title = "BookBridge Platform" }) {
  return <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 h-16 z-30">
      <div className="text-sm font-bold text-slate-700">{title}</div>
    </header>;
}
export {
  Header
};
