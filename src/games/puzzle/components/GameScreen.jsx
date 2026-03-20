import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { usePuzzleGame } from '../hooks/usePuzzleGame';

export default function GameScreen({ difficulty, round, totalRounds, timeLeft, onRoundComplete, onQuit }) {
  const {
    emojis, size,
    board, correctCount, totalPieces,
    moves, solved,
    handleSwap, calculateScore,
  } = usePuzzleGame(difficulty);

  const [dragging, setDragging] = useState(null);
  const draggingRef   = useRef(null);
  const handleSwapRef = useRef(handleSwap);
  const cellRefs      = useRef([]);
  const snapRef       = useRef(50);
  const gameAreaRef   = useRef(null);
  const timeLeftRef   = useRef(timeLeft);
  const [areaWidth, setAreaWidth] = useState(300);

  useEffect(() => { draggingRef.current   = dragging;    }, [dragging]);
  useEffect(() => { handleSwapRef.current = handleSwap;  }, [handleSwap]);
  useEffect(() => { timeLeftRef.current   = timeLeft;    }, [timeLeft]);

  // 게임 영역 너비 측정 (반응형)
  useLayoutEffect(() => {
    const el = gameAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setAreaWidth(w > 0 ? w : 300);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 라운드 완료 처리
  useEffect(() => {
    if (solved) {
      const capturedTime = timeLeftRef.current;
      const timer = setTimeout(() => onRoundComplete(calculateScore(capturedTime)), 1200);
      return () => clearTimeout(timer);
    }
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  // 반응형 셀 크기 계산
  const gap            = 10;
  const refPanelWidth  = Math.floor(areaWidth * 0.40);
  const puzzlePanelWidth = areaWidth - refPanelWidth - gap;
  const refCellSize    = Math.max(18, Math.floor((refPanelWidth  - 8  - (size - 1) * 2) / size));
  const puzzleCellSize = Math.max(32, Math.floor((puzzlePanelWidth - 12 - (size - 1) * 4) / size));
  const pieceFontSize  = Math.round(puzzleCellSize * 0.5);
  const refFontSize    = Math.round(refCellSize * 0.6);
  snapRef.current = Math.max(30, puzzleCellSize * 0.9);

  // 가장 가까운 셀 인덱스 반환
  const getNearestCell = useCallback((clientX, clientY, excludeIdx) => {
    let nearestIdx = null;
    let minDist = snapRef.current;
    cellRefs.current.forEach((ref, idx) => {
      if (!ref || idx === excludeIdx) return;
      const rect = ref.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist < minDist) { minDist = dist; nearestIdx = idx; }
    });
    return nearestIdx;
  }, []);

  const handlePointerDown = useCallback((e, cellIdx) => {
    if (solved) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragging({
      cellIdx,
      pieceIdx: board[cellIdx],
      ghostX: e.clientX - offsetX,
      ghostY: e.clientY - offsetY,
      offsetX,
      offsetY,
      hoverCellIdx: null,
    });
  }, [board, solved]);

  useEffect(() => {
    function onMove(e) {
      const d = draggingRef.current;
      if (!d) return;
      const hoverCellIdx = getNearestCell(e.clientX, e.clientY, d.cellIdx);
      setDragging(prev => prev ? {
        ...prev,
        ghostX: e.clientX - prev.offsetX,
        ghostY: e.clientY - prev.offsetY,
        hoverCellIdx,
      } : null);
    }
    function onUp(e) {
      const d = draggingRef.current;
      if (!d) return;
      const nearestIdx = getNearestCell(e.clientX, e.clientY, d.cellIdx);
      if (nearestIdx !== null) handleSwapRef.current(d.cellIdx, nearestIdx);
      setDragging(null);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
  }, [getNearestCell]);

  const progressPct = Math.round((correctCount / totalPieces) * 100);

  // 타이머 색상
  const timerColor = timeLeft <= 10 ? '#E53935' : timeLeft <= 30 ? '#FF8C00' : '#12153D';

  return (
    <div style={styles.container}>
      {/* 완성 오버레이 */}
      {solved && (
        <div style={styles.overlay}>
          <div style={styles.overlayBox}>
            <div style={styles.overlayEmoji}>🎉</div>
            <div style={styles.overlayText}>
              {round === totalRounds ? '모두 완성!' : '완성!'}
            </div>
          </div>
        </div>
      )}

      {/* 드래그 중인 고스트 조각 */}
      {dragging && (
        <div style={{
          position: 'fixed',
          left: dragging.ghostX,
          top:  dragging.ghostY,
          width: puzzleCellSize,
          height: puzzleCellSize,
          boxSizing: 'border-box',
          borderRadius: '10px',
          background: '#DBEAFE',
          border: '3px solid #1F3EE0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: pieceFontSize,
          lineHeight: 1,
          transform: 'scale(1.2)',
          transformOrigin: 'center',
          boxShadow: '0 8px 28px rgba(31,62,224,0.35)',
          zIndex: 1000,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {emojis[dragging.pieceIdx]}
        </div>
      )}

      {/* 상단 통계 */}
      <div style={styles.statsBar}>
        <div style={{ ...styles.statBox, ...(timeLeft <= 10 ? styles.statBoxDanger : timeLeft <= 30 ? styles.statBoxWarn : {}) }}>
          <span style={styles.statLabel}>남은 시간</span>
          <span style={{ ...styles.statValue, color: timerColor }}>{timeLeft}초</span>
        </div>
        <div style={{ ...styles.statBox, ...styles.statBoxAccent }}>
          <span style={styles.statLabel}>라운드</span>
          <span style={{ ...styles.statValue, color: '#1F3EE0' }}>{round}/{totalRounds}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>이동 횟수</span>
          <span style={styles.statValue}>{moves}회</span>
        </div>
      </div>

      {/* 진행 바 */}
      <div style={styles.progressWrap}>
        <div style={styles.progressBg}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>
        <span style={styles.progressLabel}>{correctCount}/{totalPieces} 조각</span>
      </div>

      {/* 게임 영역 */}
      <div ref={gameAreaRef} style={styles.gameArea}>

        {/* 완성 그림 (왼쪽) */}
        <div style={{ ...styles.referenceWrap, width: refPanelWidth }}>
          <p style={styles.sectionLabel}>완성 그림</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, ${refCellSize}px)`,
            gap: '2px',
            background: '#CBD2E8',
            borderRadius: '10px',
            padding: '4px',
          }}>
            {emojis.map((emoji, i) => (
              <div key={i} style={{
                width: refCellSize,
                height: refCellSize,
                background: '#EEF1FE',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: refFontSize,
                lineHeight: 1,
              }}>
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* 퍼즐판 (오른쪽) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.sectionLabel}>퍼즐판</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, ${puzzleCellSize}px)`,
            gap: '4px',
            background: '#CBD2E8',
            borderRadius: '14px',
            padding: '6px',
          }}>
            {board.map((pieceIdx, cellIdx) => {
              const isCorrect  = pieceIdx === cellIdx;
              const isDragging = dragging?.cellIdx === cellIdx;
              const isHover    = dragging?.hoverCellIdx === cellIdx;

              let bg     = '#FFFFFF';
              let border = 'transparent';
              if (isDragging)     { bg = '#F0F4FF'; border = '#A0B4F0'; }
              else if (isCorrect) { bg = '#C8E6C9'; border = '#43A047'; }
              else if (isHover)   { bg = '#FFF3CD'; border = '#FF8C00'; }

              return (
                <div
                  key={cellIdx}
                  ref={el => { cellRefs.current[cellIdx] = el; }}
                  onPointerDown={(e) => handlePointerDown(e, cellIdx)}
                  style={{
                    width: puzzleCellSize,
                    height: puzzleCellSize,
                    boxSizing: 'border-box',
                    background: bg,
                    borderRadius: '10px',
                    border: `3px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isDragging ? pieceFontSize * 0.6 : pieceFontSize,
                    lineHeight: 1,
                    opacity: isDragging ? 0.35 : 1,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    boxShadow: isDragging ? 'none' : '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'background 0.15s, border-color 0.15s',
                    touchAction: 'none',
                    userSelect: 'none',
                  }}
                >
                  {emojis[pieceIdx]}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 안내 텍스트 */}
      <p style={styles.hintText}>
        {dragging ? '놓을 자리로 이동하세요' : '조각을 꾹 눌러서 끌어다 놓으세요'}
      </p>

      <button style={styles.quitBtn} onClick={onQuit}>
        그만하기
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F4F6FF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 20px 48px',
    position: 'relative',
  },
  statsBar: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    maxWidth: '520px',
    marginBottom: '16px',
  },
  statBox: {
    flex: 1,
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '14px 8px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(31,62,224,0.08)',
    border: '2px solid transparent',
  },
  statBoxAccent: {
    border: '2px solid #1F3EE0',
    background: '#EEF1FE',
  },
  statBoxWarn: {
    border: '2px solid #FF8C00',
    background: '#FFF8EE',
  },
  statBoxDanger: {
    border: '2px solid #E53935',
    background: '#FFF0F0',
  },
  statLabel: {
    display: 'block',
    fontSize: '16px',
    color: '#6876A0',
    marginBottom: '4px',
    fontWeight: '600',
  },
  statValue: {
    display: 'block',
    fontSize: '20px',
    fontWeight: '800',
    color: '#12153D',
  },
  progressWrap: {
    width: '100%',
    maxWidth: '520px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  progressBg: {
    flex: 1,
    background: '#E0E5F0',
    borderRadius: '8px',
    height: '14px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#43A047',
    borderRadius: '8px',
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#6876A0',
    flexShrink: 0,
  },
  gameArea: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    maxWidth: '520px',
    alignItems: 'flex-start',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  referenceWrap: { flexShrink: 0, overflow: 'hidden' },
  sectionLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#6876A0',
    marginBottom: '8px',
    textAlign: 'center',
  },
  hintText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6876A0',
    marginBottom: '20px',
    textAlign: 'center',
  },
  quitBtn: {
    padding: '18px 52px',
    background: '#FFFFFF',
    color: '#6876A0',
    fontSize: '20px',
    fontWeight: '700',
    borderRadius: '14px',
    border: '2px solid #E0E5F0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(18,21,61,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  overlayBox: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '44px 64px',
    textAlign: 'center',
    boxShadow: '0 8px 40px rgba(31,62,224,0.2)',
  },
  overlayEmoji: { fontSize: '68px', marginBottom: '14px' },
  overlayText:  { fontSize: '30px', fontWeight: '800', color: '#12153D' },
};
