const MOTES = [
  { left: "8%", delay: "0s", duration: "26s", size: 2 },
  { left: "16%", delay: "4s", duration: "32s", size: 1 },
  { left: "27%", delay: "9s", duration: "28s", size: 2 },
  { left: "39%", delay: "2s", duration: "36s", size: 1 },
  { left: "48%", delay: "12s", duration: "24s", size: 2 },
  { left: "61%", delay: "6s", duration: "30s", size: 1 },
  { left: "73%", delay: "15s", duration: "34s", size: 2 },
  { left: "84%", delay: "8s", duration: "27s", size: 1 },
  { left: "91%", delay: "18s", duration: "31s", size: 2 },
];

export function Forest() {
  return (
    <div className="forest-layer" aria-hidden="true">
      <div className="forest-canopy" />
      <div className="forest-rays" />
      {MOTES.map((mote) => (
        <i
          key={mote.left}
          className="mote"
          style={{
            left: mote.left,
            bottom: "-4%",
            width: mote.size,
            height: mote.size,
            animationDelay: mote.delay,
            animationDuration: mote.duration,
          }}
        />
      ))}
    </div>
  );
}
