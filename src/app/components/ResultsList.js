import ActivityCard from './ActivityCard';

export default function ResultsList({ activities }) {
  if (!activities.length) {
    return <p>Geen activiteiten gevonden. Probeer een andere zoekopdracht.</p>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {activities.map((activity, index) => (
        <div key={index} style={{ flex: '0 0 calc(33.33% - 14px)' }}>
          <ActivityCard activity={activity} />
        </div>
      ))}
    </div>
  );
}