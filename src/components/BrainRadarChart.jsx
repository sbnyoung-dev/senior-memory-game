import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const CATEGORIES = [
  { key: 'memory',      label: '기억력' },
  { key: 'attention',   label: '주의집중' },
  { key: 'language',    label: '언어능력' },
  { key: 'spatial',     label: '시공간' },
  { key: 'executive',   label: '집행능력' },
  { key: 'calculation', label: '계산능력' },
];

function getColor(avg) {
  if (avg >= 75) return { fill: '#43A047', stroke: '#2E7D32', bg: '#E8F5E9' };
  if (avg >= 50) return { fill: '#FB8C00', stroke: '#E65100', bg: '#FFF3E0' };
  return { fill: '#E53935', stroke: '#B71C1C', bg: '#FFEBEE' };
}

export default function BrainRadarChart({ scores = {}, height = 300 }) {
  const data = CATEGORIES.map(c => ({
    subject: c.label,
    value: Math.round(scores[c.key] || 0),
  }));

  const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const { fill, stroke } = getColor(avg);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke="#DDE2F0" strokeDasharray="4 2" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 14, fontWeight: 700, fill: '#12153D' }}
        />
        <Radar
          dataKey="value"
          fill={fill}
          fillOpacity={0.35}
          stroke={stroke}
          strokeWidth={3}
          dot={{ fill: stroke, r: 5, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
