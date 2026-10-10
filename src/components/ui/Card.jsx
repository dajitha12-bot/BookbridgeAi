function Card({ children, className = "", ...props }) {
  return <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm ${className}`} {...props}>
      {children}
    </div>;
}
export {
  Card
};
