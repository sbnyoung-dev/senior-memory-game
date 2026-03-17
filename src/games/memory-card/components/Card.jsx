import './Card.css';

export default function Card({ card, onClick, size }) {
  return (
    <div
      className="card-wrapper"
      style={{ width: size, height: size, cursor: card.isMatched ? 'default' : 'pointer' }}
      onClick={() => !card.isMatched && onClick(card.id)}
    >
      <div className={`card-inner ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}>
        <div className="card-face card-back-face" />
        <div className={`card-face card-front-face ${card.isMatched ? 'matched' : ''}`}>
          <span style={{ fontSize: size * 0.45 }}>{card.symbol}</span>
        </div>
      </div>
    </div>
  );
}
