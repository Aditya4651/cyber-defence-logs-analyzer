export default function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Abstract geometric mark - represents defense layers */}
      <rect x="2" y="2" width="24" height="24" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1"/>
      <path d="M7 14L11 10L15 14L19 10L21 12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 18L11 14L15 18L19 14L21 16" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
      <circle cx="21" cy="7" r="1.5" fill="#f59e0b"/>
    </svg>
  );
}
