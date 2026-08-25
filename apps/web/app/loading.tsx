export default function Loading() {
  return (
    <div className="page loading-page" aria-busy="true" aria-label="Loading">
      <div className="loading-heading" />
      <div className="loading-subtitle" />
      <div className="grid loading-grid">
        <div className="card loading-card" />
        <div className="card loading-card" />
        <div className="card loading-card" />
      </div>
    </div>
  );
}
